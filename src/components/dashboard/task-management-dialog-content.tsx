'use client';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Project } from '@/lib/types';
import { TaskManagement } from './task-management';

interface TaskManagementDialogContentProps {
  project: Project;
  readOnly: boolean;
}

export function TaskManagementDialogContent({
  project,
  readOnly,
}: TaskManagementDialogContentProps) {
  return (
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>{project.title}</DialogTitle>
      </DialogHeader>
      <TaskManagement project={project} readOnly={readOnly} />
    </DialogContent>
  );
}
