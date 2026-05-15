"use client"

import { useMemo } from "react";
import { InterviewSession } from "@/components/ai/interview-session";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Clock, ExternalLink, Loader2 } from "lucide-react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase";
import { cn } from "@/lib/utils";

export default function InterviewsPage() {
  const firestore = useFirestore();
  
  const interviewsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "interviews"), orderBy("completedAt", "desc"));
  }, [firestore]);

  const { data: interviews, loading } = useCollection(interviewsQuery);

  const jd = "Senior Product Designer with experience in SaaS dashboards and design systems.";
  const resume = "Product Designer with 8 years of experience building scalable design systems for HR platforms.";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">AI Interviews</h1>
        <p className="text-muted-foreground">Manage and monitor automated candidate interviews.</p>
      </div>

      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md bg-muted/20 border border-border rounded-2xl p-1">
          <TabsTrigger value="sessions" className="rounded-xl font-bold">Past Sessions</TabsTrigger>
          <TabsTrigger value="live" className="rounded-xl font-bold">Live Simulation</TabsTrigger>
        </TabsList>
        <TabsContent value="live" className="pt-6">
          <div className="bg-muted/5 rounded-[40px] p-8 border-2 border-dashed border-border">
            <div className="max-w-2xl mx-auto text-center mb-8">
               <Bot className="h-12 w-12 text-primary mx-auto mb-4" />
               <h2 className="text-2xl font-extrabold text-foreground">Try the AI Agent</h2>
               <p className="text-muted-foreground mt-2 font-medium">Experience exactly what your candidates feel during a dynamic screening session.</p>
            </div>
            <InterviewSession jobDescription={jd} resumeText={resume} />
          </div>
        </TabsContent>
        <TabsContent value="sessions" className="pt-6">
          <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-border">
                    <TableHead className="font-bold text-foreground">Session ID</TableHead>
                    <TableHead className="font-bold text-foreground">Job Role</TableHead>
                    <TableHead className="font-bold text-foreground">Status</TableHead>
                    <TableHead className="font-bold text-foreground">Score</TableHead>
                    <TableHead className="font-bold text-foreground">Completed Date</TableHead>
                    <TableHead className="text-right font-bold text-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviews?.map((session: any) => (
                    <TableRow key={session.id} className="border-border hover:bg-muted/20">
                      <TableCell className="font-bold text-foreground truncate max-w-[150px]">{session.id}</TableCell>
                      <TableCell className="text-muted-foreground font-medium">Software Engineer</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          Completed
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "font-black text-lg",
                          session.score > 80 ? "text-emerald-600" : session.score > 60 ? "text-amber-600" : "text-red-600"
                        )}>{session.score}/100</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm font-medium">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {new Date(session.completedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="rounded-xl font-bold">
                          <ExternalLink className="h-4 w-4 mr-2" /> View Report
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {interviews?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic font-medium">
                        No completed interview sessions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
