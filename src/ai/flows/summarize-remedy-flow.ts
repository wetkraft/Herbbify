'use server';

/**
 * @fileOverview Generates a short summary of a remedy.
 *
 * - summarizeRemedy - A function that generates a one-sentence summary of what a remedy is for.
 * - SummarizeRemedyInput - The input type for the summarizeRemedy function.
 * - SummarizeRemedyOutput - The return type for the summarizeRemedy function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeRemedyInputSchema = z.object({
  symptoms: z.string().describe('The symptoms the remedy is for.'),
  herbs: z.array(z.string()).describe('The list of herbs in the remedy.'),
});
export type SummarizeRemedyInput = z.infer<typeof SummarizeRemedyInputSchema>;

const SummarizeRemedyOutputSchema = z.object({
  remedyDescription: z.string().describe('A single, concise sentence describing what the remedy helps with.'),
});
export type SummarizeRemedyOutput = z.infer<typeof SummarizeRemedyOutputSchema>;

export async function summarizeRemedy(
  input: SummarizeRemedyInput
): Promise<SummarizeRemedyOutput> {
  return summarizeRemedyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeRemedyPrompt',
  input: { schema: SummarizeRemedyInputSchema },
  output: { schema: SummarizeRemedyOutputSchema },
  prompt: `You are an expert at making complex medical information simple. Based on the following symptoms and herbs, generate a single, compelling but concise sentence that describes what the remedy helps with (e.g., "A soothing blend to ease digestive discomfort and bloating," or "A powerful mix to support a healthy immune response.").

Symptoms: {{{symptoms}}}

Herbs:
{{#each herbs}}
- {{{this}}}
{{/each}}
`,
});

const summarizeRemedyFlow = ai.defineFlow(
  {
    name: 'summarizeRemedyFlow',
    inputSchema: SummarizeRemedyInputSchema,
    outputSchema: SummarizeRemedyOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
