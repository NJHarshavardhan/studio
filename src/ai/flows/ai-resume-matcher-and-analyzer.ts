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
    name: z.string().describe("The candidate's full name."),
    email: z.string().describe("The candidate's email address."),
    phone: z.string().describe("The candidate's phone number."),
    yearsOfExperience: z.coerce.number().describe('The total number of years of professional experience as a number (e.g. 5).'),
    skills: z.array(z.string()).describe('A list of key skills extracted from the resume.'),
    experience: z
      .string()
      .describe("A summarized overview of the candidate's work experience from the resume."),
    technologies: z
      .array(z.string())
      .describe('A list of technologies mentioned in the resume.'),
    education: z.string().describe("A summarized overview of the candidate's education."),
    candidateSummary: z
      .string()
      .describe("A concise summary of the candidate's professional profile."),
    strengths: z
      .array(z.string())
      .describe("A list of the candidate's key strengths relevant to the job market."),
    weaknesses: z
      .array(z.string())
      .describe("A list of potential weaknesses or areas for improvement based on the resume."),
  }),
  matchScore: z.coerce
    .number()
    .min(0)
    .max(100)
    .describe("A percentage score (0-100) indicating how well the resume matches the job description."),
  skillGapAnalysis: z
    .array(
      z.object({
        skill: z.string().describe('A skill required by the job description.'),
        reason: z
          .string()
          .describe('Explanation why this skill is a gap for the candidate.'),
      })
    )
    .describe('An analysis of skills present in the job description but missing or weak in the resume.'),
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
  prompt: `You are an expert HR analyst and recruitment AI. Your task is to meticulously analyze a candidate's resume and compare it against a provided job description.

**CRITICAL INSTRUCTIONS:**
- You MUST extract the name, email, and phone number exactly as they appear.
- For "yearsOfExperience", return ONLY the number. If they have 5.5 years, return 5.5.
- For "matchScore", return a number between 0 and 100.
- If certain information is missing (like phone), return "Not provided".

**Job Description:**
{{{jobDescription}}}

**Candidate Resume:**
{{media url=resumeDataUri}}

Based on the resume and the job description, perform a thorough analysis and provide your output in the requested JSON structure.`,
});

const aiResumeMatcherAndAnalyzerFlow = ai.defineFlow(
  {
    name: 'aiResumeMatcherAndAnalyzerFlow',
    inputSchema: AiResumeMatcherAndAnalyzerInputSchema,
    outputSchema: AiResumeMatcherAndAnalyzerOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('AI model failed to generate a response.');
      }
      return output;
    } catch (error) {
      console.error('Error in aiResumeMatcherAndAnalyzerFlow:', error);
      throw error;
    }
  }
);
