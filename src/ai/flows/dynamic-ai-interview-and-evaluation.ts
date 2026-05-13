'use server';
/**
 * @fileOverview This file implements an AI-driven interview system.
 * It dynamically generates interview questions based on job descriptions and candidate resumes,
 * evaluates candidate answers, and provides an interview summary, score, and transcript.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DynamicAIInterviewInputSchema = z.object({
  jobDescription: z.string().describe('The detailed job description for the role.'),
  resumeText: z.string().describe('The full text content of the candidate\'s resume.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string()
  })).describe('The historical conversation between the interviewer AI and the candidate.'),
});
export type DynamicAIInterviewInput = z.infer<typeof DynamicAIInterviewInputSchema>;

const DynamicAIInterviewOutputSchema = z.object({
  nextQuestion: z.string().optional().describe('The next interview question to ask the candidate.'),
  interviewSummary: z.string().optional().describe('A summary of the candidate\'s performance.'),
  interviewScore: z.number().optional().describe('A numerical score (0-100) reflecting performance.'),
  transcript: z.string().optional().describe('The full transcript of the interview.'),
  interviewCompleted: z.boolean().describe('True if the interview is concluded.'),
});
export type DynamicAIInterviewOutput = z.infer<typeof DynamicAIInterviewOutputSchema>;

export async function dynamicAIInterviewAndEvaluation(input: DynamicAIInterviewInput): Promise<DynamicAIInterviewOutput> {
  return dynamicAIInterviewAndEvaluationFlow(input);
}

const dynamicAIInterviewPrompt = ai.definePrompt({
  name: 'dynamicAIInterviewPrompt',
  input: { schema: DynamicAIInterviewInputSchema },
  output: { schema: DynamicAIInterviewOutputSchema },
  prompt: `You are an expert HR interviewer AI conducting a screening session.

**YOUR OBJECTIVE:**
You must conversationally gather the following specific information from the candidate:
1. A comprehensive introduction ("Tell me about yourself").
2. Total years of relevant professional experience.
3. Their current CTC (Annual Compensation) and Expected CTC.
4. Motivation for applying and fit for this specific job description.

**CONVERSATION RULES:**
- If the history is empty, start with a warm greeting and ask them to introduce themselves.
- Progress through the required HR details (Experience, Salary, Motivation) naturally.
- After gathering the basic HR details, ask 1-2 behavioral or technical questions based on the Job Description and Resume.
- Once all key info (Introduction, Experience, CTC, Motivation) is gathered, conclude the interview.
- Do NOT be repetitive. If they already answered a point, move to the next.

**Job Description:**
{{{jobDescription}}}

**Candidate Resume Context:**
{{{resumeText}}}

**Current Conversation History:**
{{#each conversationHistory}}
  {{{this.role}}}: {{{this.content}}}
{{/each}}

Provide your response in JSON format. If the interview is finished, set interviewCompleted to true and provide the summary, transcript, and score.`
});

const dynamicAIInterviewAndEvaluationFlow = ai.defineFlow(
  {
    name: 'dynamicAIInterviewAndEvaluationFlow',
    inputSchema: DynamicAIInterviewInputSchema,
    outputSchema: DynamicAIInterviewOutputSchema,
  },
  async (input) => {
    const { output } = await dynamicAIInterviewPrompt(input);
    if (!output) throw new Error('AI interview prompt returned no output.');
    return output;
  }
);
