
"use client"

import { ResumeAnalyzer } from "@/components/ai/resume-analyzer";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Briefcase, Loader2 } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ScreeningPage() {
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [jd, setJd] = useState(`We are looking for a Senior React Developer with 5+ years of experience.
Key Requirements:
- Expert knowledge of React and Next.js
- Proficiency in TypeScript and Tailwind CSS
- Experience with Server-side rendering and performance optimization
- Good communication skills`);

  const firestore = useFirestore();
  const jobsRef = useMemoFirebase(() => firestore ? collection(firestore, "jobs") : null, [firestore]);
  const { data: jobs, loading: loadingJobs } = useCollection(jobsRef);

  const selectedJob = jobs?.find(j => j.id === selectedJobId);

  const handleJobChange = (jobId: string) => {
    setSelectedJobId(jobId);
    const job = jobs?.find(j => j.id === jobId);
    if (job) {
      setJd(job.description || "");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Resume Screening</h1>
          <p className="text-muted-foreground">Analyze candidate resumes against specific job descriptions.</p>
        </div>
      </div>

      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-200">AI Quota Tip</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300 text-xs">
          The Gemini Free Tier allows for approximately 10-15 resume analyses per minute. If you hit a rate limit, simply wait 30 seconds before uploading the next file.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="space-y-2">
            <Label className="text-foreground font-semibold flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Select Target Job
            </Label>
            {loadingJobs ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Loading jobs...
              </div>
            ) : (
              <Select onValueChange={handleJobChange} value={selectedJobId}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Choose a position..." />
                </SelectTrigger>
                <SelectContent>
                  {jobs?.map((job: any) => (
                    <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                  ))}
                  {jobs?.length === 0 && (
                    <SelectItem value="none" disabled>No active jobs found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
            <p className="text-[10px] text-muted-foreground">Selecting a job will automatically load its description.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jd" className="text-foreground font-semibold">Job Description</Label>
            <Textarea 
              id="jd" 
              placeholder="Paste your job description here..." 
              className="min-h-[300px] bg-card text-sm leading-relaxed"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <ResumeAnalyzer jobDescription={jd} jobId={selectedJobId || "manual-entry"} />
        </div>
      </div>
    </div>
  );
}
