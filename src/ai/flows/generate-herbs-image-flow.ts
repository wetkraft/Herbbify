
'use server';

/**
 * @fileOverview Generates an image of herbs from a text description.
 *
 * - generateHerbsImage - A function that generates an image of herbs.
 * - GenerateHerbsImageInput - The input type for the generateHerbsImage function.
 * - GenerateHerbsImageOutput - The return type for the generateHerbsImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const GenerateHerbsImageInputSchema = z.object({
  herbs: z.array(z.string()).describe('A list of herbs to generate an image for.'),
  instructions: z.string().describe('Instructions on how to prepare the herbs.'),
});
export type GenerateHerbsImageInput = z.infer<typeof GenerateHerbsImageInputSchema>;

const GenerateHerbsImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateHerbsImageOutput = z.infer<typeof GenerateHerbsImageOutputSchema>;

export async function generateHerbsImage(
  input: GenerateHerbsImageInput
): Promise<GenerateHerbsImageOutput> {
  return generateHerbsImageFlow(input);
}

const generateHerbsImageFlow = ai.defineFlow(
  {
    name: 'generateHerbsImageFlow',
    inputSchema: GenerateHerbsImageInputSchema,
    outputSchema: GenerateHerbsImageOutputSchema,
  },
  async input => {
    const prompt = `A realistic, clean, studio photograph of the herbal ingredients: ${input.herbs
      .map(herb => herb.replace(/\s\(.*\)/, ''))
      .join(', ')}. The ingredients are arranged on a dark wood surface. The background should be neutral. Soft, natural lighting.`;

    const { media } = await ai.generate({
      model: googleAI.model('imagen-4.0-fast-generate-001'),
      prompt,
      config: {
        responseModalities: ['IMAGE'],
      },
      negativePrompt: 'text, writing, labels, logos, watermarks, words',
    });

    if (!media.url) {
      throw new Error('Image generation failed.');
    }

    return { imageUrl: media.url };
  }
);
