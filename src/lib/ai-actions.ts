'use server';

import {
  breakdownProject,
  type BreakdownProjectInput,
  type BreakdownProjectOutput,
} from '@/ai/flows/breakdown-flow';

export async function generateTaskSuggestions(
  input: BreakdownProjectInput
): Promise<BreakdownProjectOutput> {
  return await breakdownProject(input);
}
