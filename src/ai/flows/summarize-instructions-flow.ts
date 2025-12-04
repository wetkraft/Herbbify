'use server';

/**
 * @fileOverview Generates a short summary of preparation instructions.
 *
 * - summarizeInstructions - A function that generates a one-sentence summary of instructions.
 * - SummarizeInstructionsInput - The input type for the summarizeInstructions function.
 * - SummarizeInstructionsOutput - The return type for the summarizeInstructions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeInstructionsInputSchema = z.object({
  instructions: z.string().describe('The detailed instructions to be summarized.'),
  herbs: z.array(z.string()).describe('The list of herbs in the remedy.'),
});
export type SummarizeInstructionsInput = z.infer<typeof SummarizeInstructionsInputSchema>;

const SummarizeInstructionsOutputSchema = z.object({
  summary: z.string().describe('A single, concise sentence summarizing the preparation method.'),
});
export type SummarizeInstructionsOutput = z.infer<typeof SummarizeInstructionsOutputSchema>;

export async function summarizeInstructions(
  input: SummarizeInstructionsInput
): Promise<SummarizeInstructionsOutput> {
  return summarizeInstructionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeInstructionsPrompt',
  input: { schema: SummarizeInstructionsInputSchema },
  output: { schema: SummarizeInstructionsOutputSchema },
  prompt: `You are an expert at making complex instructions simple. Based on the following herbs and detailed instructions, generate a single, concise summary sentence that clearly explains the primary action (e.g., "Steep the herbs in hot water," or "Blend the fruits into a smoothie."). Keep it very short.

Herbs:
{{#each herbs}}
- {{{this}}}
{{/each}}

Instructions:
{{{instructions}}}
`,
});

const summarizeInstructionsFlow = ai.defineFlow(
  {
    name: 'summarizeInstructionsFlow',
    inputSchema: SummarizeInstructionsInputSchema,
    outputSchema: SummarizeInstructionsOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
