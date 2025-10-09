'use server';

/**
 * @fileOverview An AI agent that reminds group members to temporarily turn on location sharing when it detects most members are together.
 *
 * - smartLocationSharingReminder - A function that handles the location sharing reminder process.
 * - SmartLocationSharingReminderInput - The input type for the smartLocationSharingReminder function.
 * - SmartLocationSharingReminderOutput - The return type for the smartLocationSharingReminder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartLocationSharingReminderInputSchema = z.object({
  groupName: z.string().describe('The name of the group.'),
  memberNames: z.array(z.string()).describe('The names of the group members.'),
  areMembersTogether: z.boolean().describe('Whether or not the group members are physically close to each other'),
});
export type SmartLocationSharingReminderInput = z.infer<
  typeof SmartLocationSharingReminderInputSchema
>;

const SmartLocationSharingReminderOutputSchema = z.object({
  reminderMessage: z.string().describe('The reminder message to send to group members.'),
});
export type SmartLocationSharingReminderOutput = z.infer<
  typeof SmartLocationSharingReminderOutputSchema
>;

export async function smartLocationSharingReminder(
  input: SmartLocationSharingReminderInput
): Promise<SmartLocationSharingReminderOutput> {
  return smartLocationSharingReminderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartLocationSharingReminderPrompt',
  input: {schema: SmartLocationSharingReminderInputSchema},
  output: {schema: SmartLocationSharingReminderOutputSchema},
  prompt: `You are a helpful assistant that reminds group members to temporarily turn on location sharing when most members are together.\n\nGiven the following information:\n\nGroup Name: {{{groupName}}}\nMember Names: {{#each memberNames}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}\nAre Members Together: {{#if areMembersTogether}}Yes{{else}}No{{/if}}\n\nGenerate a reminder message to encourage members to turn on location sharing for a set period of time (e.g., 30 minutes) so they can easily coordinate their meetup. The message should be friendly and concise.\n\nReminder Message:`,
});

const smartLocationSharingReminderFlow = ai.defineFlow(
  {
    name: 'smartLocationSharingReminderFlow',
    inputSchema: SmartLocationSharingReminderInputSchema,
    outputSchema: SmartLocationSharingReminderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
