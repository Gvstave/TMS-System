'use server';

import { revalidatePath } from 'next/cache';
import { db } from './firebase';
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  getDoc,
  Timestamp,
  query,
  where,
  getDocs,
  writeBatch,
  deleteDoc,
} from 'firebase/firestore';
import type { Project, Task, ProjectStatus, AssignedStudent } from './types';

// The input for the server action must be a plain object.
// The deadline is passed as an ISO string.
type ProjectInputAction = {
  title: string;
  description: string;
  deadline: string; // ISO string
  assignedTo: string[]; // Array of student UIDs
  createdBy: string;
};

export async function createProject(projectInput: ProjectInputAction) {
  try {
    const { deadline, ...restOfProject } = projectInput;

    // Convert the ISO string back to a Firestore Timestamp on the server.
    const deadlineTimestamp = Timestamp.fromDate(new Date(deadline));

    await addDoc(collection(db, 'projects'), {
      ...restOfProject,
      deadline: deadlineTimestamp,
      status: 'Pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProject(projectId: string, userId: string) {
  try {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    const projectTitle = projectSnap.data()?.title || 'a project';
    const batch = writeBatch(db);

    // Find and delete all tasks associated with the project
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('projectId', '==', projectId)
    );
    const tasksSnapshot = await getDocs(tasksQuery);
    tasksSnapshot.forEach((taskDoc) => {
      batch.delete(taskDoc.ref);
    });

    // Delete the project itself
    batch.delete(projectRef);

    await batch.commit();

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus,
  userId: string
) {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      status,
      updatedAt: serverTimestamp(),
    });

    const projectSnapshot = await getDoc(projectRef);

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createTask(
  taskInput: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    const projectRef = doc(db, 'projects', taskInput.projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      throw new Error('Project not found.');
    }

    const projectData = projectSnap.data();

    // Start a batch to perform multiple writes atomically
    const batch = writeBatch(db);

    // 1. Add the new task
    const taskRef = doc(collection(db, 'tasks'));
    batch.set(taskRef, {
      ...taskInput,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 2. If project is 'Pending', update it to 'In Progress'
    if (projectData.status === 'Pending') {
      batch.update(projectRef, {
        status: 'In Progress',
        updatedAt: serverTimestamp(),
      });
    }

    // Commit the batch
    await batch.commit();

    revalidatePath('/dashboard');
    return { success: true, updatedProjectStatus: projectData.status === 'Pending' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTaskStatus(
  taskId: string,
  status: Task['status'],
  userId: string
) {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      status,
      updatedAt: serverTimestamp(),
    });

    const taskSnapshot = await getDoc(taskRef);

    revalidatePath('/dashboard'); // May need to revalidate a more specific path
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
