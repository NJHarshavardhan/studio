"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Briefcase, Bot, CheckCircle2, TrendingUp, Clock, Loader2, Database, Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, addDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const data = [
  { name: 'Mon', applications: 40, interviews: 24 },
  { name: 'Tue', applications: 30, interviews: 13 },
  { name: 'Wed', applications: 20, interviews: 98 },
  { name: 'Thu', applications: 27, interviews: 39 },
  { name: 'Fri', applications: 18, interviews: 48 },
  { name: 'Sat', applications: 23, interviews: 38 },
  { name: 'Sun', applications: 34, interviews: 43 },
];

export default function Dashboard() {
  const [isSeeding, setIsSeeding] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const candidatesRef = useMemoFirebase(() => firestore ? collection(firestore, "candidates") : null, [firestore]);
  const jobsRef = useMemoFirebase(() => firestore ? collection(firestore, "jobs") : null, [firestore]);
  const interviewsRef = useMemoFirebase(() => firestore ? collection(firestore, "interviews") : null, [firestore]);

  const { data: candidates, loading: loadingAll } = useCollection(candidatesRef);
  const { data: jobs } = useCollection(jobsRef);
  const { data: interviews } = useCollection(interviewsRef);

  const recentReportsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "candidates"), orderBy("appliedDate", "desc"), limit(5));
  }, [firestore]);
  
  const { data: recentCandidates, loading: loadingRecent } = useCollection(recentReportsQuery);

  const stats = [
    { title: "Total Candidates", value: candidates?.length || 0, icon: Users, trend: "+12.5%", isUp: true, color: "text-blue-600", bg: "bg-blue-500/10" },
    { title: "Active Jobs", value: jobs?.length || 0, icon: Briefcase, trend: "+3 new", isUp: true, color: "text-indigo-600", bg: "bg-indigo-500/10" },
    { title: "AI Interviews", value: interviews?.length || 0, icon: Bot, trend: "+24 today", isUp: true, color: "text-purple-600", bg: "bg-purple-500/10" },
    { title: "Hired", value: candidates?.filter((c: any) => c.currentStage === "Selected").length || 0, icon: CheckCircle2, trend: "+2 this week", isUp: true, color: "text-emerald-600", bg: "bg-emerald-500/10" },
  ];

  const seedDemoData = async () => {
    if (!firestore) return;
    setIsSeeding(true);
    
    try {
      const jobRef = await addDoc(collection(firestore, "jobs"), {
        title: "Senior Product Designer",
        description: "Looking for an expert designer to lead our SaaS dashboard transformation.",
        location: "Remote",
        status: "Open",
        createdAt: new Date().toISOString()
      });

      await addDoc(collection(firestore, "candidates"), {
        name: "Alex Rivera",
        email: "alex@example.com",
        phone: "+1 555-0100",
        yearsOfExperience: 8,
        matchScore: 94,
        currentStage: "Shortlisted",
        jobId: jobRef.id,
        appliedDate: new Date().toISOString(),
        interviewStatus: "none"
      });

      toast({
        title: "Demo environment ready",
        description: "Test jobs and candidates have been initialized.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Seeding failed",
        description: "Check your console for details.",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1 text-lg">Recruitment intelligence & pipeline health.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button 
            variant="outline" 
            onClick={seedDemoData} 
            disabled={isSeeding}
            className="rounded-xl border-dashed hover:bg-muted transition-colors"
          >
            {isSeeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
            Initialize Demo Data
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:primary/90">
             <Sparkles className="h-4 w-4 mr-2" /> AI Insights
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm hover:shadow-md transition-all duration-300 group rounded-2xl overflow-hidden bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div className={cn(
                  "flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full",
                  stat.isUp ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                )}>
                  {stat.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.trend}
                </div>
              </div>
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-muted-foreground tracking-tight">{stat.title}</h3>
                <p className="text-3xl font-black text-foreground mt-1 tabular-nums">
                  {loadingAll ? "..." : stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm rounded-2xl bg-card">
          <CardHeader className="pb-0">
            <CardTitle className="text-xl font-bold">Activity Flow</CardTitle>
            <CardDescription>Daily recruitment throughput across stages</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    backgroundColor: 'hsl(var(--card))',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
                <Area type="monotone" dataKey="applications" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorFlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-card">
          <CardHeader className="pb-0">
            <CardTitle className="text-xl font-bold">Session Volume</CardTitle>
            <CardDescription>AI Interview completion trends</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    backgroundColor: 'hsl(var(--card))'
                  }}
                />
                <Bar dataKey="interviews" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl bg-card overflow-hidden">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
               <Sparkles className="h-5 w-5 text-amber-500" /> Recent Talent Matches
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {loadingRecent ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : recentCandidates?.map((report: any) => (
                <div key={report.id} className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center font-black text-primary text-xl border border-primary/10">
                      {report.name ? report.name[0] : 'C'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{report.name}</p>
                      <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">{report.currentStage}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-lg font-black",
                      report.matchScore > 80 ? "text-emerald-500" : report.matchScore > 60 ? "text-amber-500" : "text-red-500"
                    )}>
                      {report.matchScore}%
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center justify-end gap-1.5 font-medium">
                      <Clock className="h-3 w-3" /> {report.appliedDate ? new Date(report.appliedDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
              {recentCandidates?.length === 0 && (
                <div className="text-center py-20">
                  <Users className="h-12 w-12 text-muted/30 mx-auto mb-4" />
                  <p className="text-muted-foreground italic text-sm">No recent matches found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-2xl bg-card p-6">
            <CardTitle className="text-lg font-bold mb-4">Pipeline Actions</CardTitle>
            <div className="space-y-3">
               <Button variant="outline" className="w-full justify-start h-12 rounded-xl group" onClick={() => window.location.href='/dashboard/jobs'}>
                 <Briefcase className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary" /> Create New Position
               </Button>
               <Button variant="outline" className="w-full justify-start h-12 rounded-xl group" onClick={() => window.location.href='/dashboard/screening'}>
                 <Bot className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary" /> Start AI Screening
               </Button>
               <Button variant="outline" className="w-full justify-start h-12 rounded-xl group" onClick={() => window.location.href='/dashboard/analytics'}>
                 <PieChart className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary" /> View Detailed Metrics
               </Button>
            </div>
          </Card>

          <Card className="border-none shadow-lg shadow-primary/5 rounded-2xl bg-primary p-6 text-primary-foreground">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                   <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-bold">AI Pro Tip</h3>
             </div>
             <p className="text-sm opacity-90 leading-relaxed">
               Candidates with a match score above 85% have a 3x higher retention rate. Automate their invites in Settings.
             </p>
          </Card>
        </div>
      </div>
    </div>
  );
}