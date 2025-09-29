// src/ai/flows/personalized-alerts.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for sending personalized alerts to users about train delays or cancellations on their saved routes.
 *
 * - `sendPersonalizedAlert`: Sends personalized alerts to users about delays or cancellations for saved routes.
 * - `PersonalizedAlertsInput`: The input type for the `sendPersonalizedAlert` function.
 * - `PersonalizedAlertsOutput`: The return type for the `sendPersonalizedAlert` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedAlertsInputSchema = z.object({
  userId: z.string().describe('The ID of the user to send the alert to.'),
  routeId: z.string().describe('The ID of the saved route.'),
  delayStatus: z.string().describe('The current delay status of the train route.'),
  estimatedDelayTime: z.string().optional().describe('The estimated delay time, if applicable.'),
});
export type PersonalizedAlertsInput = z.infer<typeof PersonalizedAlertsInputSchema>;

const PersonalizedAlertsOutputSchema = z.object({
  alertSent: z.boolean().describe('Indicates whether the alert was successfully sent.'),
  message: z.string().describe('A message confirming the alert details.'),
});
export type PersonalizedAlertsOutput = z.infer<typeof PersonalizedAlertsOutputSchema>;

export async function sendPersonalizedAlert(input: PersonalizedAlertsInput): Promise<PersonalizedAlertsOutput> {
  return personalizedAlertsFlow(input);
}

const personalizedAlertsPrompt = ai.definePrompt({
  name: 'personalizedAlertsPrompt',
  input: {schema: PersonalizedAlertsInputSchema},
  output: {schema: PersonalizedAlertsOutputSchema},
  prompt: `You are a helpful assistant that sends personalized push notifications to users about delays or cancellations for their saved train routes.

  User ID: {{{userId}}}
  Route ID: {{{routeId}}}
  Delay Status: {{{delayStatus}}}
  Estimated Delay Time: {{{estimatedDelayTime}}}

  Send a personalized alert to the user with the following information.
  Indicate in the message if the train is delayed or cancelled.`,
});

const personalizedAlertsFlow = ai.defineFlow(
  {
    name: 'personalizedAlertsFlow',
    inputSchema: PersonalizedAlertsInputSchema,
    outputSchema: PersonalizedAlertsOutputSchema,
  },
  async input => {
    const {output} = await personalizedAlertsPrompt(input);
    return output!;
  }
);
