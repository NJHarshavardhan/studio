
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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Interviews</h1>
        <p className="text-slate-500">Manage and monitor automated candidate interviews.</p>
      </div>

      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md bg-white border">
          <TabsTrigger value="sessions">Past Sessions</TabsTrigger>
          <TabsTrigger value="live">Live Simulation</TabsTrigger>
        </TabsList>
        <TabsContent value="live" className="pt-6">
          <div className="bg-slate-50 rounded-2xl p-8 border-2 border-dashed">
            <div className="max-w-2xl mx-auto text-center mb-8">
               <Bot className="h-12 w-12 text-primary mx-auto mb-4" />
               <h2 className="text-2xl font-bold">Try the AI Agent</h2>
               <p className="text-slate-500 mt-2">Experience exactly what your candidates feel during a dynamic screening session.</p>
            </div>
            <InterviewSession jobDescription={jd} resumeText={resume} />
          </div>
        </TabsContent>
        <TabsContent value="sessions" className="pt-6">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Session ID</TableHead>
                    <TableHead>Job Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Completed Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviews?.map((session: any) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium truncate max-w-[150px]">{session.id}</TableCell>
                      <TableCell>Software Engineer</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                          Completed
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "font-bold",
                          session.score > 80 ? "text-emerald-600" : session.score > 60 ? "text-amber-600" : "text-red-600"
                        )}>{session.score}/100</span>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {new Date(session.completedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" /> View Report
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {interviews?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-slate-500 italic">
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
