
"use client"

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, FileText, CheckCircle2, Clock, ArrowRight, Briefcase, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { InterviewSession } from "@/components/ai/interview-session";
import { useMemoFirebase } from "@/firebase";

export default function CandidatePortal() {
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showInterview, setShowInterview] = useState(false);
  const firestore = useFirestore();

  const candidatesQuery = useMemoFirebase(() => {
    if (!firestore || !email || !isLoggedIn) return null;
    return query(collection(firestore, "candidates"), where("email", "==", email));
  }, [firestore, email, isLoggedIn]);

  const { data: applications, loading } = useCollection(candidatesQuery);

  const activeApplication = useMemo(() => {
    return applications?.[0];
  }, [applications]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4">
              <Bot className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">Candidate Portal</CardTitle>
            <CardDescription>Enter your email to track your applications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={() => setIsLoggedIn(true)}>
              View Status <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <header className="h-16 bg-white border-b px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="bg-primary p-1.5 rounded-lg text-white">
            <Bot className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">HirePulse</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{activeApplication?.name || "Candidate"}</p>
            <p className="text-[10px] text-slate-500">{email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsLoggedIn(false)}>Sign Out</Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-12 px-8">
        {showInterview && activeApplication ? (
           <div className="space-y-6">
             <Button variant="ghost" onClick={() => setShowInterview(false)}>
               <ArrowRight className="h-4 w-4 mr-2 rotate-180" /> Back to Status
             </Button>
             <InterviewSession 
               jobDescription="Senior Software Engineer Role" 
               resumeText="Analyzed Resume Data" 
               candidateId={activeApplication.id}
             />
           </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section>
                 <h2 className="text-2xl font-bold mb-6">Your Application</h2>
                 {loading ? (
                   <div className="flex justify-center p-12">
                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
                   </div>
                 ) : activeApplication ? (
                   <div className="space-y-4">
                     <Card className="border-none shadow-sm">
                       <CardContent className="p-6">
                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <div className="flex items-start gap-4">
                             <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                               <Briefcase className="h-6 w-6" />
                             </div>
                             <div>
                               <h3 className="text-lg font-bold">Candidate Application</h3>
                               <p className="text-sm text-slate-500">HirePulse Automated Pipeline</p>
                               <div className="flex items-center gap-4 mt-4">
                                 <Badge className="bg-blue-50 text-blue-700 border-none px-3 py-1">
                                   {activeApplication.currentStage}
                                 </Badge>
                                 <div className="flex items-center gap-1 text-xs text-slate-400">
                                   <Clock className="h-3 w-3" /> Updated recently
                                 </div>
                               </div>
                             </div>
                           </div>
                           <div className="flex flex-col gap-2">
                              {activeApplication.currentStage === "AI Interview" && activeApplication.interviewStatus === "sent" ? (
                                <Button onClick={() => setShowInterview(true)}>
                                  Start AI Interview <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              ) : (
                                <Button variant="outline" disabled>
                                  {activeApplication.interviewStatus === "completed" ? "Interview Finished" : "Review in Progress"}
                                </Button>
                              )}
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                   </div>
                 ) : (
                   <Card className="border-dashed border-2 bg-slate-50 p-12 text-center">
                      <Search className="h-8 w-8 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No applications found for this email.</p>
                   </Card>
                 )}
              </section>
            </div>

            <div className="space-y-6">
              <Card className="border-none shadow-sm bg-primary text-white">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bot className="h-5 w-5" /> AI Assistant Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300 mt-1 flex-shrink-0" />
                    <p className="text-xs">Ensure you have a stable internet connection for the interview.</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300 mt-1 flex-shrink-0" />
                    <p className="text-xs">The AI will evaluate your responses based on role requirements.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
