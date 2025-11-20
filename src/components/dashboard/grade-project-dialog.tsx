'use client';

import { useState, useEffect } from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { gradeProject } from '@/lib/actions';
import { db } from '@/lib/firebase';
import type { Project, Task, User } from '@/lib/types';
import { generateFeedback } from '@/ai/flows/feedback-flow';
import { Slider } from '../ui/slider';

const gradeSchema = z.object({
  grade: z.coerce
    .number()
    .min(0, 'Grade must be at least 0.')
    .max(100, 'Grade must be at most 100.'),
  feedback: z
    .string()
    .min(10, 'Feedback must be at least 10 characters.')
    .max(2000, 'Feedback is too long.'),
});

type GradeFormValues = z.infer<typeof gradeSchema>;

interface GradeProjectDialogProps {
  project: Project;
  students: User[];
  closeDialog: () => void;
}

export function GradeProjectDialog({
  project,
  students,
  closeDialog,
}: GradeProjectDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<GradeFormValues>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      grade: project.grade ?? undefined,
      feedback: project.feedback ?? '',
    },
  });

  useEffect(() => {
    async function fetchTasks() {
      if (!project.id) return;
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', project.id)
      );
      const snapshot = await getDocs(tasksQuery);
      const fetchedTasks = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Task)
      );
      setTasks(fetchedTasks);
    }
    fetchTasks();
  }, [project.id]);
  
  const handleGenerateFeedback = async () => {
    setIsGenerating(true);
    try {
        const parentTasks = tasks.filter(t => !t.parentId);
        const taskDetails = parentTasks.map(pt => ({
            title: pt.title,
            status: pt.status,
            subtasks: tasks.filter(st => st.parentId === pt.id).map(st => ({ title: st.title, status: st.status }))
        }));

        const result = await generateFeedback({
            projectTitle: project.title,
            projectDescription: project.description,
            tasks: taskDetails,
        });

        form.setValue('feedback', result.feedback);
        form.setValue('grade', result.suggestedGrade);

        toast({
            title: 'AI Feedback Generated',
            description: 'Review the generated feedback and grade, then save.',
        });

    } catch (error) {
        console.error("AI feedback generation failed:", error);
        toast({
            variant: 'destructive',
            title: 'AI Assistant Error',
            description: 'Could not generate feedback at this time.',
        });
    }
    setIsGenerating(false);
  };


  async function onSubmit(values: GradeFormValues) {
    if (!user) return;
    setIsSubmitting(true);
    const result = await gradeProject({
      projectId: project.id,
      grade: values.grade,
      feedback: values.feedback,
      userId: user.uid,
    });
    if (result.success) {
      toast({
        title: 'Project Graded',
        description: `A grade of ${values.grade}% has been assigned.`,
      });
      closeDialog();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
    setIsSubmitting(false);
  }

  const assignedStudentNames = students
    .filter((s) => project.assignedTo.includes(s.uid))
    .map((s) => s.name)
    .join(', ');
    
  const gradeValue = form.watch('grade');

  return (
    <DialogContent className="sm:max-w-xl">
      <DialogHeader>
        <DialogTitle className="font-headline">Grade Project</DialogTitle>
        <DialogDescription>
          Review and grade the project for {assignedStudentNames}.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 space-y-4">
         <Button onClick={handleGenerateFeedback} disabled={isGenerating} variant="outline" className="w-full">
            {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Wand2 className="mr-2 h-4 w-4" />
            )}
            Use AI to Suggest Grade & Feedback
        </Button>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade ({gradeValue}%)</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[field.value ?? 0]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide constructive feedback for the student(s)..."
                      {...field}
                      rows={8}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter>
                <Button type="button" variant="ghost" onClick={closeDialog}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Grade
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </div>
    </DialogContent>
  );
}
