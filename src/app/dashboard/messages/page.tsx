
"use client"

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Search, Clock, User, ArrowRight, Loader2, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const firestore = useFirestore();
  
  const emailsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "emails"), orderBy("sentAt", "desc"));
  }, [firestore]);

  const { data: emails, loading } = useCollection(emailsQuery);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Communication Center</h1>
          <p className="text-slate-500">Track all AI-generated emails sent to candidates.</p>
        </div>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Developer Note</AlertTitle>
        <AlertDescription className="text-blue-700 text-xs">
          This system currently simulates email delivery. To enable real delivery to candidates' inboxes, you must connect a provider like Resend or SendGrid in the Genkit flow.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        {/* Email List */}
        <Card className="lg:col-span-1 flex flex-col overflow-hidden border-none shadow-sm">
          <CardHeader className="border-b bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search messages..." className="pl-10 bg-slate-50 border-none" />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-12 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : emails?.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm italic">
                  No messages sent yet.
                </div>
              ) : (
                emails?.map((email: any) => (
                  <div 
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-slate-50 transition-colors",
                      selectedEmail?.id === email.id ? "bg-slate-50 border-l-4 border-l-primary" : ""
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-semibold truncate max-w-[150px]">{email.candidateName}</h4>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(email.sentAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium truncate mb-1">{email.subject}</p>
                    <Badge variant="outline" className="text-[8px] h-4 py-0 uppercase">
                      {email.type?.replace('_', ' ')}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Email Preview */}
        <Card className="lg:col-span-2 border-none shadow-sm flex flex-col bg-white overflow-hidden">
          {selectedEmail ? (
            <>
              <CardHeader className="border-b">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {selectedEmail.candidateName[0]}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{selectedEmail.candidateName}</CardTitle>
                      <CardDescription>{selectedEmail.candidateEmail}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                    SENT SIMULATED
                  </Badge>
                </div>
              </CardHeader>
              <ScrollArea className="flex-1 p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subject</span>
                    <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedEmail.subject}</h2>
                  </div>
                  <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 min-h-[300px]">
                    <p className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm">
                      {selectedEmail.body}
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
              <div className="p-4 rounded-full bg-slate-50 mb-4">
                <Mail className="h-8 w-8 text-slate-200" />
              </div>
              <h3 className="text-lg font-medium">Select a message</h3>
              <p className="text-sm max-w-xs mt-1">Choose an email from the list to preview the AI-generated content sent to the candidate.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
