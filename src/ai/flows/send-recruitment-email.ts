'use server';
/**
 * @fileOverview A Genkit flow for generating professional recruitment emails.
 *
 * - sendRecruitmentEmail - Function to generate and "send" (log) recruitment emails.
 * - SendEmailInput - Input schema for email generation.
 * - SendEmailOutput - Output schema confirming the "send" operation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SendEmailInputSchema = z.object({
  candidateName: z.string(),
  candidateEmail: z.string(),
  type: z.enum(['interview_invite', 'interview_thank_you', 'rejection']),
  jobTitle: z.string().optional().default('Software Engineer'),
  additionalContext: z.string().optional(),
});

export type SendEmailInput = z.infer<typeof SendEmailInputSchema>;

const SendEmailOutputSchema = z.object({
  success: z.boolean(),
  subject: z.string(),
  body: z.string(),
  timestamp: z.string(),
});

export type SendEmailOutput = z.infer<typeof SendEmailOutputSchema>;

export async function sendRecruitmentEmail(input: SendEmailInput): Promise<SendEmailOutput> {
  return sendRecruitmentEmailFlow(input);
}

const emailPrompt = ai.definePrompt({
  name: 'emailPrompt',
  input: { schema: SendEmailInputSchema },
  output: { schema: z.object({ subject: z.string(), body: z.string() }) },
  prompt: `You are an expert HR communications assistant. Generate a professional email for a candidate.

**Candidate Name:** {{{candidateName}}}
**Email Type:** {{{type}}}
**Job Title:** {{{jobTitle}}}
{{#if additionalContext}}**Context:** {{{additionalContext}}}{{/if}}

Guidelines:
- If 'interview_invite': Be enthusiastic. Mention that their resume was a great match and invite them to our AI screening portal.
- If 'interview_thank_you': Thank them for completing the AI interview. Mention that the HR team will review the transcript and score shortly.
- If 'rejection': Be polite, professional, and encouraging.

Return a professional subject line and the email body.`,
});

const sendRecruitmentEmailFlow = ai.defineFlow(
  {
    name: 'sendRecruitmentEmailFlow',
    inputSchema: SendEmailInputSchema,
    outputSchema: SendEmailOutputSchema,
  },
  async (input) => {
    const { output } = await emailPrompt(input);

    if (!output) {
      throw new Error('Failed to generate email content.');
    }

    // SIMULATION: In a real app, you would use a mail provider like SendGrid here.
    // example: await sgMail.send({ to: input.candidateEmail, ...output });
    
    console.log('--- SIMULATED EMAIL SENT ---');
    console.log(`To: ${input.candidateEmail}`);
    console.log(`Subject: ${output.subject}`);
    console.log(`Body: ${output.body}`);
    console.log('----------------------------');

    return {
      success: true,
      subject: output.subject,
      body: output.body,
      timestamp: new Date().toISOString(),
    };
  }
);
