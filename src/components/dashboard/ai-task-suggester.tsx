'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { Project, Task } from '@/lib/types';
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from '../ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Checkbox } from '../ui/checkbox';
import { createTask } from '@/lib/actions';
import { useAuth } from '@/context/auth-context';
import { generateTaskSuggestions } from '@/lib/ai-actions';

interface AITaskSuggesterProps {
  project: Project;
  existingTasks: Task[];
  onTasksAdded: () => void;
}

const suggestionsSchema = z.object({
  tasks: z.array(z.string()).min(1, 'Please select at least one task to add.'),
});

export function AITaskSuggester({ project, existingTasks, onTasksAdded }: AITaskSuggesterProps) {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedTasks, setSuggestedTasks] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof suggestionsSchema>>({
    resolver: zodResolver(suggestionsSchema),
    defaultValues: {
      tasks: [],
    },
  });

  const handleGenerateTasks = async () => {
    setIsGenerating(true);
    setSuggestedTasks([]);
    form.reset();

    try {
      const result = await generateTaskSuggestions({
        title: project.title,
        description: project.description,
        existingTasks: existingTasks.map(t => t.title),
      });

      if (result.tasks && result.tasks.length > 0) {
        setSuggestedTasks(result.tasks);
        form.setValue('tasks', result.tasks); // Pre-select all
        setIsDialogOpen(true);
      } else {
        toast({
          title: 'No New Suggestions',
          description: 'The AI could not generate any new tasks for this project.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not generate task suggestions.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof suggestionsSchema>) => {
    if (!user) return;
    setIsSubmitting(true);

    let tasksAddedCount = 0;
    try {
      for (const taskTitle of values.tasks) {
        const result = await createTask({
          projectId: project.id,
          title: taskTitle,
          status: 'Pending',
          createdBy: user.uid,
        });
        if(result.success) tasksAddedCount++;
      }
      toast({
        title: `${tasksAddedCount} task(s) added`,
        description: 'The new tasks have been added to your project.',
      });
      onTasksAdded();
      setIsDialogOpen(false);
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: "Failed to add tasks.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleGenerateTasks}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Generate AI Task Suggestions
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Task Suggestions</DialogTitle>
            <DialogDescription>
              Select the tasks you want to add to your project.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="tasks"
                render={() => (
                  <FormItem className="space-y-3 rounded-md border p-4">
                    {suggestedTasks.map((taskTitle) => (
                      <FormField
                        key={taskTitle}
                        control={form.control}
                        name="tasks"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={taskTitle}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(taskTitle)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, taskTitle])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== taskTitle
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{taskTitle}</FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Selected Tasks
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
