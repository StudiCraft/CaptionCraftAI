import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: 'AIzaSyD-THs_ZOXFHdsIEUTj0Eg_HqH3vMULSco',
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
