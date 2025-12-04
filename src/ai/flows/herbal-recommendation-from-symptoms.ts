'use server';

/**
 * @fileOverview Herbal recommendation AI agent.
 *
 * - herbalRecommendationFromSymptoms - A function that handles the herbal recommendation process from symptoms.
 * - HerbalRecommendationFromSymptomsInput - The input type for the herbalRecommendationFromSymptoms function.
 * - HerbalRecommendationFromSymptomsOutput - The return type for the herbalRecommendationFromSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HerbalRecommendationFromSymptomsInputSchema = z.object({
  symptoms: z.string().describe('The symptoms the user is experiencing.'),
  age: z.string().describe('The age range of the user.'),
  gender: z.string().describe('The gender of the user (Male, Female, or Prefer not to say).'),
});
export type HerbalRecommendationFromSymptomsInput = z.infer<
  typeof HerbalRecommendationFromSymptomsInputSchema
>;

const HerbalRecommendationFromSymptomsOutputSchema = z.object({
  recommendations: z
    .array(
      z.object({
        name: z
          .string()
          .describe('The name of the herb or fruit, without any scientific names in parentheses.'),
        description: z
          .string()
          .describe(
            'A single, concise sentence explaining how the herb/fruit helps with the given symptoms.'
          ),
      })
    )
    .describe(
      'A list of 5 common, easily accessible mixed herbs and fruits as recommendations for the symptoms.'
    ),
  warnings: z.array(z.string()).describe('Any warnings or precautions.'),
});
export type HerbalRecommendationFromSymptomsOutput = z.infer<
  typeof HerbalRecommendationFromSymptomsOutputSchema
>;

export async function herbalRecommendationFromSymptoms(
  input: HerbalRecommendationFromSymptomsInput
): Promise<HerbalRecommendationFromSymptomsOutput> {
  return herbalRecommendationFromSymptomsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'herbalRecommendationFromSymptomsPrompt',
  input: {schema: HerbalRecommendationFromSymptomsInputSchema},
  output: {schema: HerbalRecommendationFromSymptomsOutputSchema},
  prompt: `You are a traditional herbalist specializing in herbal remedies.

  Based on the user's symptoms and personal information, you will suggest a mix of 5 common, easily accessible herbs and fruits.
  If the symptoms appear to be related to skin or hair, try to recommend herbs that can be used both internally and externally.
  For each recommendation, provide its name and a single, concise sentence explaining how the herb/fruit helps with the given symptoms. Do not include scientific names in parentheses in the name.
  Take the user's age and gender into account to provide a more personalized and safe recommendation.
  Also provide any warnings or precautions, if any.

  User Information:
  - Age: {{age}}
  - Gender: {{gender}}
  - Symptoms: {{{symptoms}}}`,
});

const herbalRecommendationFromSymptomsFlow = ai.defineFlow(
  {
    name: 'herbalRecommendationFromSymptomsFlow',
    inputSchema: HerbalRecommendationFromSymptomsInputSchema,
    outputSchema: HerbalRecommendationFromSymptomsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
