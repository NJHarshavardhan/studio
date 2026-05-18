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
    <div className="space-y-12">
      {quotaWait !== null && (
        <Alert variant="destructive" className="glass-morphism border-amber-500/40 text-amber-600 rounded-[2.5rem] p-8 animate-in fade-in slide-in-from-top-4">
          <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
          <AlertTitle className="font-black font-headline text-xl mb-2">AI Quota Cooling Down</AlertTitle>
          <AlertDescription className="text-base font-medium">
            Gemini Free Tier has a limit. Please wait <strong>{quotaWait}s</strong> before analyzing another file.
          </AlertDescription>
        </Alert>
      )}

      {!result && (
        <Card className="border-dashed border-2 glass-morphism hover:bg-white/40 dark:hover:bg-black/40 border-primary/20 transition-all rounded-[4rem] overflow-hidden group">
          <CardContent className="flex flex-col items-center justify-center p-20 md:p-32 text-center cursor-pointer relative">
            <input
              type="file"
              id="resume-upload"
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileUpload}
              disabled={quotaWait !== null || isAnalyzing}
            />
            {isAnalyzing ? (
              <div className="space-y-10">
                <div className="relative h-28 w-28 mx-auto">
                  <div className="absolute inset-0 rounded-full border-8 border-primary/10 animate-ping" />
                  <div className="relative glass-morphism rounded-full p-8">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-black font-headline text-foreground">Analyzing Liquid Data...</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto font-medium text-lg">Extracting candidate neural signals from the document.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="p-10 rounded-[3rem] glass-morphism text-primary w-fit mx-auto group-hover:scale-110 transition-transform duration-700 shadow-2xl">
                  <FileUp className="h-16 w-16" />
                </div>
                <div>
                  <h3 className="text-4xl font-black font-headline text-foreground">Upload Liquid Resume</h3>
                  <p className="text-muted-foreground mb-12 font-medium max-w-md mx-auto text-lg">Drop your data flow here to trigger the neural matching engine.</p>
                  <Button className="rounded-full h-16 px-16 font-black shadow-[0_15px_40px_rgba(255,51,102,0.3)] text-xl transition-all hover:scale-105 active:scale-95" disabled={quotaWait !== null}>
                    Browse Documents
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <Card className="glass-morphism border-none shadow-2xl overflow-hidden rounded-[4rem]">
             <div className="h-4 bg-gradient-to-r from-primary via-accent to-primary animate-liquid" />
             <div className="p-12 md:p-16 border-b border-white/10">
               <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12">
                 <div className="flex flex-col sm:flex-row items-center gap-8 md:gap-12 text-center sm:text-left">
                   <div className="h-32 w-32 md:h-40 md:w-40 rounded-[3rem] bg-primary text-white flex items-center justify-center font-black text-6xl shadow-2xl shadow-primary/30 border-8 border-white/20 shrink-0 group hover:rotate-3 transition-transform">
                     {result.extractedInfo.name ? result.extractedInfo.name[0] : 'C'}
                   </div>
                   <div className="space-y-6">
                     <div>
                       <CardTitle className="text-5xl md:text-7xl font-black font-headline text-foreground tracking-tighter leading-none">
                         {result.extractedInfo.name || "Candidate Name"}
                       </CardTitle>
                       <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
                         <Badge className="bg-primary/20 text-primary border-none px-6 py-2 rounded-full font-black text-xs uppercase tracking-[0.3em]">Neural Verified</Badge>
                         <span className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.4em]">Liquid OS v5.0</span>
                       </div>
                     </div>
                     <div className="flex flex-wrap justify-center sm:justify-start gap-x-12 gap-y-4">
                        <div className="flex items-center gap-3.5 text-muted-foreground font-bold">
                          <div className="p-2 glass-morphism rounded-xl"><Mail className="h-5 w-5 text-primary" /></div>
                          <span className="text-lg">{result.extractedInfo.email}</span>
                        </div>
                        {result.extractedInfo.phone && result.extractedInfo.phone !== "Not provided" && (
                          <div className="flex items-center gap-3.5 text-muted-foreground font-bold">
                            <div className="p-2 glass-morphism rounded-xl"><Phone className="h-5 w-5 text-primary" /></div>
                            <span className="text-lg">{result.extractedInfo.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3.5 text-muted-foreground font-bold">
                          <div className="p-2 glass-morphism rounded-xl"><Calendar className="h-5 w-5 text-primary" /></div>
                          <span className="text-lg">{result.extractedInfo.yearsOfExperience}y Exp</span>
                        </div>
                     </div>
                   </div>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-6 xl:self-center w-full xl:w-auto">
                   <Button 
                    variant="outline" 
                    onClick={() => setResult(null)} 
                    disabled={isApproving} 
                    className="rounded-[2rem] h-20 px-12 font-black glass-morphism border-none text-xl transition-all hover:bg-red-500/10 hover:text-red-500 flex-1"
                   >
                     <X className="h-6 w-6 mr-3" /> Discard
                   </Button>
                   <Button 
                    onClick={handleApprove} 
                    disabled={isApproving} 
                    className="rounded-[2rem] h-20 px-16 font-black shadow-[0_20px_50px_rgba(255,51,102,0.4)] bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 flex-1 text-2xl"
                   >
                     {isApproving ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <Check className="h-6 w-6 mr-3" />}
                     Approve Match
                   </Button>
                 </div>
               </div>
             </div>
             <CardContent className="p-12 md:p-20 bg-transparent">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-16 md:gap-24">
                  {/* Left Column: Summary & Score */}
                  <div className="xl:col-span-5 space-y-16">
                    <div className="space-y-10">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-muted-foreground uppercase tracking-[0.5em] font-headline">Liquid Match Score</h4>
                        <div className="flex items-baseline gap-2">
                          <span className={cn(
                            "text-8xl font-black font-headline tracking-tighter",
                            result.matchScore > 80 ? "text-emerald-500" : result.matchScore > 60 ? "text-amber-500" : "text-red-500"
                          )}>{result.matchScore}</span>
                          <span className="text-2xl font-black text-muted-foreground/30">%</span>
                        </div>
                      </div>
                      <div className="h-6 w-full glass-morphism rounded-full overflow-hidden shadow-inner p-1 border-none">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-1500 ease-out animate-liquid",
                            result.matchScore > 80 ? "bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.5)]" : 
                            result.matchScore > 60 ? "bg-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.5)]" : 
                            "bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                          )} 
                          style={{ width: `${result.matchScore}%` }} 
                        />
                      </div>
                    </div>

                    <div className="p-12 glass-morphism rounded-[4rem] relative overflow-hidden group border-none">
                      <div className="absolute -top-20 -right-20 opacity-[0.05] group-hover:scale-125 transition-transform duration-1000">
                         <Sparkles className="h-80 w-80 text-primary" />
                      </div>
                      <h4 className="text-xs font-black text-primary uppercase tracking-[0.5em] mb-10 font-headline">Neural Insights</h4>
                      <p className="text-2xl text-foreground font-bold leading-relaxed italic relative z-10">
                        "{result.extractedInfo.candidateSummary}"
                      </p>
                    </div>

                    <div className="flex items-center gap-6 p-8 glass-morphism rounded-[3rem] border-none bg-emerald-500/5">
                       <div className="h-16 w-16 rounded-3xl glass-morphism flex items-center justify-center text-emerald-500 shadow-xl">
                         <MessageCircle className="h-8 w-8" />
                       </div>
                       <div className="flex-1">
                         <h4 className="text-base font-black text-emerald-600 font-headline uppercase tracking-[0.2em]">Liquid Messaging</h4>
                         <p className="text-sm text-muted-foreground font-bold mt-1 leading-relaxed">
                           Automatic shortlisted wave will be sent via mobile.
                         </p>
                       </div>
                    </div>
                  </div>

                  {/* Right Column: Skills & Gaps */}
                  <div className="xl:col-span-7 space-y-16">
                    <div className="space-y-10">
                      <h4 className="text-xs font-black text-muted-foreground uppercase tracking-[0.5em] font-headline">Neural Gap Analysis</h4>
                      <div className="grid gap-8">
                        {result.skillGapAnalysis.length > 0 ? (
                          result.skillGapAnalysis.map((gap, i) => (
                            <div key={`gap-${i}`} className="flex items-start gap-8 p-10 rounded-[3rem] glass-morphism border-none hover:bg-white/60 dark:hover:bg-black/60 transition-all group">
                              <div className="p-5 glass-morphism rounded-3xl text-amber-500 group-hover:scale-110 transition-transform shadow-lg">
                                <AlertCircle className="h-8 w-8" />
                              </div>
                              <div className="space-y-3">
                                <p className="text-2xl font-black text-foreground font-headline leading-none">{gap.skill}</p>
                                <p className="text-base text-muted-foreground font-bold leading-relaxed">{gap.reason}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-24 glass-morphism rounded-[4rem] border-dashed border-2 border-emerald-500/20">
                            <CheckCircle2 className="h-20 w-20 text-emerald-500 mb-8" />
                            <p className="text-3xl font-black text-emerald-600 font-headline uppercase tracking-[0.3em]">Neural Harmony</p>
                            <p className="text-muted-foreground font-bold mt-3 text-lg">No skill gaps detected in this liquid flow.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-10">
                      <h4 className="text-xs font-black text-muted-foreground uppercase tracking-[0.5em] font-headline">Synthesized Stack</h4>
                      <div className="flex flex-wrap gap-5">
                        {result.extractedInfo.technologies.map((t, idx) => (
                          <Badge 
                            key={`tech-${idx}`} 
                            variant="secondary" 
                            className="text-xs font-black uppercase tracking-[0.3em] glass-morphism text-foreground border-none px-10 py-5 rounded-full hover:bg-primary hover:text-white transition-all cursor-default shadow-lg"
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