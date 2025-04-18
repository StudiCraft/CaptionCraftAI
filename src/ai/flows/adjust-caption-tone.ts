// src/ai/flows/adjust-caption-tone.ts
'use server';

/**
 * @fileOverview Adjusts the tone of a given caption using AI.
 *
 * - adjustCaptionTone - A function that adjusts the caption tone.
 * - AdjustCaptionToneInput - The input type for the adjustCaptionTone function.
 * - AdjustCaptionToneOutput - The return type for the adjustCaptionTone function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AdjustCaptionToneInputSchema = z.object({
  caption: z.string().describe('The caption to adjust.'),
  tone: z.string().describe('The desired tone of the caption (e.g., funny, serious, informative).'),
});
export type AdjustCaptionToneInput = z.infer<typeof AdjustCaptionToneInputSchema>;

const AdjustCaptionToneOutputSchema = z.object({
  adjustedCaption: z.string().describe('The caption with the adjusted tone.'),
});
export type AdjustCaptionToneOutput = z.infer<typeof AdjustCaptionToneOutputSchema>;

export async function adjustCaptionTone(input: AdjustCaptionToneInput): Promise<AdjustCaptionToneOutput> {
  return adjustCaptionToneFlow(input);
}

const adjustCaptionTonePrompt = ai.definePrompt({
  name: 'adjustCaptionTonePrompt',
  input: {
    schema: z.object({
      caption: z.string().describe('The caption to adjust.'),
      tone: z.string().describe('The desired tone of the caption (e.g., funny, serious, informative).'),
    }),
  },
  output: {
    schema: z.object({
      adjustedCaption: z.string().describe('The caption with the adjusted tone.'),
    }),
  },
  prompt: `Adjust the tone of the following caption to be {{{tone}}}.\n\nCaption: {{{caption}}}\n\nAdjusted Caption:`, 
});

const adjustCaptionToneFlow = ai.defineFlow<
  typeof AdjustCaptionToneInputSchema,
  typeof AdjustCaptionToneOutputSchema
>({
  name: 'adjustCaptionToneFlow',
  inputSchema: AdjustCaptionToneInputSchema,
  outputSchema: AdjustCaptionToneOutputSchema,
}, async input => {
  const {output} = await adjustCaptionTonePrompt(input);
  return output!;
});
