
'use server';

/**
 * @fileOverview Generates a 30-day wellness calendar for a specific remedy.
 *
 * - generateRemedyCalendar - A function that generates the calendar plan.
 * - GenerateRemedyCalendarInput - The input type for the function.
 * - GenerateRemedyCalendarOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateRemedyCalendarInputSchema = z.object({
  remedyTitle: z.string().describe('The title of the herbal remedy.'),
  symptoms: z.string().describe('The original symptoms the remedy is intended to address.'),
});
export type GenerateRemedyCalendarInput = z.infer<typeof GenerateRemedyCalendarInputSchema>;

const DailyPlanSchema = z.object({
    day: z.number().describe('The day number, from 1 to 30.'),
    recommendation: z.string().describe('The specific recommendation for how to use the remedy on this day.'),
    tip: z.string().describe('A general wellness tip for the day.'),
});

const GenerateRemedyCalendarOutputSchema = z.object({
  calendar: z.array(DailyPlanSchema).describe('A 30-day wellness plan.'),
});
export type GenerateRemedyCalendarOutput = z.infer<typeof GenerateRemedyCalendarOutputSchema>;

export async function generateRemedyCalendar(
  input: GenerateRemedyCalendarInput
): Promise<GenerateRemedyCalendarOutput> {
  return generateRemedyCalendarFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRemedyCalendarPrompt',
  input: { schema: GenerateRemedyCalendarInputSchema },
  output: { schema: GenerateRemedyCalendarOutputSchema },
  prompt: `You are a holistic wellness coach. A user has a remedy called "{{remedyTitle}}" to help with "{{symptoms}}".

Create a 30-day wellness calendar plan to guide the user. For each day, provide a clear 'recommendation' for using the remedy and a helpful 'tip' for overall well-being.

The recommendations should guide the user on when and how to take the remedy. The tips should be simple, actionable wellness advice that complements the remedy.

Example for one day:
- recommendation: "Take the remedy once in the morning with breakfast."
- tip: "Drink at least 8 glasses of water today to stay hydrated."

Generate a complete 30-day plan.`,
});

const generateRemedyCalendarFlow = ai.defineFlow(
  {
    name: 'generateRemedyCalendarFlow',
    inputSchema: GenerateRemedyCalendarInputSchema,
    outputSchema: GenerateRemedyCalendarOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
