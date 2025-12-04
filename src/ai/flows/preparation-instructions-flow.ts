
'use server';

/**
 * @fileOverview Generates preparation instructions for herbal remedies.
 *
 * - getPreparationInstructions - A function that generates instructions on how to prepare a list of herbs.
 * - PreparationInstructionsInput - The input type for the getPreparationInstructions function.
 * - PreparationInstructionsOutput - The return type for the getPreparationInstructions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PreparationInstructionsInputSchema = z.object({
  herbs: z
    .array(z.string())
    .describe('A list of herbs and fruits for which to generate preparation instructions.'),
  symptoms: z.string().describe('The original symptoms the user entered.'),
});
export type PreparationInstructionsInput = z.infer<
  typeof PreparationInstructionsInputSchema
>;

const PreparationInstructionsOutputSchema = z.object({
  instructions: z
    .string()
    .describe('A single string containing the preparation instructions for the provided herbs and fruits.'),
});
export type PreparationInstructionsOutput = z.infer<
  typeof PreparationInstructionsOutputSchema
>;

export async function getPreparationInstructions(
  input: PreparationInstructionsInput
): Promise<PreparationInstructionsOutput> {
  return preparationInstructionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'preparationInstructionsPrompt',
  input: { schema: PreparationInstructionsInputSchema },
  output: { schema: PreparationInstructionsOutputSchema },
  prompt: `You are a master herbalist. Given a list of herbs and fruits, and the user's original symptoms, provide simple, step-by-step instructions on how to prepare them as a wellness remedy. Combine them into a single recipe if possible.

User's Symptoms: {{{symptoms}}}

Herbs and Fruits:
{{#each herbs}}
- {{{this}}}
{{/each}}

Format the output with the following structure:
**Title:** [Give the remedy a simple, descriptive name]

**Remedy Description:** [Provide a one-sentence description of what this remedy is for, based on the herbs.]

**Mixing Method:** [Specify the base for the mixture, e.g., Water-based, Alcohol-based, Oil-based, Poultice, etc.]

**Ingredients:**
- [List each ingredient with precise measurements if applicable]

**Preparation:**
1. [First step of preparation]
2. [Second step]
3. [And so on...]

**Direction for Use:** [If the user's symptoms are NOT skin or hair related, explain how to use the remedy here. Be very specific about the method: should it be consumed (drunk), or applied topically (rubbed on skin, applied to hair)? Include details on dosage, frequency, and best time for use (e.g., in the morning, before bed, with meals).]

**IF AND ONLY IF the user's symptoms appear to be related to skin or hair, provide TWO sets of directions instead of one "Direction for Use" section:**

**Directions for Internal Use:** [Explain how to consume the remedy as a drink or food. Include dosage, frequency, and timing.]

**Directions for External Use:** [Explain how to apply the remedy topically to the skin or hair. Include method (e.g., as a paste, rinse, or oil), frequency, and how long to leave it on.]


**Notes:** (Optional)
- [Any additional tips, storage instructions, or information]`,
});

const preparationInstructionsFlow = ai.defineFlow(
  {
    name: 'preparationInstructionsFlow',
    inputSchema: PreparationInstructionsInputSchema,
    outputSchema: PreparationInstructionsOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
