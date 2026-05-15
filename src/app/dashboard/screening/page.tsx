
"use client"

import { ResumeAnalyzer } from "@/components/ai/resume-analyzer";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Briefcase, Loader2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function ScreeningPage() {
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [jd, setJd] = useState(`We are looking for a Senior React Developer with 5+ years of experience.
Key Requirements:
- Expert knowledge of React and Next.js
- Proficiency in TypeScript and Tailwind CSS
- Experience with Server-side rendering and performance optimization
- Good communication skills`);

  const firestore = useFirestore();
  const jobsRef = useMemoFirebase(() => firestore ? collection(firestore, "jobs") : null, [firestore]);
  const { data: jobs, loading: loadingJobs } = useCollection(jobsRef);

  const handleJobChange = (jobId: string) => {
    setSelectedJobId(jobId);
    const job = jobs?.find(j => j.id === jobId);
    if (job) {
      setJd(job.description || "");
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground font-headline">AI Resume Screening</h1>
          <p className="text-muted-foreground mt-1 text-base md:text-lg font-medium">Precision matching for your high-growth team.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full bg-primary/5 text-primary border border-primary/20 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">GPT-4o Optimized</span>
          </div>
        </div>
      </div>

      <Alert className="bg-primary/5 border-primary/20 rounded-3xl p-6 border-2">
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="text-foreground font-black font-headline text-lg">Screening Strategy</AlertTitle>
        <AlertDescription className="text-muted-foreground font-medium mt-1">
          Select a position or paste a custom Job Description below. Our AI will analyze uploaded resumes against these criteria in real-time.
        </AlertDescription>
      </Alert>

      <Collapsible open={isConfigOpen} onOpenChange={setIsConfigOpen} className="w-full">
        <Card className="border-none shadow-sm bg-card rounded-[2.5rem] overflow-hidden">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between px-8 py-5 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h3 className="font-black text-lg text-foreground font-headline">Screening Configuration</h3>
              </div>
              {isConfigOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="px-8 pb-8 pt-2">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground font-black uppercase tracking-widest text-[10px]">Select Target Job</Label>
                    {loadingJobs ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground h-12">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading positions...
                      </div>
                    ) : (
                      <Select onValueChange={handleJobChange} value={selectedJobId}>
                        <SelectTrigger className="h-12 bg-muted/20 border-none rounded-xl focus:ring-primary">
                          <SelectValue placeholder="Choose a position..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          {jobs?.map((job: any) => (
                            <SelectItem key={job.id} value={job.id} className="rounded-lg">{job.title}</SelectItem>
                          ))}
                          {jobs?.length === 0 && (
                            <SelectItem value="none" disabled>No active jobs found</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
                <div className="lg:col-span-8 space-y-2">
                  <Label htmlFor="jd" className="text-foreground font-black uppercase tracking-widest text-[10px]">Reference Job Description</Label>
                  <Textarea 
                    id="jd" 
                    placeholder="Paste your job description here..." 
                    className="min-h-[120px] bg-muted/20 border-none rounded-2xl text-sm leading-relaxed focus-visible:ring-primary"
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <div className="pt-4">
        <ResumeAnalyzer jobDescription={jd} jobId={selectedJobId || "manual-entry"} />
      </div>
    </div>
  );
}
