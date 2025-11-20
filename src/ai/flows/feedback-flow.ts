'use server';
/**
 * @fileOverview A flow for generating feedback and a suggested grade for a student's project.
 *
 * - generateFeedback - A function that calls the Genkit flow to get feedback.
 * - GenerateFeedbackInput - The input type for the flow.
 * - GenerateFeedbackOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TaskDetailSchema = z.object({
  title: z.string(),
  status: z.string(),
  subtasks: z.array(z.object({ title: z.string(), status: z.string() })),
});

export const GenerateFeedbackInputSchema = z.object({
  projectTitle: z.string().describe('The title of the project.'),
  projectDescription: z.string().describe('The description of the project.'),
  tasks: z.array(TaskDetailSchema).describe('An array of tasks and their subtasks.'),
});

export const GenerateFeedbackOutputSchema = z.object({
  feedback: z
    .string()
    .describe('Constructive, encouraging, and specific feedback for the student.'),
  suggestedGrade: z
    .number()
    .min(0)
    .max(100)
    .describe('A suggested grade between 0 and 100.'),
});

export type GenerateFeedbackInput = z.infer<typeof GenerateFeedbackInputSchema>;
export type GenerateFeedbackOutput = z.infer<typeof GenerateFeedbackOutputSchema>;

export async function generateFeedback(input: GenerateFeedbackInput): Promise<GenerateFeedbackOutput> {
  return generateFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFeedbackPrompt',
  input: { schema: GenerateFeedbackInputSchema },
  output: { schema: GenerateFeedbackOutputSchema },
  prompt: `You are an experienced and encouraging university lecturer. Your goal is to provide constructive feedback and a suggested grade for a student project.

  Analyze the following project details:
  - Project Title: {{{projectTitle}}}
  - Project Description: {{{projectDescription}}}

  Here is the list of tasks the student completed for the project:
  {{#each tasks}}
  - Task: "{{title}}" (Status: {{status}})
    {{#if subtasks}}
      {{#each subtasks}}
      - Subtask: "{{title}}" (Status: {{status}})
      {{/each}}
    {{/if}}
  {{/each}}

  Based on the project's requirements and the completion status of the tasks and subtasks, please do the following:

  1.  **Generate Feedback**: Write a few paragraphs of constructive feedback. Be specific, positive, and suggest areas for improvement. Address the student directly.
  2.  **Suggest a Grade**: Provide a suggested grade (0-100) that reflects the quality and completeness of the work shown in the tasks. A project with all tasks completed perfectly should be around 90-100. A project with most tasks completed should be 70-89. Adjust based on how many tasks and sub-tasks are incomplete.
  `,
});

const generateFeedbackFlow = ai.defineFlow(
  {
    name: 'generateFeedbackFlow',
    inputSchema: GenerateFeedbackInputSchema,
    outputSchema: GenerateFeedbackOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
