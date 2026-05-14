"use client"

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle2, Clock, ArrowRight, Briefcase, Search, Loader2, LogOut } from "lucide-react";
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

  // Handle local loading vs firestore loading
  const showLoading = (loading || !firestore) && isLoggedIn;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-primary/20">
              <Bot className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold">Candidate Portal</CardTitle>
            <CardDescription>Enter the email you used for your application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input 
                placeholder="email@example.com" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && email && setIsLoggedIn(true)}
              />
            </div>
            <Button className="w-full h-11" onClick={() => setIsLoggedIn(true)} disabled={!email}>
              Check Application Status <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <header className="h-16 bg-white border-b px-8 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center space-x-2">
          <div className="bg-primary p-1.5 rounded-lg text-white">
            <Bot className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">HireStack</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            {showLoading ? <Skeleton className="h-4 w-24" /> : <p className="text-sm font-semibold">{activeApplication?.name || "Candidate"}</p>}
            <p className="text-[10px] text-slate-500">{cleanEmail}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setIsLoggedIn(false); setEmail(""); }}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Your Journey</h2>
            <p className="text-slate-500 mt-1">Track your progress in our automated recruitment pipeline.</p>
          </div>

          {showLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <Card className="md:col-span-2 border-none shadow-sm p-8 space-y-8 bg-white">
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
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100" />
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
               <Skeleton className="h-[300px] rounded-2xl" />
             </div>
          ) : activeApplication ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="md:col-span-2 border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                        <Briefcase className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Application Update</CardTitle>
                        <CardDescription>Status for: {activeApplication.email}</CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-blue-50 text-blue-700 border-none px-4 py-1.5 rounded-full">
                      {activeApplication.currentStage}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-8">
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100" />
                      <div className="space-y-8 relative">
                        {[
                          { stage: "Applied", desc: "Resume submitted and received.", done: true },
                          { stage: "AI Screening", desc: "Our AI matched your profile with role requirements.", done: true },
                          { stage: "AI Interview", desc: "Technical and behavioral automated screening.", done: activeApplication.currentStage !== "Applied" && activeApplication.currentStage !== "AI Screening" },
                          { stage: "HR Review", desc: "Final decision by our human recruitment team.", done: activeApplication.currentStage === "Selected" || activeApplication.currentStage === "Rejected" },
                        ].map((s, idx) => (
                          <div key={idx} className="flex gap-6 items-start">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center z-10 ${s.done ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-white border-2 border-slate-200 text-slate-300"}`}>
                              {s.done ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className={`font-bold ${s.done ? "text-slate-900" : "text-slate-400"}`}>{s.stage}</p>
                              <p className="text-sm text-slate-500">{s.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8 border-t">
                      {activeApplication.currentStage === "AI Interview" && activeApplication.interviewStatus !== "completed" ? (
                        <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                          <h4 className="font-bold text-indigo-900 mb-2">Ready to Interview?</h4>
                          <p className="text-sm text-indigo-700 mb-6">Your profile has been shortlisted. You can start your AI-driven technical screening now.</p>
                          <Link href={`/interview/${activeApplication.id}`}>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                              Start AI Interview Session <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      ) : activeApplication.interviewStatus === "completed" ? (
                        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-emerald-900">Interview Completed</h4>
                            <p className="text-sm text-emerald-700">Thank you! Our HR team is currently reviewing your session transcript.</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 italic">Your application is currently being processed by our screening engine.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-none shadow-sm bg-primary text-white overflow-hidden">
                  <div className="p-6">
                    <CardTitle className="text-lg flex items-center gap-2 mb-4">
                      <Bot className="h-5 w-5" /> AI Assistant Tips
                    </CardTitle>
                    <div className="space-y-4">
                      {[
                        "Ensure you have a quiet environment for the interview.",
                        "Be prepared to discuss your current and expected salary.",
                        "The AI will evaluate your fit based on the Job Description.",
                        "Session usually takes 10-15 minutes."
                      ].map((tip, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-300 mt-1.5 flex-shrink-0" />
                          <p className="text-xs opacity-90">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="border-dashed border-2 bg-white p-20 text-center rounded-3xl">
              <Search className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900">No Application Found</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-2">
                We couldn't find any active applications for <strong>{cleanEmail}</strong>. Please ensure you entered the correct email.
              </p>
              <Button variant="outline" className="mt-8" onClick={() => { setIsLoggedIn(false); setEmail(""); }}>
                Try Another Email
              </Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
