
"use client"

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, User, Send, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { dynamicAIInterviewAndEvaluation, type DynamicAIInterviewOutput } from "@/ai/flows/dynamic-ai-interview-and-evaluation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useFirestore } from "@/firebase";
import { collection, addDoc, updateDoc, doc, getDoc } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { sendRecruitmentEmail } from "@/ai/flows/send-recruitment-email";
import { cn } from "@/lib/utils";

interface InterviewSessionProps {
  jobDescription: string;
  resumeText: string;
  candidateId?: string;
  jobId?: string;
}

export function InterviewSession({ jobDescription, resumeText, candidateId, jobId = "default-job-id" }: InterviewSessionProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [report, setReport] = useState<DynamicAIInterviewOutput | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const firestore = useFirestore();

  useEffect(() => {
    if (messages.length === 0) {
      startInterview();
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const startInterview = async () => {
    setIsLoading(true);
    try {
      const response = await dynamicAIInterviewAndEvaluation({
        jobDescription,
        resumeText,
        conversationHistory: [],
      });
      if (response.nextQuestion) {
        setMessages([{ role: 'model', content: response.nextQuestion }]);
      }
    } catch (error) {
      console.error('Failed to start interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || isCompleted) return;

    const userMessage = input.trim();
    const updatedHistory = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(updatedHistory);
    setInput("");
    setIsLoading(true);

    try {
      const response = await dynamicAIInterviewAndEvaluation({
        jobDescription,
        resumeText,
        conversationHistory: updatedHistory,
      });

      if (response.interviewCompleted) {
        setIsCompleted(true);
        setReport(response);

        if (candidateId && firestore) {
          const interviewsCol = collection(firestore, "interviews");
          const emailsCol = collection(firestore, "emails");

          const interviewData = {
            candidateId,
            jobId,
            status: "completed" as const,
            score: Number(response.interviewScore) || 0,
            summary: response.interviewSummary || "No summary provided",
            transcript: response.transcript || updatedHistory.map(m => `${m.role}: ${m.content}`).join('\n'),
            completedAt: new Date().toISOString()
          };

          addDoc(interviewsCol, interviewData).catch(async (e) => {
            const permissionError = new FirestorePermissionError({
              path: interviewsCol.path,
              operation: 'create',
              requestResourceData: interviewData
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
          });

          const candidateRef = doc(firestore, "candidates", candidateId);
          getDoc(candidateRef).then(async (snap) => {
             if (snap.exists()) {
                const candidate = snap.data();
                const emailResult = await sendRecruitmentEmail({
                  candidateName: candidate.name,
                  candidateEmail: candidate.email,
                  type: 'interview_thank_you',
                  jobTitle: 'Software Engineer'
                });

                const emailLogData = {
                  candidateEmail: candidate.email,
                  candidateName: candidate.name,
                  subject: emailResult.subject,
                  body: emailResult.body,
                  type: 'interview_thank_you',
                  sentAt: new Date().toISOString()
                };

                addDoc(emailsCol, emailLogData).catch(async (e) => {
                  const permissionError = new FirestorePermissionError({
                    path: emailsCol.path,
                    operation: 'create',
                    requestResourceData: emailLogData
                  } satisfies SecurityRuleContext);
                  errorEmitter.emit('permission-error', permissionError);
                });
             }
          });

          const candidateUpdateData = {
            currentStage: "HR Review",
            interviewStatus: "completed"
          };

          updateDoc(candidateRef, candidateUpdateData).catch(async (e) => {
            const permissionError = new FirestorePermissionError({
              path: candidateRef.path,
              operation: 'update',
              requestResourceData: candidateUpdateData
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
          });
        }
      } else if (response.nextQuestion) {
        setMessages(prev => [...prev, { role: 'model', content: response.nextQuestion! }]);
      }
    } catch (error) {
      console.error('Interview turn failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCompleted && report) {
    return (
      <Card className="max-w-3xl mx-auto border-none shadow-2xl overflow-hidden rounded-3xl">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 p-12 text-white text-center relative">
          <div className="absolute top-4 right-4 bg-white/10 p-2 rounded-full">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CheckCircle2 className="h-20 w-20 mx-auto mb-6 text-emerald-100" />
          <h2 className="text-3xl font-bold">Interview Concluded</h2>
          <p className="opacity-90 mt-3 text-lg text-emerald-50">Thank you for your time. Your session has been processed and saved securely.</p>
        </div>
        <CardContent className="p-12 space-y-10 bg-white">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Overall Assessment</span>
            <div className="relative mt-6">
              <svg className="h-32 w-32 -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * (report.interviewScore || 0)) / 100} className="text-emerald-500 transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-black text-slate-900">{report.interviewScore}%</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
               <Bot className="h-5 w-5 text-primary" /> Hiring AI Summary
            </h3>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-slate-600 leading-relaxed text-sm italic">"{report.interviewSummary}"</p>
            </div>
          </div>
          <div className="pt-6">
            <Button className="w-full h-12 text-lg font-bold rounded-xl" onClick={() => window.location.href = '/candidate/portal'}>
              Return to Portal
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto h-[650px] flex flex-col border-none shadow-2xl bg-white overflow-hidden rounded-3xl">
      <CardHeader className="border-b bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-2.5 rounded-xl text-white shadow-lg shadow-primary/20">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">AI Screening Session</CardTitle>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live & Secure</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-emerald-600 border-emerald-100 bg-emerald-50 px-3 py-1 rounded-full">
            Session Active
          </Badge>
        </div>
      </CardHeader>
      <ScrollArea className="flex-1 p-8 bg-slate-50/20">
        <div className="space-y-8">
          {messages.map((msg, idx) => (
            <div key={idx} className={cn(
              "flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
              msg.role === 'user' ? "flex-row-reverse" : "flex-row"
            )}>
              <div className={cn(
                "h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm",
                msg.role === 'model' ? "bg-primary text-white" : "bg-slate-200 text-slate-600"
              )}>
                {msg.role === 'model' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </div>
              <div className={cn(
                "max-w-[80%] p-5 rounded-3xl shadow-sm text-sm leading-relaxed",
                msg.role === 'model' 
                  ? "bg-white text-slate-800 rounded-tl-none border border-slate-100" 
                  : "bg-primary text-white rounded-tr-none"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 items-center">
               <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                 <Loader2 className="h-5 w-5 text-primary animate-spin" />
               </div>
               <div className="bg-white border border-slate-100 p-4 rounded-3xl rounded-tl-none flex gap-1.5">
                 <span className="h-1.5 w-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                 <span className="h-1.5 w-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                 <span className="h-1.5 w-1.5 bg-slate-300 rounded-full animate-bounce" />
               </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      <CardFooter className="border-t p-6 bg-white">
        <div className="flex w-full items-center gap-3">
          <Input 
            placeholder="Type your answer..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading || isCompleted}
            className="flex-1 h-14 bg-slate-50 border-none rounded-2xl px-6 focus-visible:ring-primary shadow-inner"
          />
          <Button 
            size="icon" 
            className="h-14 w-14 rounded-2xl shadow-xl shadow-primary/20"
            onClick={handleSend}
            disabled={isLoading || !input.trim() || isCompleted}
          >
            <Send className="h-6 w-6" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
