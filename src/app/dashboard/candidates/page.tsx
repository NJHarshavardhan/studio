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
  Send,
  Loader2,
  Copy,
  Check,
  Briefcase,
  ExternalLink
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, updateDoc, doc, addDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { sendRecruitmentEmail } from "@/ai/flows/send-recruitment-email";
import type { PipelineStage } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [isSendingMail, setIsSendingMail] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    email: "",
    jobId: "",
  });

  const firestore = useFirestore();
  const { toast } = useToast();
  
  const candidatesRef = useMemoFirebase(() => firestore ? collection(firestore, "candidates") : null, [firestore]);
  const { data: candidates, loading: loadingCandidates } = useCollection(candidatesRef);

  const jobsRef = useMemoFirebase(() => firestore ? collection(firestore, "jobs") : null, [firestore]);
  const { data: jobs } = useCollection(jobsRef);

  const filteredCandidates = candidates?.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCopyLink = (candidateId: string) => {
    const url = `${window.location.origin}/interview/${candidateId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(candidateId);
    toast({
      title: "Link Copied",
      description: "Candidate interview link is now in your clipboard.",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleManualAdd = async () => {
    if (!newCandidate.name || !newCandidate.email || !newCandidate.jobId || !firestore) return;
    setIsCreating(true);

    const candidateData = {
      name: newCandidate.name,
      email: newCandidate.email.toLowerCase().trim(),
      jobId: newCandidate.jobId,
      currentStage: "Applied" as PipelineStage,
      appliedDate: new Date().toISOString(),
      matchScore: 0,
      interviewStatus: "none",
    };

    addDoc(collection(firestore, "candidates"), candidateData)
      .then(() => {
        setIsManualAddOpen(false);
        setNewCandidate({ name: "", email: "", jobId: "" });
        toast({
          title: "Candidate Added",
          description: "Candidate successfully manually entered into the pipeline.",
        });
      })
      .catch((e) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: "candidates",
          operation: 'create',
          requestResourceData: candidateData,
        }));
      })
      .finally(() => setIsCreating(false));
  };

  const handleSendInterviewRequest = async (candidate: any) => {
    if (!firestore) return;
    
    setIsSendingMail(candidate.id);
    
    try {
      const emailResult = await sendRecruitmentEmail({
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        type: 'interview_invite',
        jobTitle: jobs?.find(j => j.id === candidate.jobId)?.title || 'Software Engineer'
      });

      addDoc(collection(firestore, "emails"), {
        candidateEmail: candidate.email,
        candidateName: candidate.name,
        subject: emailResult.subject,
        body: emailResult.body,
        type: 'interview_invite',
        sentAt: new Date().toISOString()
      }).catch(e => console.error(e));

      const cRef = doc(firestore, "candidates", candidate.id);
      updateDoc(cRef, {
        interviewStatus: "sent",
        currentStage: "AI Interview"
      }).catch(e => console.error(e));
      
      toast({
        title: "Session Initialized",
        description: "Invite generated. Copy the interview link for the candidate.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Process Failed",
        description: "Could not generate session context.",
      });
    } finally {
      setIsSendingMail(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">Pipeline</h1>
          <p className="text-muted-foreground mt-1 text-base md:text-lg">Visual workflow management for active talent.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input 
               placeholder="Search talent..." 
               className="pl-10 h-10 rounded-xl bg-card border-none focus-visible:ring-1" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <Dialog open={isManualAddOpen} onOpenChange={setIsManualAddOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-lg shadow-primary/20 bg-primary h-11 px-6">
                <UserPlus className="h-4 w-4 mr-2" /> Add Candidate
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Quick Entry</DialogTitle>
                <DialogDescription>Add a candidate directly to the initial pipeline stage.</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Full Name</Label>
                  <Input 
                    placeholder="e.g. John Doe" 
                    className="h-12 rounded-xl"
                    value={newCandidate.name} 
                    onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Email Address</Label>
                  <Input 
                    type="email" 
                    placeholder="john@example.com" 
                    className="h-12 rounded-xl"
                    value={newCandidate.email}
                    onChange={(e) => setNewCandidate({...newCandidate, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Target Job</Label>
                  <Select onValueChange={(val) => setNewCandidate({...newCandidate, jobId: val})}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {jobs?.map(job => (
                        <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-xl h-11" onClick={() => setIsManualAddOpen(false)}>Cancel</Button>
                <Button className="rounded-xl h-11 px-8" onClick={handleManualAdd} disabled={isCreating || !newCandidate.name || !newCandidate.email || !newCandidate.jobId}>
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Save Candidate"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {STAGES.map((stage) => (
          <div key={stage} className="flex-shrink-0 w-80 md:w-85">
            <div className="flex items-center justify-between mb-5 px-1">
              <div className="flex items-center gap-3">
                <h3 className="font-black text-foreground text-xs uppercase tracking-widest">{stage}</h3>
                <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full">
                  {loadingCandidates ? "..." : filteredCandidates.filter(c => c.currentStage === stage).length}
                </span>
              </div>
            </div>
            
            <div className="space-y-4 min-h-[500px] bg-muted/30 rounded-[32px] p-4 border-2 border-dashed border-muted/50">
              {loadingCandidates ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="shadow-sm border-none rounded-2xl overflow-hidden p-5 space-y-4 bg-card">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-10 w-10 rounded-2xl" />
                      <Skeleton className="h-8 w-8 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-9 w-full rounded-xl" />
                    <div className="flex justify-between pt-4 border-t">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </Card>
                ))
              ) : filteredCandidates
                .filter(c => c.currentStage === stage)
                .map((candidate) => (
                  <Card key={candidate.id} className="group cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all shadow-sm bg-card border-none rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-sm font-black text-primary border border-primary/10">
                          {candidate.name ? candidate.name.split(' ').map((n: string) => n[0]).join('') : 'C'}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-foreground truncate">{candidate.name}</h4>
                        <p className="text-[11px] text-muted-foreground font-medium truncate">{candidate.email}</p>
                      </div>
                      
                      <div className="flex items-center gap-1.5 mt-3 mb-4">
                        <div className="p-1 bg-muted rounded-md">
                          <Briefcase className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold truncate">
                          {jobs?.find(j => j.id === candidate.jobId)?.title || "Unknown Position"}
                        </span>
                      </div>
                      
                      {stage === "Shortlisted" && (
                         <Button 
                           variant="outline" 
                           className="w-full h-9 text-[10px] font-black uppercase tracking-wider bg-primary/5 text-primary border-primary/20 hover:bg-primary hover:text-white transition-all rounded-xl"
                           disabled={isSendingMail === candidate.id}
                           onClick={(e) => {
                             e.stopPropagation();
                             handleSendInterviewRequest(candidate);
                           }}
                         >
                           {isSendingMail === candidate.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3 mr-2" />}
                           Initialize AI Session
                         </Button>
                      )}

                      {stage === "AI Interview" && (
                        <div className="space-y-3 pt-2">
                          <Button 
                            variant="outline" 
                            className="w-full h-9 text-[10px] font-black uppercase tracking-wider bg-emerald-500/5 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all rounded-xl"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyLink(candidate.id);
                            }}
                          >
                            {copiedId === candidate.id ? <Check className="h-3 w-3 mr-2" /> : <Copy className="h-3 w-3 mr-2" />}
                            {copiedId === candidate.id ? "Link Copied" : "Copy Session Link"}
                          </Button>
                          <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-widest">Waiting for Response</span>
                          </div>
                        </div>
                      )}

                      <div className="mt-5 pt-4 border-t flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          </div>
                          <span className="text-[11px] font-black text-emerald-600">{candidate.matchScore || 0}% Match</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <FileText className="h-3.5 w-3.5 text-muted-foreground hover:text-primary transition-colors" title="View Resume" />
                           {candidate.interviewStatus === "completed" && (
                             <Video className="h-3.5 w-3.5 text-primary" title="Interview Completed" />
                           )}
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