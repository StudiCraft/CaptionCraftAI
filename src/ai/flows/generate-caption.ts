// src/ai/flows/generate-caption.ts
'use server';

/**
 * @fileOverview Generates captions of varying lengths for X and Bluesky, optimized for character limits.
 *
 * - generateCaption - A function that generates captions.
 * - GenerateCaptionInput - The input type for the generateCaption function.
 * - GenerateCaptionOutput - The return type for the generateCaption function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateCaptionInputSchema = z.object({
  imageUrl: z.string().describe('The URL of the image to generate captions for.'),
});
export type GenerateCaptionInput = z.infer<typeof GenerateCaptionInputSchema>;

const GenerateCaptionOutputSchema = z.object({
  shortCaption: z.string().describe('A short caption suitable for X (Twitter).'),
  mediumCaption: z.string().describe('A medium-length caption suitable for Bluesky.'),
  longCaption: z.string().describe('A longer caption providing more detail.'),
});
export type GenerateCaptionOutput = z.infer<typeof GenerateCaptionOutputSchema>;

export async function generateCaption(input: GenerateCaptionInput): Promise<GenerateCaptionOutput> {
  return generateCaptionFlow(input);
}

const generateCaptionPrompt = ai.definePrompt({
  name: 'generateCaptionPrompt',
  input: {
    schema: z.object({
      imageUrl: z.string().describe('The URL of the image to generate captions for.'),
    }),
  },
  output: {
    schema: z.object({
      shortCaption: z.string().describe('A short caption suitable for X (Twitter).'),
      mediumCaption: z.string().describe('A medium-length caption suitable for Bluesky.'),
      longCaption: z.string().describe('A longer caption providing more detail.'),
    }),
  },
  prompt: `You are an AI caption generator. Given an image, generate three captions of varying lengths:

- A short caption suitable for X (Twitter), under 280 characters.
- A medium-length caption suitable for Bluesky, under 300 characters.
- A longer caption providing more detail.

Image: {{media url=imageUrl}}

Ensure that the captions are engaging and relevant to the image.
`,
});

const generateCaptionFlow = ai.defineFlow<
  typeof GenerateCaptionInputSchema,
  typeof GenerateCaptionOutputSchema
>({
  name: 'generateCaptionFlow',
  inputSchema: GenerateCaptionInputSchema,
  outputSchema: GenerateCaptionOutputSchema,
},
async input => {
  const {output} = await generateCaptionPrompt(input);
  return output!;
});
