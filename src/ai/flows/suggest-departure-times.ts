'use server';

/**
 * @fileOverview A departure time suggestion AI agent.
 *
 * - suggestDepartureTimes - A function that suggests optimal departure times.
 * - SuggestDepartureTimesInput - The input type for the suggestDepartureTimes function.
 * - SuggestDepartureTimesOutput - The return type for the suggestDepartureTimes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDepartureTimesInputSchema = z.object({
  origin: z.string().describe('The origin of the trip.'),
  destination: z.string().describe('The destination of the trip.'),
});
export type SuggestDepartureTimesInput = z.infer<typeof SuggestDepartureTimesInputSchema>;

const SuggestDepartureTimesOutputSchema = z.object({
  suggestedDepartureTimes: z
    .array(z.string())
    .describe('An array of suggested departure times.'),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the suggested departure times, considering traffic conditions.'
    ),
});
export type SuggestDepartureTimesOutput = z.infer<typeof SuggestDepartureTimesOutputSchema>;

export async function suggestDepartureTimes(
  input: SuggestDepartureTimesInput
): Promise<SuggestDepartureTimesOutput> {
  return suggestDepartureTimesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDepartureTimesPrompt',
  input: {schema: SuggestDepartureTimesInputSchema},
  output: {schema: SuggestDepartureTimesOutputSchema},
  prompt: `Suggest optimal departure times from {{origin}} to {{destination}} based on typical traffic conditions. Consider rush hour and other factors that may cause delays. Provide a list of suggested departure times, and explain the reasoning behind your suggestions.\n\nFormat the output as a JSON object with 'suggestedDepartureTimes' as an array of strings and 'reasoning' as a string.`,
});

const suggestDepartureTimesFlow = ai.defineFlow(
  {
    name: 'suggestDepartureTimesFlow',
    inputSchema: SuggestDepartureTimesInputSchema,
    outputSchema: SuggestDepartureTimesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
