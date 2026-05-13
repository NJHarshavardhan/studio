export type UserRole = 'Super Admin' | 'Company Admin' | 'HR' | 'Interviewer' | 'Employee' | 'Candidate';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string;
  avatarUrl?: string;
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  brandingColor?: string;
}

export type JobStatus = 'Draft' | 'Published' | 'Closed';

export interface Job {
  id: string;
  title: string;
  companyId: string;
  description: string;
  status: JobStatus;
  location: string;
  type: 'Full-time' | 'Contract' | 'Remote';
  postedAt: string;
  skills: string[];
}

export type PipelineStage = 'Applied' | 'AI Screening' | 'Shortlisted' | 'AI Interview' | 'HR Review' | 'Final Interview' | 'Selected' | 'Rejected';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  currentStage: PipelineStage;
  resumeUrl?: string;
  matchScore?: number;
  appliedDate: string;
  jobId: string;
}

export interface InterviewSession {
  id: string;
  candidateId: string;
  jobId: string;
  status: 'pending' | 'completed';
  score?: number;
  summary?: string;
  transcript?: string;
}