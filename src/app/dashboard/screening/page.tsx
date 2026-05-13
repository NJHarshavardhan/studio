"use client"

import { ResumeAnalyzer } from "@/components/ai/resume-analyzer";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function ScreeningPage() {
  const [jd, setJd] = useState(`We are looking for a Senior React Developer with 5+ years of experience.
Key Requirements:
- Expert knowledge of React and Next.js
- Proficiency in TypeScript and Tailwind CSS
- Experience with Server-side rendering and performance optimization
- Good communication skills`);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Resume Screening</h1>
        <p className="text-slate-500">Analyze candidate resumes against specific job descriptions.</p>
      </div>

      <div className="space-y-4">
        <div className="grid w-full gap-2">
          <Label htmlFor="jd" className="text-slate-900 font-semibold">Job Description</Label>
          <Textarea 
            id="jd" 
            placeholder="Paste your job description here..." 
            className="min-h-[200px] bg-white"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
          />
        </div>

        <div className="pt-4">
          <ResumeAnalyzer jobDescription={jd} />
        </div>
      </div>
    </div>
  );
}