"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, MapPin, Clock, Loader2, Trash2 } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, doc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const jobsRef = useMemoFirebase(() => firestore ? collection(firestore, "jobs") : null, [firestore]);
  const { data: jobs, loading } = useCollection(jobsRef);

  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    location: "Remote",
  });

  const handleCreateJob = () => {
    if (!firestore || !jobsRef) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Firestore is not initialized yet. Please wait a moment."
      });
      return;
    }

    if (!newJob.title || !newJob.description) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please provide both a title and a description."
      });
      return;
    }

    setIsCreating(true);

    const jobData = {
      title: newJob.title,
      description: newJob.description,
      location: newJob.location,
      status: "Open" as const,
      createdAt: new Date().toISOString()
    };

    addDoc(jobsRef, jobData)
      .then(() => {
        setIsDialogOpen(false);
        setNewJob({ title: "", description: "", location: "Remote" });
        toast({ title: "Job Created", description: "Your job opening is now active." });
      })
      .catch((e) => {
        const permissionError = new FirestorePermissionError({
          path: jobsRef.path,
          operation: 'create',
          requestResourceData: jobData
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setIsCreating(false));
  };

  const handleDeleteJob = (id: string) => {
    if (!firestore) return;
    const jobDoc = doc(firestore, "jobs", id);
    deleteDoc(jobDoc).catch((e) => {
      const permissionError = new FirestorePermissionError({
        path: jobDoc.path,
        operation: 'delete'
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Job Openings</h1>
          <p className="text-slate-500">Manage positions and track applications.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Post New Job
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Job Position</DialogTitle>
              <DialogDescription>Define the requirements for your new AI-powered screening pipeline.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input value={newJob.title} onChange={(e) => setNewJob({...newJob, title: e.target.value})} placeholder="e.g. Senior React Developer" />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={newJob.location} onChange={(e) => setNewJob({...newJob, location: e.target.value})} placeholder="e.g. Remote, San Francisco" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={newJob.description} onChange={(e) => setNewJob({...newJob, description: e.target.value})} placeholder="Outline the key responsibilities..." className="min-h-[150px]" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateJob} disabled={isCreating || !firestore}>
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Create Job"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-none shadow-sm space-y-4 p-6 bg-card">
              <div className="flex justify-between items-start">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <div className="flex gap-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </Card>
          ))
        ) : jobs?.map((job: any) => (
          <Card key={job.id} className="border-none shadow-sm hover:shadow-md transition-shadow group">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Briefcase className="h-5 w-5" />
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteJob(job.id)} className="h-8 w-8 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-xl mt-4">{job.title}</CardTitle>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 line-clamp-3 mb-4">{job.description}</p>
              <div className="flex justify-between items-center pt-4 border-t">
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">Active</Badge>
                <Button variant="link" className="text-primary text-xs h-auto p-0">View Applications</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && jobs?.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 rounded-3xl border-2 border-dashed flex flex-col items-center">
            <Briefcase className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500">No active job positions found. Start by posting one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
