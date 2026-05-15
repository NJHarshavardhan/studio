
'use server';
/**
 * @fileOverview A Genkit flow for generating professional WhatsApp recruitment updates.
 *
 * - sendWhatsAppUpdate - Function to generate and "send" (log) WhatsApp messages.
 * - WhatsAppInput - Input schema for message generation.
 * - WhatsAppOutput - Output schema confirming the "send" operation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WhatsAppInputSchema = z.object({
  candidateName: z.string().describe("Full name of the candidate."),
  candidatePhone: z.string().describe("Phone number of the candidate."),
  type: z.enum(['shortlisted', 'interview_ready', 'hired', 'rejected']).describe("Purpose of the message."),
  jobTitle: z.string().optional().default('Software Engineer'),
});

export type WhatsAppInput = z.infer<typeof WhatsAppInputSchema>;

const WhatsAppOutputSchema = z.object({
  success: z.boolean(),
  body: z.string().describe("The generated message body."),
  timestamp: z.string(),
});

export type WhatsAppOutput = z.infer<typeof WhatsAppOutputSchema>;

export async function sendWhatsAppUpdate(input: WhatsAppInput): Promise<WhatsAppOutput> {
  return sendWhatsAppUpdateFlow(input);
}

const whatsappPrompt = ai.definePrompt({
  name: 'whatsappPrompt',
  input: { schema: WhatsAppInputSchema },
  output: { schema: z.object({ body: z.string() }) },
  prompt: `You are an expert HR recruitment assistant. Generate a concise, friendly, and professional WhatsApp message.
WhatsApp messages should be direct, use emojis where appropriate, and include a clear call to action.

**Candidate Name:** {{{candidateName}}}
**Update Type:** {{{type}}}
**Job Title:** {{{jobTitle}}}

Guidelines:
- If 'shortlisted': Congratulate them on passing the AI screening. Mention their profile was a great match for {{{jobTitle}}}.
- If 'interview_ready': Inform them that their technical session is ready.
- Keep it under 200 characters if possible.
- Use a friendly but professional tone.`,
});

const sendWhatsAppUpdateFlow = ai.defineFlow(
  {
    name: 'sendWhatsAppUpdateFlow',
    inputSchema: WhatsAppInputSchema,
    outputSchema: WhatsAppOutputSchema,
  },
  async (input) => {
    const { output } = await whatsappPrompt(input);

    if (!output) {
      throw new Error('Failed to generate WhatsApp content.');
    }

    // SIMULATION: Log the message. In production, integrate with Twilio or WhatsApp Cloud API.
    console.log('--- SIMULATED WHATSAPP SENT ---');
    console.log(`To: ${input.candidatePhone}`);
    console.log(`Message: ${output.body}`);
    console.log('-------------------------------');

    return {
      success: true,
      body: output.body,
      timestamp: new Date().toISOString(),
    };
  }
);
