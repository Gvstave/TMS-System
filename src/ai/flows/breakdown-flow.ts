'use server';

/**
 * @fileOverview An AI flow to break down a project into smaller tasks.
 *
 * - breakdownProject - A function that handles the project breakdown process.
 * - BreakdownProjectInput - The input type for the breakdownProject function.
 * - BreakdownProjectOutput - The return type for the breakdownProject function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BreakdownProjectInputSchema = z.object({
  title: z.string().describe('The title of the project.'),
  description: z.string().describe('The description of the project.'),
  existingTasks: z.array(z.string()).optional().describe('A list of tasks that have already been created.'),
});
export type BreakdownProjectInput = z.infer<typeof BreakdownProjectInputSchema>;

const BreakdownProjectOutputSchema = z.object({
  tasks: z
    .array(z.string())
    .describe('A list of suggested task titles to break down the project.'),
});
export type BreakdownProjectOutput = z.infer<
  typeof BreakdownProjectOutputSchema
>;

export async function breakdownProject(
  input: BreakdownProjectInput
): Promise<BreakdownProjectOutput> {
  return breakdownProjectFlow(input);
}

const prompt = ai.definePrompt({
  name: 'breakdownProjectPrompt',
  input: { schema: BreakdownProjectInputSchema },
  output: { schema: BreakdownProjectOutputSchema },
  prompt: `You are an expert project manager for academic settings. Your goal is to break down a project into a list of actionable tasks for students.

  Based on the project title and description below, generate a list of 3-5 concise task titles.

  {{#if existingTasks}}
  The project already has the following tasks:
  {{#each existingTasks}}
  - {{this}}
  {{/each}}
  
  Generate new, distinct tasks that represent the next logical steps to complete the project. Do not repeat any of the existing tasks.
  {{/if}}

  Project Title: {{{title}}}
  Project Description: {{{description}}}

  Return only the list of task titles in the 'tasks' array.`,
});

const breakdownProjectFlow = ai.defineFlow(
  {
    name: 'breakdownProjectFlow',
    inputSchema: BreakdownProjectInputSchema,
    outputSchema: BreakdownProjectOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
