"use client"

import { InterviewSession } from "@/components/ai/interview-session";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Bot, Clock, ExternalLink } from "lucide-react";

export default function InterviewsPage() {
  const jd = "Senior Product Designer with experience in SaaS dashboards and design systems.";
  const resume = "Product Designer with 8 years of experience building scalable design systems for HR platforms.";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Interviews</h1>
        <p className="text-slate-500">Manage and monitor automated candidate interviews.</p>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md bg-white border">
          <TabsTrigger value="live">Live Simulation</TabsTrigger>
          <TabsTrigger value="sessions">Past Sessions</TabsTrigger>
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
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Job Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "John Doe", role: "Software Engineer", status: "Completed", score: 88, date: "2024-05-15" },
                  { name: "Jane Smith", role: "UI Designer", status: "In Progress", score: null, date: "2024-05-16" },
                  { name: "Mike Jones", role: "Product Manager", status: "Completed", score: 42, date: "2024-05-14" },
                ].map((s, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.role}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === "Completed" ? "secondary" : "outline"} className={s.status === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {s.score ? (
                        <span className={cn(
                          "font-bold",
                          s.score > 80 ? "text-emerald-600" : s.score > 60 ? "text-amber-600" : "text-red-600"
                        )}>{s.score}/100</span>
                      ) : "-"}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {s.date}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" /> View Report
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}