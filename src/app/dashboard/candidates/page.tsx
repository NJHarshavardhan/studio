"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Video, 
  CheckCircle2, 
  UserPlus
} from "lucide-react";
import { Input } from "@/components/ui/input";

const STAGES = [
  "Applied",
  "AI Screening",
  "Shortlisted",
  "AI Interview",
  "HR Review",
  "Selected"
];

const INITIAL_CANDIDATES = [
  { id: "1", name: "Alice Cooper", role: "Frontend Dev", score: 92, stage: "Applied" },
  { id: "2", name: "Bob Martin", role: "UX Designer", score: 85, stage: "AI Screening" },
  { id: "3", name: "Charlie Day", role: "Fullstack Dev", score: 78, stage: "Shortlisted" },
  { id: "4", name: "Diana Prince", role: "Product Manager", score: 95, stage: "AI Interview" },
  { id: "5", name: "Evan Wright", role: "Data Scientist", score: 88, stage: "HR Review" },
];

export default function CandidatesPipeline() {
  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Candidates Pipeline</h1>
          <p className="text-slate-500">Manage your recruitment workflow stages.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" /> Add Candidate
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search candidates..." className="pl-10" />
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {STAGES.map((stage) => (
          <div key={stage} className="flex-shrink-0 w-72">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900">{stage}</h3>
                <Badge variant="secondary" className="rounded-full px-2 py-0">
                  {candidates.filter(c => c.stage === stage).length}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4 text-slate-400" />
              </Button>
            </div>
            
            <div className="space-y-3 min-h-[500px] bg-slate-50 rounded-xl p-3 border border-dashed border-slate-200">
              {candidates
                .filter(c => c.stage === stage)
                .map((candidate) => (
                  <Card key={candidate.id} className="group cursor-pointer hover:border-primary transition-colors shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900">{candidate.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{candidate.role}</p>
                      
                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          <span className="text-[10px] font-bold text-emerald-600">{candidate.score}% Match</span>
                        </div>
                        <div className="flex -space-x-1">
                           {stage === "AI Screening" && <FileText className="h-3 w-3 text-slate-400" />}
                           {stage === "AI Interview" && <Video className="h-3 w-3 text-primary" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}