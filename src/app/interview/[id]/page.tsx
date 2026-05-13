
"use client"

import { useParams } from "next/navigation";
import { useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { InterviewSession } from "@/components/ai/interview-session";
import { Bot, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-slate-500 font-medium">Preparing your AI interview session...</p>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-xl text-center">
          <CardHeader>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <CardTitle>Invalid Session</CardTitle>
            <CardDescription>
              We couldn't find an active interview session for this link. It may have expired or the link is incorrect.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Link href="/" className="text-primary font-bold hover:underline">Return Home</Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
           <div className="bg-primary p-2 rounded-xl text-white mb-2 shadow-lg shadow-primary/20">
             <Bot className="h-8 w-8" />
           </div>
           <h1 className="text-3xl font-bold tracking-tight text-slate-900">
             Welcome, {candidate.name}
           </h1>
           <p className="text-slate-500 max-w-lg">
             You are here for the AI-driven technical screening for the <strong>Senior Software Engineer</strong> role at HirePulse.
           </p>
        </div>

        <InterviewSession 
          jobDescription="Senior Software Engineer with focus on React, Next.js and Cloud architecture." 
          resumeText={`Candidate Name: ${candidate.name}. Experience: ${candidate.yearsOfExperience} years.`}
          candidateId={candidate.id}
        />

        <div className="text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            Powered by HirePulse GenAI
          </p>
        </div>
      </div>
    </div>
  );
}
