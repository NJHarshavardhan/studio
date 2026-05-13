"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileUp, Loader2, CheckCircle2, AlertCircle, Mail, Phone, Calendar, RefreshCw } from "lucide-react";
import { aiResumeMatcherAndAnalyzer, type AiResumeMatcherAndAnalyzerOutput } from "@/ai/flows/ai-resume-matcher-and-analyzer";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ResumeAnalyzerProps {
  jobDescription: string;
}

export function ResumeAnalyzer({ jobDescription }: ResumeAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [quotaWait, setQuotaWait] = useState<number | null>(null);
  const [result, setResult] = useState<AiResumeMatcherAndAnalyzerOutput & { resumeDataUri?: string } | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();

  // Handle countdown for quota error
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quotaWait !== null && quotaWait > 0) {
      timer = setTimeout(() => setQuotaWait(quotaWait - 1), 1000);
    } else if (quotaWait === 0) {
      setQuotaWait(null);
    }
    return () => clearTimeout(timer);
  }, [quotaWait]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous states
    setResult(null);
    setIsAnalyzing(true);

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
            description: `${analysis.extractedInfo.name} matched with ${analysis.matchScore}%`,
          });
        } catch (error: any) {
          console.error('Resume Analysis Error:', error);
          
          if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
            const waitSeconds = 30; // Standard wait for Gemini free tier
            setQuotaWait(waitSeconds);
            toast({
              variant: "destructive",
              title: "AI Rate Limit Reached",
              description: `The AI is busy. Please wait ${waitSeconds} seconds before trying again.`,
            });
          } else {
            toast({
              variant: "destructive",
              title: "Analysis Failed",
              description: "The AI could not parse this document. Please try a different resume format.",
            });
          }
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
        description: "An unexpected error occurred reading the file.",
      });
    }
  };

  const handleApprove = () => {
    if (!result || !firestore) return;
    setIsApproving(true);

    const candidateData = {
      name: result.extractedInfo.name,
      email: result.extractedInfo.email,
      phone: result.extractedInfo.phone,
      yearsOfExperience: result.extractedInfo.yearsOfExperience,
      matchScore: result.matchScore,
      currentStage: "Shortlisted",
      jobId: "default-job-id",
      resumeDataUri: result.resumeDataUri,
      appliedDate: new Date().toISOString(),
      interviewStatus: "none",
      createdAt: serverTimestamp()
    };

    const candidatesCol = collection(firestore, "candidates");

    addDoc(candidatesCol, candidateData)
      .then(() => {
        toast({
          title: "Candidate Shortlisted",
          description: `${result.extractedInfo.name} has been added to the database.`,
        });
        router.push("/dashboard/candidates");
      })
      .catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: candidatesCol.path,
          operation: 'create',
          requestResourceData: candidateData,
        }));
      })
      .finally(() => setIsApproving(false));
  };

  return (
    <div className="space-y-6">
      {quotaWait !== null && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
          <RefreshCw className="h-4 w-4 animate-spin text-amber-600" />
          <AlertTitle>AI Quota Cooling Down</AlertTitle>
          <AlertDescription className="text-sm">
            Gemini Free Tier has a limit of 15 requests/min. Please wait <strong>{quotaWait}s</strong> before analyzing another file.
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-dashed border-2 bg-slate-50/50 hover:bg-slate-50 transition-colors">
        <CardContent className="flex flex-col items-center justify-center p-12">
          {isAnalyzing ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">AI</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Parsing Candidate Data...</h3>
                <p className="text-sm text-slate-500 max-w-xs">Extracting skills, experience, and contact information via GenAI.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-4 rounded-full bg-primary/10 text-primary group">
                <FileUp className="h-8 w-8 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Screen New Candidate</h3>
                <p className="text-sm text-slate-500 mb-6">Drop a resume here to start the AI screening process.</p>
                <input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileUpload}
                  disabled={quotaWait !== null}
                />
                <Button asChild disabled={quotaWait !== null}>
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    Upload Resume
                  </label>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-none shadow-xl bg-white overflow-hidden">
             <div className="h-2 bg-primary" />
             <CardHeader className="bg-slate-50/50">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                   <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl shadow-inner">
                     {result.extractedInfo.name[0] || 'C'}
                   </div>
                   <div>
                     <CardTitle className="text-2xl">{result.extractedInfo.name}</CardTitle>
                     <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1">
                        <span className="text-sm text-slate-500 flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" /> {result.extractedInfo.email}
                        </span>
                        <span className="text-sm text-slate-500 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" /> {result.extractedInfo.yearsOfExperience}y Exp
                        </span>
                     </div>
                   </div>
                 </div>
                 <div className="flex gap-2">
                   <Button variant="ghost" onClick={() => setResult(null)} disabled={isApproving}>Discard</Button>
                   <Button onClick={handleApprove} disabled={isApproving} className="shadow-lg shadow-primary/20">
                     {isApproving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                     Approve for Interview
                   </Button>
                 </div>
               </div>
             </CardHeader>
             <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Job Match Score</h4>
                        <span className="text-3xl font-black text-primary">{result.matchScore}%</span>
                      </div>
                      <Progress value={result.matchScore} className="h-3" />
                    </div>

                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">AI Candidate Profile</h4>
                      <p className="text-sm text-slate-700 leading-relaxed italic">
                        "{result.extractedInfo.candidateSummary}"
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Key Assets</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.extractedInfo.strengths.map((s, idx) => (
                          <Badge key={`strength-${idx}`} variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 px-3 py-1">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Requirement Gaps</h4>
                      <div className="space-y-3">
                        {result.skillGapAnalysis.length > 0 ? (
                          result.skillGapAnalysis.map((gap, i) => (
                            <div key={`gap-${i}`} className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                              <div>
                                <p className="text-sm font-bold text-slate-900">{gap.skill}</p>
                                <p className="text-xs text-slate-600 leading-tight mt-1">{gap.reason}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 bg-emerald-50/50 rounded-xl border border-emerald-100">
                            <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                            <p className="text-sm text-emerald-700 font-bold">Perfect match for all requirements!</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.extractedInfo.technologies.map((t, idx) => (
                          <Badge key={`tech-${idx}`} variant="outline" className="text-blue-600 border-blue-200 bg-blue-50/50 px-3 py-1 font-medium">{t}</Badge>
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
