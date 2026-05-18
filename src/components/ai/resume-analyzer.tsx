
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileUp, Loader2, CheckCircle2, AlertCircle, Mail, Phone, Calendar, RefreshCw, MessageCircle, X, Trash2, Check, User, Sparkles, Zap } from "lucide-react";
import { aiResumeMatcherAndAnalyzer, type AiResumeMatcherAndAnalyzerOutput } from "@/ai/flows/ai-resume-matcher-and-analyzer";
import { sendWhatsAppUpdate } from "@/ai/flows/send-whatsapp-update";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { collection, addDoc, doc, updateDoc, increment } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
  const { user } = useUser();
  const router = useRouter();

  const subRef = useMemoFirebase(() => (user && firestore) ? doc(firestore, "subscriptions", user.uid) : null, [user, firestore]);
  const { data: subscription } = useDoc(subRef);

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
    const currentCount = subscription?.candidateCount || 0;
    const limit = subscription?.candidateLimit || 4;

    if (currentCount >= limit) {
      toast({
        variant: "destructive",
        title: "Limit Reached",
        description: `You have used all ${limit} slots of your current plan.`,
      });
      return;
    }

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
        if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
          setQuotaWait(30);
        } else {
          toast({
            variant: "destructive",
            title: "Analysis Failed",
            description: "The AI could not parse this document.",
          });
        }
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApprove = async () => {
    if (!result || !firestore || !user) return;
    setIsApproving(true);

    const candidateData = {
      name: result.extractedInfo.name || "Unknown Candidate",
      email: result.extractedInfo.email.toLowerCase().trim(),
      phone: result.extractedInfo.phone || "Not provided",
      yearsOfExperience: Number(result.extractedInfo.yearsOfExperience) || 0,
      matchScore: Number(result.matchScore) || 0,
      currentStage: "Shortlisted",
      jobId: jobId,
      resumeDataUri: result.resumeDataUri || "",
      appliedDate: new Date().toISOString(),
      interviewStatus: "none",
    };

    try {
      await addDoc(collection(firestore, "candidates"), candidateData);
      
      // Update usage count
      await updateDoc(doc(firestore, "subscriptions", user.uid), {
        candidateCount: increment(1)
      });

      toast({
        title: "Candidate Approved",
        description: "Candidate successfully added to pipeline.",
      });
      router.push("/dashboard/candidates");
    } catch (e: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: "candidates",
        operation: 'create',
        requestResourceData: candidateData,
      }));
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="space-y-12">
      {subscription && (subscription.candidateCount || 0) >= (subscription.candidateLimit || 4) && (
        <Alert className="glass-morphism border-primary/20 bg-primary/5 rounded-[2.5rem] p-8 border-2">
           <Zap className="h-6 w-6 text-primary" />
           <AlertTitle className="font-black font-headline text-xl mb-2">Usage Limit Reached</AlertTitle>
           <AlertDescription className="text-base font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              Upgrade your Liquid Flow plan to add more candidates to your pipeline.
              <Link href="/dashboard/billing">
                <Button className="rounded-full px-8 font-black bg-primary shadow-lg shadow-primary/20">Upgrade Now</Button>
              </Link>
           </AlertDescription>
        </Alert>
      )}

      {quotaWait !== null && (
        <Alert variant="destructive" className="glass-morphism border-amber-500/40 text-amber-600 rounded-[2.5rem] p-8 animate-in fade-in slide-in-from-top-4">
          <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
          <AlertTitle className="font-black font-headline text-xl mb-2">AI Quota Cooling Down</AlertTitle>
          <AlertDescription className="text-base font-medium">
            Gemini Free Tier has a limit. Please wait <strong>{quotaWait}s</strong>.
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
              disabled={quotaWait !== null || isAnalyzing || (subscription?.candidateCount || 0) >= (subscription?.candidateLimit || 4)}
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
                  <p className="text-muted-foreground max-w-sm mx-auto font-medium text-lg">Extracting candidate neural signals...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="p-10 rounded-[3rem] glass-morphism text-primary w-fit mx-auto group-hover:scale-110 transition-transform duration-700 shadow-2xl">
                  <FileUp className="h-16 w-16" />
                </div>
                <div>
                  <h3 className="text-4xl font-black font-headline text-foreground">Upload Liquid Resume</h3>
                  <p className="text-muted-foreground mb-12 font-medium max-w-md mx-auto text-lg">Drop your data flow here to trigger matching.</p>
                  <Button className="rounded-full h-16 px-16 font-black shadow-[0_15px_40px_rgba(255,51,102,0.3)] text-xl transition-all" disabled={quotaWait !== null || (subscription?.candidateCount || 0) >= (subscription?.candidateLimit || 4)}>
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
                   <div className="h-32 w-32 md:h-40 md:w-40 rounded-[3rem] bg-primary text-white flex items-center justify-center font-black text-6xl shadow-2xl shadow-primary/30 border-8 border-white/20 shrink-0">
                     {result.extractedInfo.name ? result.extractedInfo.name[0] : 'C'}
                   </div>
                   <div className="space-y-6">
                     <div>
                       <CardTitle className="text-5xl md:text-7xl font-black font-headline text-foreground tracking-tighter leading-none">
                         {result.extractedInfo.name || "Candidate Name"}
                       </CardTitle>
                       <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
                         <Badge className="bg-primary/20 text-primary border-none px-6 py-2 rounded-full font-black text-xs uppercase tracking-[0.3em]">Neural Verified</Badge>
                       </div>
                     </div>
                   </div>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-6 xl:self-center w-full xl:w-auto">
                   <Button variant="outline" onClick={() => setResult(null)} className="rounded-[2rem] h-20 px-12 font-black glass-morphism border-none text-xl">Discard</Button>
                   <Button onClick={handleApprove} disabled={isApproving} className="rounded-[2rem] h-20 px-16 font-black shadow-xl bg-primary text-2xl">
                     {isApproving ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <Check className="h-6 w-6 mr-3" />}
                     Approve Match
                   </Button>
                 </div>
               </div>
             </div>
             <CardContent className="p-12 md:p-20">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-16 md:gap-24">
                   <div className="xl:col-span-5 space-y-16">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-muted-foreground uppercase tracking-[0.5em]">Match Score</h4>
                        <span className="text-8xl font-black font-headline text-primary">{result.matchScore}%</span>
                      </div>
                      <p className="text-2xl text-foreground font-bold leading-relaxed italic">"{result.extractedInfo.candidateSummary}"</p>
                   </div>
                   <div className="xl:col-span-7 space-y-10">
                      <h4 className="text-xs font-black text-muted-foreground uppercase tracking-[0.5em]">Skill Insights</h4>
                      <div className="flex flex-wrap gap-5">
                        {result.extractedInfo.technologies.map((t, idx) => (
                          <Badge key={idx} className="glass-morphism text-foreground border-none px-10 py-5 rounded-full font-black uppercase tracking-widest">{t}</Badge>
                        ))}
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
