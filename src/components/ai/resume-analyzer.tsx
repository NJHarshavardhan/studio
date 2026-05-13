"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileUp, Loader2, CheckCircle2, AlertCircle, Mail, Phone, User, Calendar } from "lucide-react";
import { aiResumeMatcherAndAnalyzer, type AiResumeMatcherAndAnalyzerOutput } from "@/ai/flows/ai-resume-matcher-and-analyzer";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface ResumeAnalyzerProps {
  jobDescription: string;
}

export function ResumeAnalyzer({ jobDescription }: ResumeAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [result, setResult] = useState<AiResumeMatcherAndAnalyzerOutput & { resumeDataUri?: string } | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        try {
          const analysis = await aiResumeMatcherAndAnalyzer({
            resumeDataUri: base64String,
            jobDescription: jobDescription,
          });
          setResult({ ...analysis, resumeDataUri: base64String });
          toast({
            title: "Analysis Complete",
            description: `Candidate matched with a score of ${analysis.matchScore}%`,
          });
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to analyze resume. Please try again.",
          });
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsAnalyzing(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    }
  };

  const handleApprove = async () => {
    if (!result || !firestore) return;
    setIsApproving(true);

    try {
      const candidateData = {
        name: result.extractedInfo.name,
        email: result.extractedInfo.email,
        phone: result.extractedInfo.phone,
        yearsOfExperience: result.extractedInfo.yearsOfExperience,
        matchScore: result.matchScore,
        currentStage: "Shortlisted",
        jobId: "default-job-id", // In a real app, this would be passed as a prop
        resumeDataUri: result.resumeDataUri,
        appliedDate: new Date().toISOString(),
        interviewStatus: "none",
        createdAt: serverTimestamp()
      };

      await addDoc(collection(firestore, "candidates"), candidateData);
      
      toast({
        title: "Candidate Approved",
        description: `${result.extractedInfo.name} has been added to the shortlist.`,
      });
      
      router.push("/dashboard/candidates");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save candidate data.",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleDecline = () => {
    setResult(null);
    toast({
      title: "Analysis Discarded",
      description: "You can upload another resume now.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-dashed border-2 bg-slate-50/50">
        <CardContent className="flex flex-col items-center justify-center p-12">
          {isAnalyzing ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <div>
                <h3 className="text-lg font-semibold">Analyzing Resume...</h3>
                <p className="text-sm text-slate-500">Our AI is parsing contact info, skills and matching experience.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                <FileUp className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Upload Candidate Resume</h3>
                <p className="text-sm text-slate-500 mb-6">PDF or DOCX supported. Max file size 10MB.</p>
                <input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileUpload}
                />
                <Button asChild>
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    Select Resume File
                  </label>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-none shadow-lg bg-white">
             <CardHeader className="border-b bg-slate-50/50">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                     {result.extractedInfo.name[0]}
                   </div>
                   <div>
                     <CardTitle className="text-xl">{result.extractedInfo.name}</CardTitle>
                     <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {result.extractedInfo.email}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {result.extractedInfo.phone}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {result.extractedInfo.yearsOfExperience}y Experience
                        </span>
                     </div>
                   </div>
                 </div>
                 <div className="flex gap-2">
                   <Button variant="outline" onClick={handleDecline}>Decline</Button>
                   <Button onClick={handleApprove} disabled={isApproving}>
                     {isApproving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                     Approve & Add to List
                   </Button>
                 </div>
               </div>
             </CardHeader>
             <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Match Score</h4>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl font-bold text-slate-900">{result.matchScore}%</span>
                        <Badge className={result.matchScore > 80 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
                          {result.matchScore > 80 ? "Strong Fit" : "Potential Match"}
                        </Badge>
                      </div>
                      <Progress value={result.matchScore} className="h-2" />
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">AI Summary</h4>
                      <p className="text-sm text-slate-600 leading-relaxed italic">
                        "{result.extractedInfo.candidateSummary}"
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Strengths</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.extractedInfo.strengths.map(s => (
                          <Badge key={s} variant="secondary" className="bg-emerald-50 text-emerald-700 border-none">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Skill Gap Analysis</h4>
                      <div className="space-y-3">
                        {result.skillGapAnalysis.length > 0 ? (
                          result.skillGapAnalysis.map((gap, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{gap.skill}</p>
                                <p className="text-xs text-slate-500">{gap.reason}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-6 bg-emerald-50 rounded-lg border border-emerald-100">
                            <CheckCircle2 className="h-6 w-6 text-emerald-500 mb-2" />
                            <p className="text-sm text-emerald-700 font-medium">All requirements met!</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Key Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.extractedInfo.technologies.map(t => (
                          <Badge key={t} variant="outline" className="text-blue-600 border-blue-200 bg-blue-50/50">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
             </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}