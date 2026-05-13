"use client"

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, User, Send, CheckCircle2 } from "lucide-react";
import { dynamicAIInterviewAndEvaluation, type DynamicAIInterviewOutput } from "@/ai/flows/dynamic-ai-interview-and-evaluation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useFirestore } from "@/firebase";
import { collection, addDoc, updateDoc, doc, getDoc } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
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
      console.error(error);
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

        // Save session data to Firestore and trigger "Thank You" email
        if (candidateId && firestore) {
          const interviewsCol = collection(firestore, "interviews");
          const interviewData = {
            candidateId,
            jobId,
            status: "completed",
            score: response.interviewScore || 0,
            summary: response.interviewSummary || "",
            transcript: response.transcript || updatedHistory.map(m => `${m.role}: ${m.content}`).join('\n'),
            completedAt: new Date().toISOString()
          };

          addDoc(interviewsCol, interviewData).catch(async (e) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: interviewsCol.path,
              operation: 'create',
              requestResourceData: interviewData
            }));
          });

          // Update candidate status and send email
          const candidateRef = doc(firestore, "candidates", candidateId);
          getDoc(candidateRef).then(async (snap) => {
             if (snap.exists()) {
                const candidate = snap.data();
                // Send "Thank You" AI email
                await sendRecruitmentEmail({
                  candidateName: candidate.name,
                  candidateEmail: candidate.email,
                  type: 'interview_thank_you',
                  jobTitle: 'Senior Developer'
                });
             }
          });

          updateDoc(candidateRef, {
            currentStage: "HR Review",
            interviewStatus: "completed"
          }).catch(async (e) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: candidateRef.path,
              operation: 'update'
            }));
          });
        }
      } else if (response.nextQuestion) {
        setMessages(prev => [...prev, { role: 'model', content: response.nextQuestion! }]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCompleted && report) {
    return (
      <Card className="max-w-3xl mx-auto border-none shadow-lg overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="bg-emerald-600 p-8 text-white text-center">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Interview Completed</h2>
          <p className="opacity-90 mt-2">The session has been analyzed and a confirmation email has been sent.</p>
        </div>
        <CardContent className="p-8 space-y-8">
          <div className="flex justify-center">
            <div className="text-center">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">Interview Score</span>
              <div className="text-6xl font-extrabold text-slate-900 mt-2">{report.interviewScore}/100</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
               <Bot className="h-5 w-5 text-primary" /> AI Evaluation Summary
            </h3>
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-xl border italic">
              "{report.interviewSummary}"
            </p>
          </div>

          <div className="pt-4">
            <Button className="w-full" variant="outline" onClick={() => window.location.reload()}>
              Close Session
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto h-[600px] flex flex-col border-none shadow-xl bg-white overflow-hidden">
      <CardHeader className="border-b bg-slate-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Recruitment Agent</CardTitle>
              <p className="text-xs text-slate-500">Live technical screening interview</p>
            </div>
          </div>
          <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
            Active Session
          </Badge>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 p-6 bg-slate-50/30">
        <div className="space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={cn(
              "flex gap-3",
              msg.role === 'user' ? "flex-row-reverse" : "flex-row"
            )}>
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                msg.role === 'model' ? "bg-primary text-white" : "bg-slate-200 text-slate-600"
              )}>
                {msg.role === 'model' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div className={cn(
                "max-w-[80%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed",
                msg.role === 'model' 
                  ? "bg-white text-slate-800 rounded-tl-none border border-slate-100" 
                  : "bg-primary text-white rounded-tr-none"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 animate-pulse">
               <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                 <Bot className="h-4 w-4 text-slate-400" />
               </div>
               <div className="bg-slate-200 h-10 w-32 rounded-2xl rounded-tl-none"></div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <CardFooter className="border-t p-4 bg-white">
        <div className="flex w-full items-center gap-2">
          <Input 
            placeholder="Type your response..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading || isCompleted}
            className="flex-1 h-12 bg-slate-50 border-none rounded-full px-6 focus-visible:ring-primary"
          />
          <Button 
            size="icon" 
            className="h-12 w-12 rounded-full shadow-lg shadow-primary/20"
            onClick={handleSend}
            disabled={isLoading || !input.trim() || isCompleted}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
