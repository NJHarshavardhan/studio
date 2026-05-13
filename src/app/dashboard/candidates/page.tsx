
"use client"

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  Search, 
  Filter, 
  FileText, 
  Video, 
  CheckCircle2, 
  UserPlus,
  Mail,
  Send,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, updateDoc, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { Candidate, PipelineStage } from "@/lib/types";

const STAGES: PipelineStage[] = [
  "Applied",
  "AI Screening",
  "Shortlisted",
  "AI Interview",
  "HR Review",
  "Selected"
];

export default function CandidatesPipeline() {
  const [searchTerm, setSearchTerm] = useState("");
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const candidatesRef = useMemo(() => firestore ? collection(firestore, "candidates") : null, [firestore]);
  const { data: candidates, loading } = useCollection(candidatesRef);

  const filteredCandidates = candidates?.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSendInterviewRequest = async (candidateId: string, email: string) => {
    if (!firestore) return;
    
    try {
      const cRef = doc(firestore, "candidates", candidateId);
      await updateDoc(cRef, {
        interviewStatus: "sent",
        currentStage: "AI Interview"
      });
      
      toast({
        title: "Interview Request Sent",
        description: `An AI interview link has been sent to ${email}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update candidate status.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <Input 
            placeholder="Search candidates..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {STAGES.map((stage) => (
          <div key={stage} className="flex-shrink-0 w-80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900">{stage}</h3>
                <Badge variant="secondary" className="rounded-full px-2 py-0">
                  {filteredCandidates.filter(c => c.currentStage === stage).length}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3 min-h-[500px] bg-slate-50 rounded-xl p-3 border border-dashed border-slate-200">
              {filteredCandidates
                .filter(c => c.currentStage === stage)
                .map((candidate) => (
                  <Card key={candidate.id} className="group cursor-pointer hover:border-primary transition-colors shadow-sm bg-white">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {candidate.name?.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900">{candidate.name}</h4>
                      <p className="text-[10px] text-slate-500 truncate mb-2">{candidate.email}</p>
                      
                      {stage === "Shortlisted" && (
                         <Button 
                           variant="outline" 
                           size="sm" 
                           className="w-full mt-2 h-7 text-[10px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
                           onClick={(e) => {
                             e.stopPropagation();
                             handleSendInterviewRequest(candidate.id, candidate.email);
                           }}
                         >
                           <Send className="h-3 w-3 mr-1" /> Request AI Interview
                         </Button>
                      )}

                      {stage === "AI Interview" && candidate.interviewStatus === "sent" && (
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-amber-600 font-medium italic">
                          <Video className="h-3 w-3" /> Waiting for response...
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          <span className="text-[10px] font-bold text-emerald-600">{candidate.matchScore}% Match</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <FileText className="h-3 w-3 text-slate-400" />
                           {candidate.interviewStatus === "completed" && <Video className="h-3 w-3 text-primary" />}
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
