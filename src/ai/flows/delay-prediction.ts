// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview Predicts potential train delays and suggests alternative routes.
 *
 * - predictDelay - Predicts train delays and suggests alternative routes.
 * - PredictDelayInput - The input type for the predictDelay function.
 * - PredictDelayOutput - The return type for the predictDelay function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictDelayInputSchema = z.object({
  origin: z.string().describe('The origin station.'),
  destination: z.string().describe('The destination station.'),
  departureTime: z.string().describe('The departure time.'),
});
export type PredictDelayInput = z.infer<typeof PredictDelayInputSchema>;

const PredictDelayOutputSchema = z.object({
  delayPrediction: z
    .string()
    .describe('The predicted delay in minutes.'),
  alternativeRoutes: z
    .string()
    .describe('Suggested alternative routes.'),
  confidenceLevel: z
    .string()
    .describe('The confidence level of the prediction.'),
});
export type PredictDelayOutput = z.infer<typeof PredictDelayOutputSchema>;

export async function predictDelay(input: PredictDelayInput): Promise<PredictDelayOutput> {
  return predictDelayFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictDelayPrompt',
  input: {schema: PredictDelayInputSchema},
  output: {schema: PredictDelayOutputSchema},
  prompt: `You are a train delay prediction expert. You are given the origin, destination and departure time of a train.
  You will predict the potential delay, suggest alternative routes, and provide a confidence level for your prediction.
  Origin: {{{origin}}}
  Destination: {{{destination}}}
  Departure Time: {{{departureTime}}}`,
});

const predictDelayFlow = ai.defineFlow(
  {
    name: 'predictDelayFlow',
    inputSchema: PredictDelayInputSchema,
    outputSchema: PredictDelayOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
