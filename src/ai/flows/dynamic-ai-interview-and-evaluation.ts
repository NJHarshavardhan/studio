'use server';
/**
 * @fileOverview This file implements an AI-driven interview system.
 * It dynamically generates interview questions based on job descriptions and candidate resumes,
 * evaluates candidate answers, and provides an interview summary, score, and transcript.
 *
 * - dynamicAIInterviewAndEvaluation - A function that handles the AI interview process.
 * - DynamicAIInterviewInput - The input type for the dynamicAIInterviewAndEvaluation function.
 * - DynamicAIInterviewOutput - The return type for the dynamicAIInterviewAndEvaluation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DynamicAIInterviewInputSchema = z.object({
  jobDescription: z.string().describe('The detailed job description for the role.'),
  resumeText: z.string().describe('The full text content of the candidate\'s resume.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string()
  })).describe('The historical conversation between the interviewer AI and the candidate, used to maintain context and evaluate answers.'),
});
export type DynamicAIInterviewInput = z.infer<typeof DynamicAIInterviewInputSchema>;

const DynamicAIInterviewOutputSchema = z.object({
  nextQuestion: z.string().optional().describe('The next interview question to ask the candidate.'),
  interviewSummary: z.string().optional().describe('A summary of the candidate\'s performance and key points discussed in the interview.'),
  interviewScore: z.number().optional().describe('A numerical score (0-100) reflecting the candidate\'s overall performance in the interview.'),
  transcript: z.string().optional().describe('The full transcript of the interview conversation.'),
  interviewCompleted: z.boolean().describe('True if the interview is concluded and evaluation is complete, false otherwise.'),
});
export type DynamicAIInterviewOutput = z.infer<typeof DynamicAIInterviewOutputSchema>;

export async function dynamicAIInterviewAndEvaluation(input: DynamicAIInterviewInput): Promise<DynamicAIInterviewOutput> {
  return dynamicAIInterviewAndEvaluationFlow(input);
}

const dynamicAIInterviewPrompt = ai.definePrompt({
  name: 'dynamicAIInterviewPrompt',
  input: { schema: DynamicAIInterviewInputSchema },
  output: { schema: DynamicAIInterviewOutputSchema },
  prompt: `You are an expert HR interviewer AI. Your task is to conduct a structured interview with a candidate for a job, evaluate their responses, and finally provide a comprehensive summary and score.

Follow these steps:
1.  Analyze the provided Job Description and Candidate\'s Resume.
2.  If the conversation history is empty or only contains your initial greeting, start by asking an introductory interview question relevant to both the job and resume.
3.  If the conversation history contains candidate responses, evaluate their last response against the job requirements and their resume.
4.  Determine if enough information has been gathered to make a hiring assessment (e.g., after 3-5 substantive exchanges, or if the candidate explicitly states they are done, or if you feel sufficient depth has been reached).
5.  If the interview needs to continue, generate the *next* logical interview question to elicit more relevant information. The question should be concise and direct. Set "interviewCompleted" to false.
6.  If the interview should conclude, set "interviewCompleted" to true. Then, generate:
    - "interviewSummary": A detailed summary of the candidate\'s performance, highlighting strengths, weaknesses, and overall fit for the role based on the job description and resume.
    - "interviewScore": A numerical score from 0 to 100, reflecting the candidate\'s overall performance.
    - "transcript": The complete, unedited conversation history formatted as a string (e.g., "model: Hello, tell me about yourself.\nuser: I am a software engineer...\n").

**Job Description:**
\`\`\`
{{{jobDescription}}}
\`\`\`

**Candidate\'s Resume:**
\`\`\`
{{{resumeText}}}
\`\`\`

**Current Conversation History (Role: Content):**
{{#each conversationHistory}}
  {{this.role}}: {{this.content}}
{{/each}}

Provide your response in JSON format.
`
});

const dynamicAIInterviewAndEvaluationFlow = ai.defineFlow(
  {
    name: 'dynamicAIInterviewAndEvaluationFlow',
    inputSchema: DynamicAIInterviewInputSchema,
    outputSchema: DynamicAIInterviewOutputSchema,
  },
  async (input) => {
    // Call the prompt with the input. The prompt is designed to handle the conversational logic.
    const { output } = await dynamicAIInterviewPrompt(input);

    if (!output) {
      throw new Error('AI interview prompt returned no output.');
    }
    return output;
  }
);
