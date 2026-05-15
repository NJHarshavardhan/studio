"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileUp, Loader2, CheckCircle2, AlertCircle, Mail, Phone, Calendar, RefreshCw, MessageCircle, X, Trash2, Check, User } from "lucide-react";
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
        <Alert variant="destructive" className="bg-amber-500/10 border-amber-500/20 text-amber-600 rounded-3xl animate-in fade-in slide-in-from-top-2">
          <RefreshCw className="h-5 w-5 animate-spin text-amber-500" />
          <AlertTitle className="font-black font-headline">AI Quota Cooling Down</AlertTitle>
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
                  <p className="text-muted-foreground max-w-xs mx-auto font-medium">Our AI is extracting candidate skills, experience, and performance scores.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-8 rounded-[2.5rem] bg-primary/10 text-primary w-fit mx-auto group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-primary/5">
                  <FileUp className="h-12 w-12" />
                </div>
                <div>
                  <h3 className="text-3xl font-black font-headline text-foreground">Screen New Talent</h3>
                  <p className="text-muted-foreground mb-10 font-medium max-w-sm mx-auto">Drop a PDF or DOCX resume here to trigger the automated AI screening engine.</p>
                  <Button className="rounded-2xl h-14 px-12 font-black shadow-2xl shadow-primary/20 text-lg" disabled={quotaWait !== null}>
                    Upload Document
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] bg-card overflow-hidden rounded-[3rem]">
             <div className="h-3 bg-gradient-to-r from-primary via-accent to-primary" />
             <CardHeader className="bg-muted/10 p-8 md:p-12 border-b">
               <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                 <div className="flex items-start md:items-center gap-6 md:gap-8">
                   <div className="h-20 w-20 md:h-24 md:w-24 rounded-[2rem] bg-primary text-white flex items-center justify-center font-black text-4xl shadow-2xl shadow-primary/20 border-4 border-white dark:border-slate-800 shrink-0">
                     {result.extractedInfo.name ? result.extractedInfo.name[0] : 'C'}
                   </div>
                   <div className="space-y-3">
                     <CardTitle className="text-3xl md:text-5xl font-black font-headline text-foreground tracking-tight">{result.extractedInfo.name || "Candidate Name"}</CardTitle>
                     <div className="flex flex-wrap gap-x-8 gap-y-3">
                        <div className="flex items-center gap-2.5 text-muted-foreground font-bold">
                          <div className="p-2 bg-primary/10 rounded-xl text-primary"><Mail className="h-4 w-4" /></div>
                          <span className="text-sm md:text-base">{result.extractedInfo.email}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-muted-foreground font-bold">
                          <div className="p-2 bg-primary/10 rounded-xl text-primary"><Phone className="h-4 w-4" /></div>
                          <span className="text-sm md:text-base">{result.extractedInfo.phone || "No phone provided"}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-muted-foreground font-bold">
                          <div className="p-2 bg-primary/10 rounded-xl text-primary"><Calendar className="h-4 w-4" /></div>
                          <span className="text-sm md:text-base">{result.extractedInfo.yearsOfExperience} Years Exp.</span>
                        </div>
                     </div>
                   </div>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-4 lg:self-center">
                   <Button 
                    variant="outline" 
                    onClick={() => setResult(null)} 
                    disabled={isApproving} 
                    className="rounded-2xl h-14 px-8 font-black border-2 hover:bg-muted text-foreground transition-all flex-1 sm:flex-none"
                   >
                     <X className="h-5 w-5 mr-2" /> Discard
                   </Button>
                   <Button 
                    onClick={handleApprove} 
                    disabled={isApproving} 
                    className="rounded-2xl h-14 px-10 font-black shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all flex-1 sm:flex-none"
                   >
                     {isApproving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Check className="h-5 w-5 mr-2" />}
                     Approve Candidate
                   </Button>
                 </div>
               </div>
             </CardHeader>
             <CardContent className="p-8 md:p-12">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 md:gap-16">
                  {/* Left Column: Summary & Score */}
                  <div className="xl:col-span-5 space-y-12">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[12px] font-black text-muted-foreground uppercase tracking-[0.3em] font-headline">AI Match Accuracy</h4>
                        <span className={cn(
                          "text-5xl font-black font-headline",
                          result.matchScore > 80 ? "text-emerald-500" : result.matchScore > 60 ? "text-amber-500" : "text-red-500"
                        )}>{result.matchScore}%</span>
                      </div>
                      <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-1000 ease-out",
                            result.matchScore > 80 ? "bg-emerald-500" : result.matchScore > 60 ? "bg-amber-500" : "bg-red-500"
                          )} 
                          style={{ width: `${result.matchScore}%` }} 
                        />
                      </div>
                    </div>

                    <div className="p-10 bg-primary/5 rounded-[3rem] border-2 border-primary/10 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-700">
                         <User className="h-20 w-20 text-primary" />
                      </div>
                      <h4 className="text-[12px] font-black text-primary uppercase tracking-[0.3em] mb-8 font-headline">AI Profile Summary</h4>
                      <p className="text-lg text-foreground font-medium leading-relaxed italic relative z-10">
                        "{result.extractedInfo.candidateSummary}"
                      </p>
                    </div>

                    <Alert className="bg-emerald-500/5 border-emerald-500/10 rounded-[2rem] p-6 border-2">
                       <MessageCircle className="h-5 w-5 text-emerald-500" />
                       <AlertTitle className="text-emerald-600 dark:text-emerald-400 font-black font-headline text-lg">WhatsApp Ready</AlertTitle>
                       <AlertDescription className="text-muted-foreground font-medium mt-1">
                         A personalized welcome and orientation message will be automatically triggered to <strong>{result.extractedInfo.phone}</strong> upon approval.
                       </AlertDescription>
                    </Alert>
                  </div>

                  {/* Right Column: Skills & Gaps */}
                  <div className="xl:col-span-7 space-y-12">
                    <div className="space-y-8">
                      <h4 className="text-[12px] font-black text-muted-foreground uppercase tracking-[0.3em] font-headline">Qualification Gap Analysis</h4>
                      <div className="grid gap-5">
                        {result.skillGapAnalysis.length > 0 ? (
                          result.skillGapAnalysis.map((gap, i) => (
                            <div key={`gap-${i}`} className="flex items-start gap-6 p-6 rounded-3xl bg-amber-500/5 border-2 border-amber-500/10 hover:border-amber-500/30 transition-colors">
                              <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-600">
                                <AlertCircle className="h-6 w-6" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-lg font-black text-foreground font-headline">{gap.skill}</p>
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed">{gap.reason}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 bg-emerald-500/5 rounded-[3rem] border-2 border-dashed border-emerald-500/20">
                            <CheckCircle2 className="h-14 w-14 text-emerald-500 mb-6" />
                            <p className="text-xl font-black text-emerald-600 font-headline uppercase tracking-widest">Premium Criteria Match</p>
                            <p className="text-muted-foreground font-medium mt-2">Candidate exceeds all mandatory job requirements.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-8">
                      <h4 className="text-[12px] font-black text-muted-foreground uppercase tracking-[0.3em] font-headline">Core Tech Stack</h4>
                      <div className="flex flex-wrap gap-3">
                        {result.extractedInfo.technologies.map((t, idx) => (
                          <Badge 
                            key={`tech-${idx}`} 
                            variant="secondary" 
                            className="text-[12px] font-black uppercase tracking-widest bg-primary/5 text-primary border-2 border-primary/10 px-6 py-2.5 rounded-full hover:bg-primary hover:text-white transition-all cursor-default"
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
