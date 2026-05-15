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
      <Card className="max-w-3xl mx-auto border-none shadow-2xl overflow-hidden rounded-[3rem] bg-card">
        <div className="bg-gradient-to-br from-primary to-primary/80 p-16 text-white text-center relative">
          <div className="absolute top-6 right-6 bg-white/10 p-3 rounded-2xl backdrop-blur-md">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <CheckCircle2 className="h-24 w-24 mx-auto mb-8 text-white animate-in zoom-in duration-500" />
          <h2 className="text-4xl font-black font-headline">Session Concluded</h2>
          <p className="opacity-90 mt-4 text-xl font-medium">Thank you! Your AI screening session has been processed and saved securely.</p>
        </div>
        <CardContent className="p-16 space-y-12 bg-card">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">AI Fitment Analysis</span>
            <div className="relative mt-10">
              <svg className="h-40 w-40 -rotate-90">
                <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-muted/30" />
                <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={465} strokeDashoffset={465 - (465 * (report.interviewScore || 0)) / 100} className="text-primary transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-black text-foreground font-headline">{report.interviewScore}%</span>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <h3 className="text-lg font-black flex items-center gap-3 text-foreground font-headline">
               <Bot className="h-6 w-6 text-primary" /> Screening Intelligence Summary
            </h3>
            <div className="bg-muted/30 p-8 rounded-[2rem] border border-border">
              <p className="text-foreground font-medium leading-relaxed italic text-base">"{report.interviewSummary}"</p>
            </div>
          </div>
          <div className="pt-8">
            <Button className="w-full h-16 text-xl font-black rounded-3xl shadow-2xl shadow-primary/20" onClick={() => window.location.href = '/candidate/portal'}>
              Return to Journey Portal
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto h-[700px] flex flex-col border-none shadow-2xl bg-card overflow-hidden rounded-[3rem]">
      <CardHeader className="border-b bg-card px-10 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="bg-primary p-3 rounded-2xl text-white shadow-xl shadow-primary/20">
              <Bot className="h-7 w-7" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black font-headline text-foreground">AI Screening Session</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Live Neural Bridge Active</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">
            Agent Online
          </Badge>
        </div>
      </CardHeader>
      <ScrollArea className="flex-1 p-10 bg-muted/5">
        <div className="space-y-10">
          {messages.map((msg, idx) => (
            <div key={idx} className={cn(
              "flex gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300",
              msg.role === 'user' ? "flex-row-reverse" : "flex-row"
            )}>
              <div className={cn(
                "h-12 w-12 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 mt-1 shadow-lg",
                msg.role === 'model' ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              )}>
                {msg.role === 'model' ? <Bot className="h-6 w-6" /> : <User className="h-6 w-6" />}
              </div>
              <div className={cn(
                "max-w-[85%] p-6 rounded-[2rem] shadow-sm text-sm font-medium leading-relaxed",
                msg.role === 'model' 
                  ? "bg-card text-foreground rounded-tl-none border border-border" 
                  : "bg-primary text-white rounded-tr-none"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-5 items-center">
               <div className="h-12 w-12 rounded-[1.25rem] bg-muted/50 flex items-center justify-center shadow-inner">
                 <Loader2 className="h-6 w-6 text-primary animate-spin" />
               </div>
               <div className="bg-card border border-border p-5 rounded-[2rem] rounded-tl-none flex gap-2">
                 <span className="h-2 w-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                 <span className="h-2 w-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                 <span className="h-2 w-2 bg-primary/40 rounded-full animate-bounce" />
               </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      <CardFooter className="border-t p-8 bg-card">
        <div className="flex w-full items-center gap-4">
          <Input 
            placeholder="Type your response..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading || isCompleted}
            className="flex-1 h-16 bg-muted/20 border-none rounded-2xl px-8 focus-visible:ring-primary shadow-inner font-medium text-base"
          />
          <Button 
            size="icon" 
            className="h-16 w-16 rounded-2xl shadow-2xl shadow-primary/20 group transition-transform active:scale-95"
            onClick={handleSend}
            disabled={isLoading || !input.trim() || isCompleted}
          >
            <Send className="h-8 w-8 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
