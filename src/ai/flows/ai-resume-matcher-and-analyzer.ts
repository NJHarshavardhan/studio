'use server';
/**
 * @fileOverview An AI agent for analyzing candidate resumes against job descriptions.
 *
 * - aiResumeMatcherAndAnalyzer - A function that handles the resume matching and analysis process.
 * - AiResumeMatcherAndAnalyzerInput - The input type for the aiResumeMatcherAndAnalyzer function.
 * - AiResumeMatcherAndAnalyzerOutput - The return type for the aiResumeMatcherAndAnalyzer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const AiResumeMatcherAndAnalyzerInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "A candidate's resume, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. The content of the resume can be text, PDF, or other common document formats."
    ),
  jobDescription: z.string().describe('The job description to match the resume against.'),
});
export type AiResumeMatcherAndAnalyzerInput = z.infer<typeof AiResumeMatcherAndAnalyzerInputSchema>;

// Output Schema
const AiResumeMatcherAndAnalyzerOutputSchema = z.object({
  extractedInfo: z.object({
    skills: z.array(z.string()).describe('A list of key skills extracted from the resume.'),
    experience: z
      .string()
      .describe('A summarized overview of the candidate\'s work experience from the resume.'),
    technologies: z
      .array(z.string())
      .describe('A list of technologies mentioned in the resume.'),
    education: z.string().describe('A summarized overview of the candidate\'s education.'),
    candidateSummary: z
      .string()
      .describe('A concise summary of the candidate\'s professional profile.'),
    strengths: z
      .array(z.string())
      .describe('A list of the candidate\'s key strengths relevant to the job market.'),
    weaknesses: z
      .array(z.string())
      .describe('A list of potential weaknesses or areas for improvement based on the resume.'),
  }),
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe('A percentage score indicating how well the candidate\'s resume matches the job description.'),
  skillGapAnalysis: z
    .array(
      z.object({
        skill: z.string().describe('A skill required by the job description.'),
        reason: z
          .string()
          .describe('Explanation why this skill is a gap for the candidate (e.g., missing, limited experience).'),
      })
    )
    .describe('An analysis of skills present in the job description but missing or weak in the candidate\'s resume.'),
});
export type AiResumeMatcherAndAnalyzerOutput = z.infer<typeof AiResumeMatcherAndAnalyzerOutputSchema>;

export async function aiResumeMatcherAndAnalyzer(
  input: AiResumeMatcherAndAnalyzerInput
): Promise<AiResumeMatcherAndAnalyzerOutput> {
  return aiResumeMatcherAndAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiResumeMatcherAndAnalyzerPrompt',
  input: {schema: AiResumeMatcherAndAnalyzerInputSchema},
  output: {schema: AiResumeMatcherAndAnalyzerOutputSchema},
  prompt: `You are an expert HR analyst and recruitment AI. Your task is to meticulously analyze a candidate's resume and compare it against a provided job description.\n\nCarefully extract the requested information from the resume and then perform a thorough comparison with the job description.\n\n**Job Description:**\n{{{jobDescription}}}\n\n**Candidate Resume:**\n{{media url=resumeDataUri}}\n\nBased on the resume and the job description, perform the following:\n1.  **Extract Information from Resume**: Identify and list key skills, summarize work experience, list technologies, and summarize education. Also, create a concise professional summary for the candidate.\n2.  **Identify Strengths and Weaknesses**: Based on the candidate's profile, identify their main professional strengths and potential weaknesses or areas for development relevant to a typical professional role.\n3.  **Calculate Match Score**: Determine a percentage match score (0-100) indicating how well the candidate's resume aligns with the requirements outlined in the job description. Consider skills, experience, and other relevant criteria.\n4.  **Perform Skill Gap Analysis**: Identify any critical skills mentioned in the job description that are either completely missing from the resume or where the candidate's experience seems weak or insufficient. For each gap, provide a brief reason.\n\nProvide your output in a structured JSON format according to the provided schema.`,
});

const aiResumeMatcherAndAnalyzerFlow = ai.defineFlow(
  {
    name: 'aiResumeMatcherAndAnalyzerFlow',
    inputSchema: AiResumeMatcherAndAnalyzerInputSchema,
    outputSchema: AiResumeMatcherAndAnalyzerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate resume analysis output.');
    }
    return output;
  }
);
