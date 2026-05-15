
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileUp, Loader2, CheckCircle2, AlertCircle, Mail, Phone, Calendar, RefreshCw, MessageCircle } from "lucide-react";
import { aiResumeMatcherAndAnalyzer, type AiResumeMatcherAndAnalyzerOutput } from "@/ai/flows/ai-resume-matcher-and-analyzer";
import { sendWhatsAppUpdate } from "@/ai/flows/send-whatsapp-update";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useFirestore } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ResumeAnalyzerProps {
  jobDescription: string;
  jobId?: string;
}

export function ResumeAnalyzer({ jobDescription, jobId = "default-job-id" }: ResumeAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [quotaWait, setQuotaWait] = useState<number | null>(null);
  const [result, setResult] = useState<AiResumeMatcherAndAnalyzerOutput & { resumeDataUri?: string } | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();

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

    setResult(null);
    setIsAnalyzing(true);

    const reader = new FileReader();
    reader.onload = async () => {
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
        console.error("Resume Analysis Error:", error);
        if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
          setQuotaWait(30);
          toast({
            variant: "destructive",
            title: "API Limit Reached",
            description: "Please wait for the cooldown timer before retrying.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Analysis Failed",
            description: "The AI could not parse this document. Please try a different format (PDF/DOCX).",
          });
        }
      } finally {
        setIsAnalyzing(false);
      }
    };

    reader.onerror = () => {
      setIsAnalyzing(false);
      toast({
        variant: "destructive",
        title: "File Read Error",
        description: "Could not read the file from your device.",
      });
    };

    reader.readAsDataURL(file);
  };

  const handleApprove = async () => {
    if (!result || !firestore) return;
    setIsApproving(true);

    const cleanEmail = result.extractedInfo.email.toLowerCase().trim();
    
    const candidateData = {
      name: result.extractedInfo.name || "Unknown Candidate",
      email: cleanEmail,
      phone: result.extractedInfo.phone || "Not provided",
      yearsOfExperience: Number(result.extractedInfo.yearsOfExperience) || 0,
      matchScore: Number(result.matchScore) || 0,
      currentStage: "Shortlisted",
      jobId: jobId,
      resumeDataUri: result.resumeDataUri || "",
      appliedDate: new Date().toISOString(),
      interviewStatus: "none",
    };

    const candidatesCol = collection(firestore, "candidates");
    const whatsappCol = collection(firestore, "whatsapp_logs");

    try {
      // 1. Save Candidate
      const docRef = await addDoc(candidatesCol, candidateData);

      // 2. Trigger WhatsApp Update
      if (candidateData.phone && candidateData.phone !== "Not provided") {
        const waResult = await sendWhatsAppUpdate({
          candidateName: candidateData.name,
          candidatePhone: candidateData.phone,
          type: 'shortlisted',
          jobTitle: 'Selected Role'
        });

        await addDoc(whatsappCol, {
          candidatePhone: candidateData.phone,
          candidateName: candidateData.name,
          body: waResult.body,
          type: 'shortlisted',
          sentAt: new Date().toISOString()
        });

        toast({
          title: "WhatsApp Sent",
          description: `Shortlist notification sent to ${candidateData.name} via mobile.`,
        });
      }

      toast({
        title: "Candidate Shortlisted",
        description: `${candidateData.name} has been added successfully.`,
      });

      router.push("/dashboard/candidates");
    } catch (e: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: candidatesCol.path,
        operation: 'create',
        requestResourceData: candidateData,
      } satisfies SecurityRuleContext));
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="space-y-6">
      {quotaWait !== null && (
        <Alert variant="destructive" className="bg-amber-500/10 border-amber-500/20 text-amber-600 rounded-3xl">
          <RefreshCw className="h-5 w-5 animate-spin text-amber-500" />
          <AlertTitle className="font-black font-headline">AI Quota Cooling Down</AlertTitle>
          <AlertDescription className="text-sm font-medium">
            Gemini Free Tier has a limit. Please wait <strong>{quotaWait}s</strong> before analyzing another file.
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-dashed border-2 bg-card/50 hover:bg-card border-border transition-all rounded-[3rem] overflow-hidden group">
        <CardContent className="flex flex-col items-center justify-center p-16 text-center cursor-pointer relative">
          <input
            type="file"
            id="resume-upload"
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileUpload}
            disabled={quotaWait !== null || isAnalyzing}
          />
          {isAnalyzing ? (
            <div className="space-y-6">
              <div className="relative h-16 w-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                <div className="relative bg-primary/10 rounded-full p-4">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black font-headline text-foreground">Parsing Candidate Data...</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto font-medium">Extracting skills, experience, and contact information via GenAI.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-6 rounded-[2rem] bg-primary/10 text-primary w-fit mx-auto group-hover:scale-110 transition-transform duration-300">
                <FileUp className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black font-headline text-foreground">Screen New Candidate</h3>
                <p className="text-sm text-muted-foreground mb-8 font-medium max-w-sm">Drop a resume here or click to start the AI screening process.</p>
                <Button className="rounded-2xl h-12 px-10 font-black shadow-xl shadow-primary/20" disabled={quotaWait !== null}>
                  Upload Resume
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-none shadow-2xl bg-card overflow-hidden rounded-[3rem]">
             <div className="h-2 bg-primary" />
             <CardHeader className="bg-muted/30 p-10">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                 <div className="flex items-center gap-6">
                   <div className="h-16 w-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary font-black text-3xl border border-primary/20 shadow-inner">
                     {result.extractedInfo.name ? result.extractedInfo.name[0] : 'C'}
                   </div>
                   <div>
                     <CardTitle className="text-3xl font-black font-headline text-foreground">{result.extractedInfo.name || "Extracted Candidate"}</CardTitle>
                     <div className="flex flex-wrap gap-x-8 gap-y-2 mt-2">
                        <span className="text-sm text-muted-foreground font-bold flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary/60" /> {result.extractedInfo.email}
                        </span>
                        <span className="text-sm text-muted-foreground font-bold flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary/60" /> {result.extractedInfo.yearsOfExperience}y Exp
                        </span>
                        {result.extractedInfo.phone && (
                          <span className="text-sm text-emerald-600 font-bold flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" /> {result.extractedInfo.phone}
                          </span>
                        )}
                     </div>
                   </div>
                 </div>
                 <div className="flex gap-4">
                   <Button variant="ghost" onClick={() => setResult(null)} disabled={isApproving} className="rounded-xl h-12 px-6 font-bold">Discard</Button>
                   <Button onClick={handleApprove} disabled={isApproving} className="rounded-xl h-12 px-8 font-black shadow-xl shadow-primary/20">
                     {isApproving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                     Approve for Interview
                   </Button>
                 </div>
               </div>
             </CardHeader>
             <CardContent className="p-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                  <div className="space-y-12">
                    <div>
                      <div className="flex items-center justify-between mb-4 px-1">
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Match Accuracy</h4>
                        <span className="text-4xl font-black text-primary font-headline">{result.matchScore}%</span>
                      </div>
                      <Progress value={result.matchScore} className="h-3 rounded-full bg-muted" />
                    </div>
                    <div className="p-8 bg-muted/20 rounded-[2rem] border border-border relative">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                         <FileUp className="h-12 w-12" />
                      </div>
                      <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6">AI Profile Insight</h4>
                      <p className="text-base text-foreground font-medium leading-relaxed italic">"{result.extractedInfo.candidateSummary}"</p>
                    </div>
                    <Alert className="bg-primary/5 border-primary/10 rounded-2xl">
                       <MessageCircle className="h-4 w-4 text-primary" />
                       <AlertTitle className="text-primary font-bold">WhatsApp Enabled</AlertTitle>
                       <AlertDescription className="text-xs font-medium">
                         Approving this candidate will trigger an automated WhatsApp welcome message to their mobile.
                       </AlertDescription>
                    </Alert>
                  </div>
                  <div className="space-y-12">
                    <div>
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6">Qualification Gap Analysis</h4>
                      <div className="space-y-4">
                        {result.skillGapAnalysis.length > 0 ? (
                          result.skillGapAnalysis.map((gap, i) => (
                            <div key={`gap-${i}-${gap.skill}`} className="flex items-start gap-5 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                              <AlertCircle className="h-5 w-5 text-amber-500 mt-1 shrink-0" />
                              <div>
                                <p className="text-sm font-black text-foreground font-headline">{gap.skill}</p>
                                <p className="text-xs text-muted-foreground font-medium leading-relaxed mt-1.5">{gap.reason}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-10 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-4" />
                            <p className="text-sm text-emerald-600 font-black uppercase tracking-widest">Premium Match Criteria</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6">Tech Stack & Tools</h4>
                      <div className="flex flex-wrap gap-3">
                        {result.extractedInfo.technologies.map((t, idx) => (
                          <Badge key={`tech-${idx}-${t}`} variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary border-primary/10 px-4 py-1.5 rounded-full">{t}</Badge>
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
