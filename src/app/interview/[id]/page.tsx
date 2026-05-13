"use client"

import { useParams } from "next/navigation";
import { useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { InterviewSession } from "@/components/ai/interview-session";
import { Bot, Loader2, AlertCircle, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMemoFirebase } from "@/firebase";

export default function PublicInterviewPage() {
  const { id } = useParams();
  const firestore = useFirestore();
  
  const candidateRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, "candidates", id as string);
  }, [firestore, id]);

  const { data: candidate, loading, error } = useDoc(candidateRef);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
            <div className="relative bg-white rounded-full p-5 shadow-xl">
              <Bot className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Initializing AI Interviewer</h2>
            <p className="text-slate-500 font-medium animate-pulse">Setting up your secure technical screening environment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-2xl text-center rounded-3xl overflow-hidden">
          <div className="h-2 bg-red-500" />
          <CardHeader className="pt-10 pb-6 px-8">
            <div className="h-16 w-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Session Not Found</CardTitle>
            <CardDescription className="text-slate-500 mt-2">
              This interview link appears to be invalid or has expired. Please contact your recruitment manager or check your candidate portal.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-10">
             <Link href="/candidate/portal">
               <Button className="w-full h-11" variant="outline">
                 Go to Candidate Portal
               </Button>
             </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] py-12 px-4 md:py-20">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex flex-col items-center text-center space-y-4">
           <Link href="/candidate/portal" className="text-slate-400 hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
             <ChevronLeft className="h-4 w-4" /> Back to Portal
           </Link>
           <div className="bg-primary p-3 rounded-2xl text-white mb-2 shadow-xl shadow-primary/20">
             <Bot className="h-10 w-10" />
           </div>
           <div className="space-y-2">
             <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
               Welcome, {candidate.name}
             </h1>
             <p className="text-slate-500 max-w-lg mx-auto text-lg">
               You are starting the AI technical screening for the <span className="text-primary font-bold">Senior Software Engineer</span> position.
             </p>
           </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-primary/5 rounded-[40px] blur-2xl" />
          <div className="relative">
            <InterviewSession 
              jobDescription="Senior Software Engineer with focus on React, Next.js, Cloud architecture, and strong leadership skills." 
              resumeText={`Candidate Name: ${candidate.name}. Experience reported: ${candidate.yearsOfExperience} years. Email: ${candidate.email}.`}
              candidateId={candidate.id}
            />
          </div>
        </div>

        <div className="text-center pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              Secure Session • Powered by HirePulse GenAI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
