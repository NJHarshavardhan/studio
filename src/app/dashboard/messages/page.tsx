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
import { Skeleton } from "@/components/ui/skeleton";

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
          <h1 className="text-3xl font-black tracking-tight text-foreground">Communication Center</h1>
          <p className="text-muted-foreground">Track all AI-generated emails sent to candidates.</p>
        </div>
      </div>

      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-200">Developer Note</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300 text-xs">
          This system currently simulates email delivery. To enable real delivery to candidates' inboxes, you must connect a provider like Resend or SendGrid in the Genkit flow.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        {/* Email List */}
        <Card className="lg:col-span-1 flex flex-col overflow-hidden border-none shadow-sm bg-card">
          <CardHeader className="border-b bg-card">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-10 bg-muted/30 border-none" />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-4 w-20 rounded-full" />
                  </div>
                ))
              ) : emails?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm italic">
                  No messages sent yet.
                </div>
              ) : (
                emails?.map((email: any) => (
                  <div 
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                      selectedEmail?.id === email.id ? "bg-muted/50 border-l-4 border-l-primary" : ""
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold truncate max-w-[150px] text-foreground">{email.candidateName}</h4>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(email.sentAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium truncate mb-1">{email.subject}</p>
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
        <Card className="lg:col-span-2 border-none shadow-sm flex flex-col bg-card overflow-hidden">
          {selectedEmail ? (
            <>
              <CardHeader className="border-b">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {selectedEmail.candidateName[0]}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black text-foreground">{selectedEmail.candidateName}</CardTitle>
                      <CardDescription className="text-muted-foreground">{selectedEmail.candidateEmail}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    SENT SIMULATED
                  </Badge>
                </div>
              </CardHeader>
              <ScrollArea className="flex-1 p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div>
                    <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Subject</span>
                    <h2 className="text-xl font-extrabold text-foreground mt-1">{selectedEmail.subject}</h2>
                  </div>
                  <div className="p-8 bg-muted/20 rounded-3xl border border-border min-h-[300px]">
                    <p className="whitespace-pre-wrap text-foreground leading-relaxed text-sm">
                      {selectedEmail.body}
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12 text-center">
              <div className="p-4 rounded-3xl bg-muted/30 mb-4">
                <Mail className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Select a message</h3>
              <p className="text-sm max-w-xs mt-1">Choose an email from the list to preview the AI-generated content sent to the candidate.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
