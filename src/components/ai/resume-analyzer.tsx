"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileUp, Loader2, CheckCircle2, AlertCircle, Mail, Phone, Calendar, RefreshCw, MessageCircle, X, Trash2, Check, User, Sparkles } from "lucide-react";
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
import { cn } from "@/lib/utils";

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
      const docRef = await addDoc(candidatesCol, candidateData);

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
    <div className="space-y-8">
      {quotaWait !== null && (
        <Alert variant="destructive" className="bg-amber-500/10 border-amber-500/20 text-amber-600 rounded-[2rem] animate-in fade-in slide-in-from-top-2">
          <RefreshCw className="h-5 w-5 animate-spin text-amber-500" />
          <AlertTitle className="font-black font-headline text-lg">AI Quota Cooling Down</AlertTitle>
          <AlertDescription className="text-sm font-medium">
            Gemini Free Tier has a limit. Please wait <strong>{quotaWait}s</strong> before analyzing another file.
          </AlertDescription>
        </Alert>
      )}

      {!result && (
        <Card className="border-dashed border-2 bg-card/50 hover:bg-card border-border transition-all rounded-[3rem] overflow-hidden group">
          <CardContent className="flex flex-col items-center justify-center p-16 md:p-24 text-center cursor-pointer relative">
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
                <div className="relative h-20 w-20 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
                  <div className="relative bg-primary/10 rounded-full p-6">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black font-headline text-foreground">Analyzing Resume...</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto font-medium">Extracting candidate intelligence from the provided document.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-8 rounded-[2.5rem] bg-primary/10 text-primary w-fit mx-auto group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-primary/5">
                  <FileUp className="h-12 w-12" />
                </div>
                <div>
                  <h3 className="text-3xl font-black font-headline text-foreground">Upload Candidate Resume</h3>
                  <p className="text-muted-foreground mb-10 font-medium max-w-sm mx-auto">Drop a PDF, DOCX, or TXT file to trigger the AI screening engine.</p>
                  <Button className="rounded-2xl h-14 px-12 font-black shadow-2xl shadow-primary/20 text-lg" disabled={quotaWait !== null}>
                    Browse Documents
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <Card className="border-none shadow-[0_40px_80px_-15px_rgba(0,0,0,0.12)] bg-card overflow-hidden rounded-[3rem]">
             <div className="h-3 bg-gradient-to-r from-primary via-accent to-primary" />
             <div className="p-8 md:p-12 border-b bg-card">
               <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                 <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8 text-center sm:text-left">
                   <div className="h-24 w-24 md:h-28 md:w-28 rounded-[2.5rem] bg-primary text-white flex items-center justify-center font-black text-4xl shadow-2xl shadow-primary/20 border-4 border-white dark:border-slate-800 shrink-0">
                     {result.extractedInfo.name ? result.extractedInfo.name[0] : 'C'}
                   </div>
                   <div className="space-y-4">
                     <div>
                       <CardTitle className="text-3xl md:text-5xl font-black font-headline text-foreground tracking-tight leading-none">
                         {result.extractedInfo.name || "Candidate Name"}
                       </CardTitle>
                       <p className="text-muted-foreground font-bold mt-2 text-sm md:text-base uppercase tracking-[0.3em] font-headline">AI Talent Intelligence</p>
                     </div>
                     <div className="flex flex-wrap justify-center sm:justify-start gap-x-8 gap-y-3">
                        <div className="flex items-center gap-2.5 text-muted-foreground font-bold">
                          <Mail className="h-4 w-4 text-primary" />
                          <span className="text-sm">{result.extractedInfo.email}</span>
                        </div>
                        {result.extractedInfo.phone && result.extractedInfo.phone !== "Not provided" && (
                          <div className="flex items-center gap-2.5 text-muted-foreground font-bold">
                            <Phone className="h-4 w-4 text-primary" />
                            <span className="text-sm">{result.extractedInfo.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2.5 text-muted-foreground font-bold">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="text-sm">{result.extractedInfo.yearsOfExperience} Years Experience</span>
                        </div>
                     </div>
                   </div>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-4 lg:self-center w-full lg:w-auto">
                   <Button 
                    variant="outline" 
                    onClick={() => setResult(null)} 
                    disabled={isApproving} 
                    className="rounded-2xl h-14 px-8 font-black border-2 border-border hover:bg-muted text-foreground transition-all flex-1"
                   >
                     <X className="h-5 w-5 mr-2" /> Discard
                   </Button>
                   <Button 
                    onClick={handleApprove} 
                    disabled={isApproving} 
                    className="rounded-2xl h-14 px-10 font-black shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all flex-1 text-primary-foreground"
                   >
                     {isApproving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Check className="h-5 w-5 mr-2" />}
                     Approve & Shortlist
                   </Button>
                 </div>
               </div>
             </div>
             <CardContent className="p-8 md:p-12 bg-card">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 md:gap-16">
                  {/* Left Column: Summary & Score */}
                  <div className="xl:col-span-5 space-y-12">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] font-headline">Match Accuracy</h4>
                        <div className="flex items-baseline gap-1">
                          <span className={cn(
                            "text-6xl font-black font-headline",
                            result.matchScore > 80 ? "text-emerald-500" : result.matchScore > 60 ? "text-amber-500" : "text-red-500"
                          )}>{result.matchScore}</span>
                          <span className="text-xl font-black text-muted-foreground/50">%</span>
                        </div>
                      </div>
                      <div className="h-4 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={cn(
                            "h-full transition-all duration-1000 ease-out",
                            result.matchScore > 80 ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : 
                            result.matchScore > 60 ? "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" : 
                            "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                          )} 
                          style={{ width: `${result.matchScore}%` }} 
                        />
                      </div>
                    </div>

                    <div className="p-10 bg-primary/5 rounded-[3.5rem] border-2 border-primary/10 relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
                         <Sparkles className="h-64 w-64 text-primary" />
                      </div>
                      <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-8 font-headline">AI Strategic Evaluation</h4>
                      <p className="text-xl text-foreground font-medium leading-relaxed italic relative z-10">
                        "{result.extractedInfo.candidateSummary}"
                      </p>
                    </div>

                    <div className="flex items-center gap-4 p-6 bg-emerald-500/5 rounded-[2.5rem] border-2 border-emerald-500/10">
                       <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                         <MessageCircle className="h-6 w-6" />
                       </div>
                       <div className="flex-1">
                         <h4 className="text-sm font-black text-emerald-600 font-headline uppercase tracking-widest">WhatsApp Integration</h4>
                         <p className="text-xs text-muted-foreground font-medium mt-0.5 leading-relaxed">
                           Automated shortlisted notification will be sent to the candidate upon approval.
                         </p>
                       </div>
                    </div>
                  </div>

                  {/* Right Column: Skills & Gaps */}
                  <div className="xl:col-span-7 space-y-12">
                    <div className="space-y-8">
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] font-headline">Competency Gap Analysis</h4>
                      <div className="grid gap-6">
                        {result.skillGapAnalysis.length > 0 ? (
                          result.skillGapAnalysis.map((gap, i) => (
                            <div key={`gap-${i}`} className="flex items-start gap-6 p-7 rounded-[2rem] bg-amber-500/5 border-2 border-amber-500/10 hover:border-amber-500/30 transition-all group">
                              <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
                                <AlertCircle className="h-6 w-6" />
                              </div>
                              <div className="space-y-2">
                                <p className="text-xl font-black text-foreground font-headline leading-none">{gap.skill}</p>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed">{gap.reason}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20 bg-emerald-500/5 rounded-[3.5rem] border-2 border-dashed border-emerald-500/20">
                            <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-6" />
                            <p className="text-2xl font-black text-emerald-600 font-headline uppercase tracking-widest">Perfect Match</p>
                            <p className="text-muted-foreground font-medium mt-2">No skill gaps identified against requirements.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-8">
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] font-headline">Verified Technical Stack</h4>
                      <div className="flex flex-wrap gap-4">
                        {result.extractedInfo.technologies.map((t, idx) => (
                          <Badge 
                            key={`tech-${idx}`} 
                            variant="secondary" 
                            className="text-[11px] font-black uppercase tracking-[0.2em] bg-muted text-foreground border-none px-6 py-3 rounded-full hover:bg-primary hover:text-white transition-all cursor-default shadow-sm"
                          >
                            {t}
                          </Badge>
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
