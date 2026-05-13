"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, FileText, CheckCircle2, Clock, ArrowRight, Briefcase } from "lucide-react";
import Link from "next/link";

export default function CandidatePortal() {
  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <header className="h-16 bg-white border-b px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="bg-primary p-1.5 rounded-lg text-white">
            <Bot className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">HirePulse</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">Alex Rivera</p>
            <p className="text-[10px] text-slate-500">alex@example.com</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            AR
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-12 px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
               <h2 className="text-2xl font-bold mb-6">Active Applications</h2>
               <div className="space-y-4">
                 <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                   <CardContent className="p-6">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                       <div className="flex items-start gap-4">
                         <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                           <Briefcase className="h-6 w-6" />
                         </div>
                         <div>
                           <h3 className="text-lg font-bold">Senior Product Designer</h3>
                           <p className="text-sm text-slate-500">Design Systems Inc. • Remote</p>
                           <div className="flex items-center gap-4 mt-4">
                             <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1">
                               AI Screening Passed
                             </Badge>
                             <div className="flex items-center gap-1 text-xs text-slate-400">
                               <Clock className="h-3 w-3" /> Applied 2 days ago
                             </div>
                           </div>
                         </div>
                       </div>
                       <div className="flex flex-col gap-2">
                          <Button asChild>
                            <Link href="/dashboard/interviews">
                              Start AI Interview <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" className="text-xs text-slate-500">
                            Withdraw Application
                          </Button>
                       </div>
                     </div>
                   </CardContent>
                 </Card>

                 <Card className="border-none shadow-sm opacity-60 grayscale bg-slate-50">
                   <CardContent className="p-6">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                       <div className="flex items-start gap-4">
                         <div className="p-3 rounded-xl bg-slate-100 text-slate-400">
                           <Briefcase className="h-6 w-6" />
                         </div>
                         <div>
                           <h3 className="text-lg font-bold">Lead Frontend Engineer</h3>
                           <p className="text-sm text-slate-500">TechFlow Systems • New York</p>
                           <div className="flex items-center gap-4 mt-4">
                             <Badge variant="outline" className="text-slate-500 border-slate-200">
                               Rejected
                             </Badge>
                             <div className="flex items-center gap-1 text-xs text-slate-400">
                               <Clock className="h-3 w-3" /> Closed 1 week ago
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               </div>
            </section>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-primary text-white">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bot className="h-5 w-5" /> AI Assistant Tips
                </CardTitle>
                <CardDescription className="text-white/80">Make your application stand out</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300 mt-1 flex-shrink-0" />
                  <p className="text-xs">Ensure your resume PDF is text-readable for our AI scanners.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300 mt-1 flex-shrink-0" />
                  <p className="text-xs">Focus on your key metrics and technical achievements.</p>
                </div>
                <Button className="w-full bg-white text-primary hover:bg-slate-100">
                  Optimize Profile
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">My Resume</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="flex items-center justify-between p-3 rounded-lg border border-dashed hover:border-primary transition-colors cursor-pointer group">
                   <div className="flex items-center gap-3">
                     <FileText className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                     <div className="min-w-0">
                       <p className="text-sm font-medium truncate">Alex_Rivera_CV.pdf</p>
                       <p className="text-[10px] text-slate-400">Updated 2h ago</p>
                     </div>
                   </div>
                   <Button variant="ghost" size="icon" className="h-8 w-8">
                     <ArrowRight className="h-4 w-4" />
                   </Button>
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}