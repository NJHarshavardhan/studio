
"use client"

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle2, Clock, ArrowRight, Briefcase, Search, Loader2, LogOut, User } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";

export default function CandidatePortal() {
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const firestore = useFirestore();

  const cleanEmail = useMemo(() => email.toLowerCase().trim(), [email]);

  const candidatesQuery = useMemoFirebase(() => {
    if (!firestore || !cleanEmail || !isLoggedIn) return null;
    return query(collection(firestore, "candidates"), where("email", "==", cleanEmail));
  }, [firestore, cleanEmail, isLoggedIn]);

  const { data: applications, loading } = useCollection(candidatesQuery);

  const activeApplication = useMemo(() => {
    return applications?.[0];
  }, [applications]);

  const showLoading = (loading || !firestore) && isLoggedIn;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pt-10 px-8">
            <div className="mx-auto bg-primary w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-primary/20">
              <Bot className="h-10 w-10" />
            </div>
            <CardTitle className="text-3xl font-black">Candidate Portal</CardTitle>
            <CardDescription className="text-slate-500 mt-2 text-base">Enter the email you used for your application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-12 pt-6">
            <div className="space-y-2">
              <Input 
                placeholder="name@company.com" 
                type="email"
                className="h-12 rounded-xl text-base px-4 bg-slate-50 border-slate-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && email && setIsLoggedIn(true)}
              />
            </div>
            <Button className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20" onClick={() => setIsLoggedIn(true)} disabled={!email}>
              Check Application Status <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <header className="h-16 bg-white border-b flex items-center justify-between sticky top-0 z-50 px-4 md:px-8">
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="font-black text-xl tracking-tight hidden sm:block">HireStack</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block mr-2">
            {showLoading ? (
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            ) : (
              <>
                <p className="text-sm font-bold text-slate-900 leading-none mb-1">{activeApplication?.name || "Candidate"}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{cleanEmail}</p>
              </>
            )}
          </div>
          <div className="h-8 w-px bg-slate-100 hidden sm:block" />
          <Button variant="ghost" size="sm" className="rounded-xl h-10 px-4 text-slate-600 font-bold hover:bg-slate-50" onClick={() => { setIsLoggedIn(false); setEmail(""); }}>
            <LogOut className="h-4 w-4 mr-2" /> <span className="hidden xs:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6">
        <div className="space-y-10">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Your Journey</h2>
            <p className="text-slate-500 mt-2 text-lg">Track your progress in our automated recruitment pipeline.</p>
          </div>

          {showLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <Card className="md:col-span-2 border-none shadow-sm p-8 space-y-8 bg-white rounded-3xl">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-2xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-24 rounded-full" />
                  </div>
                  <div className="space-y-10 relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-50" />
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex gap-6 items-start">
                        <Skeleton className="h-8 w-8 rounded-full z-10" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
               </Card>
               <Skeleton className="h-[400px] rounded-3xl" />
             </div>
          ) : activeApplication ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="md:col-span-2 border-none shadow-sm overflow-hidden rounded-3xl bg-white">
                <CardHeader className="border-b pb-8 p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                        <Briefcase className="h-8 w-8" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-black">Application Update</CardTitle>
                        <CardDescription className="font-bold text-slate-400">Status for: {activeApplication.email}</CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-none px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest self-start sm:self-auto">
                      {activeApplication.currentStage}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-10">
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100" />
                      <div className="space-y-10 relative">
                        {[
                          { stage: "Applied", desc: "Resume submitted and received.", done: true },
                          { stage: "AI Screening", desc: "Our AI matched your profile with role requirements.", done: true },
                          { stage: "AI Interview", desc: "Technical and behavioral automated screening.", done: activeApplication.currentStage !== "Applied" && activeApplication.currentStage !== "AI Screening" },
                          { stage: "HR Review", desc: "Final decision by our human recruitment team.", done: activeApplication.currentStage === "Selected" || activeApplication.currentStage === "Rejected" },
                        ].map((s, idx) => (
                          <div key={idx} className="flex gap-6 items-start">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center z-10 shrink-0 ${s.done ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-white border-2 border-slate-100 text-slate-300"}`}>
                              {s.done ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className={`font-black text-lg ${s.done ? "text-slate-900" : "text-slate-400"}`}>{s.stage}</p>
                              <p className="text-slate-500 font-medium">{s.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8 border-t border-slate-50">
                      {activeApplication.currentStage === "AI Interview" && activeApplication.interviewStatus !== "completed" ? (
                        <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10">
                          <h4 className="font-black text-xl text-primary mb-2">Ready to Interview?</h4>
                          <p className="text-slate-600 mb-8 font-medium">Your profile has been shortlisted. You can start your AI-driven technical screening now. It takes approximately 10-15 minutes.</p>
                          <Link href={`/interview/${activeApplication.id}`}>
                            <Button className="w-full sm:w-auto px-8 h-12 text-base font-bold rounded-xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
                              Start AI Interview Session <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                          </Link>
                        </div>
                      ) : activeApplication.interviewStatus === "completed" ? (
                        <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100 flex flex-col sm:flex-row items-center gap-6">
                          <div className="h-16 w-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <CheckCircle2 className="h-10 w-10" />
                          </div>
                          <div className="text-center sm:text-left">
                            <h4 className="font-black text-xl text-emerald-900">Interview Completed</h4>
                            <p className="text-emerald-700 font-medium">Thank you! Our HR team is currently reviewing your session transcript and results.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500">
                          <Search className="h-4 w-4" />
                          <p className="text-sm font-bold">Your application is currently being processed by our screening engine.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-none shadow-xl bg-primary text-white overflow-hidden rounded-3xl">
                  <div className="p-8">
                    <CardTitle className="text-xl font-black flex items-center gap-2 mb-6">
                      <Bot className="h-6 w-6" /> AI Assistant Tips
                    </CardTitle>
                    <div className="space-y-5">
                      {[
                        "Ensure you have a quiet environment for the interview.",
                        "Be prepared to discuss your current and expected salary.",
                        "The AI will evaluate your fit based on the Job Description.",
                        "Session usually takes 10-15 minutes."
                      ].map((tip, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className="h-2 w-2 rounded-full bg-white/40 mt-1.5 flex-shrink-0" />
                          <p className="text-sm font-medium opacity-90 leading-relaxed">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
                
                <Card className="border-none shadow-sm bg-white p-8 rounded-3xl">
                   <h4 className="font-black text-slate-900 mb-4">Need Help?</h4>
                   <p className="text-sm text-slate-500 font-medium mb-6">If you encounter any issues during your session, contact our support team.</p>
                   <Button variant="outline" className="w-full rounded-xl border-slate-200 font-bold h-11">
                     Contact Support
                   </Button>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="border-dashed border-2 bg-white/50 p-20 text-center rounded-3xl border-slate-200">
              <div className="h-20 w-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">No Application Found</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-2 font-medium">
                We couldn't find any active applications for <strong>{cleanEmail}</strong>. Please ensure you entered the correct email.
              </p>
              <Button variant="outline" className="mt-8 rounded-xl h-11 px-8 border-slate-200 font-bold" onClick={() => { setIsLoggedIn(false); setEmail(""); }}>
                Try Another Email
              </Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
