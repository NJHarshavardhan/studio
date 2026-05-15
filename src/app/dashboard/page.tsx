
"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Briefcase, Bot, CheckCircle2, Database, Sparkles, ArrowUpRight, ArrowDownRight, PieChart, Clock, Loader2 } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";

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
  const [skeletonHeights, setSkeletonHeights] = useState<number[]>([]);
  const firestore = useFirestore();
  const { toast } = useToast();
  
  useEffect(() => {
    setSkeletonHeights(Array.from({ length: 7 }, () => Math.floor(Math.random() * 60) + 20));
  }, []);

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
    { title: "Total Candidates", value: candidates?.length || 0, icon: Users, trend: "+12.5%", isUp: true, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
    { title: "Active Jobs", value: jobs?.length || 0, icon: Briefcase, trend: "+3 new", isUp: true, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-500/10" },
    { title: "AI Interviews", value: interviews?.length || 0, icon: Bot, trend: "+24 today", isUp: true, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
    { title: "Hired", value: candidates?.filter((c: any) => c.currentStage === "Selected").length || 0, icon: CheckCircle2, trend: "+2 this week", isUp: true, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
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

  const isLoading = loadingAll || !firestore;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground font-headline">Overview</h1>
          <p className="text-muted-foreground mt-1 text-base md:text-lg font-medium">Recruitment intelligence & pipeline health.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
           <Button 
            variant="outline" 
            onClick={seedDemoData} 
            disabled={isSeeding}
            className="rounded-xl border-dashed hover:bg-muted transition-colors h-12 px-6"
          >
            {isSeeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
            Initialize Demo Data
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 h-12 px-6 font-bold">
             <Sparkles className="h-4 w-4 mr-2" /> AI Insights
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm hover:shadow-md transition-all duration-300 group rounded-3xl overflow-hidden bg-card">
            <CardContent className="p-7">
              <div className="flex items-center justify-between">
                <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                {isLoading ? <Skeleton className="h-6 w-16 rounded-full" /> : (
                  <div className={cn(
                    "flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full",
                    stat.isUp ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
                  )}>
                    {stat.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.trend}
                  </div>
                )}
              </div>
              <div className="mt-6">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</h3>
                {isLoading ? <Skeleton className="h-10 w-20 mt-2" /> : (
                  <p className="text-4xl font-black text-foreground mt-2 tabular-nums font-headline">
                    {stat.value}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm rounded-3xl bg-card overflow-hidden">
          <CardHeader className="pb-0 pt-8 px-8">
            <CardTitle className="text-xl font-black text-foreground font-headline">Activity Flow</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">Daily recruitment throughput across stages</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] mt-6 px-4">
            {isLoading ? (
              <div className="w-full h-full flex flex-col gap-4 p-4">
                <Skeleton className="w-full flex-1 rounded-2xl" />
                <div className="flex justify-between">
                   {[1,2,3,4,5,6,7].map(i => <Skeleton key={i} className="h-4 w-8" />)}
                </div>
              </div>
            ) : (
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
                      borderRadius: '20px', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                      backgroundColor: 'hsl(var(--card))',
                      color: 'hsl(var(--card-foreground))'
                    }}
                  />
                  <Area type="monotone" dataKey="applications" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorFlow)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl bg-card overflow-hidden">
          <CardHeader className="pb-0 pt-8 px-8">
            <CardTitle className="text-xl font-black text-foreground font-headline">Session Volume</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">AI Interview completion trends</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] mt-6 px-4">
             {isLoading ? (
              <div className="w-full h-full flex flex-col gap-4 p-4">
                <div className="flex items-end justify-between flex-1 gap-3">
                   {Array.from({ length: 7 }).map((_, i) => (
                     <Skeleton 
                      key={i} 
                      className="w-full rounded-t-xl" 
                      style={{ height: skeletonHeights[i] ? `${skeletonHeights[i]}%` : '50%' }} 
                    />
                   ))}
                </div>
                <div className="flex justify-between">
                   {[1,2,3,4,5,6,7].map(i => <Skeleton key={i} className="h-4 w-8" />)}
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '20px', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                      backgroundColor: 'hsl(var(--card))'
                    }}
                  />
                  <Bar dataKey="interviews" fill="hsl(var(--primary))" radius={[10, 10, 0, 0]} barSize={44} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl bg-card overflow-hidden">
          <CardHeader className="border-b bg-muted/20 p-8">
            <CardTitle className="text-xl font-black flex items-center gap-3 text-foreground font-headline">
               <Sparkles className="h-6 w-6 text-amber-500" /> Recent Talent Matches
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {loadingRecent ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-8">
                    <div className="flex items-center gap-5">
                      <Skeleton className="h-14 w-14 rounded-2xl" />
                      <div className="space-y-3">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <div className="text-right space-y-3">
                      <Skeleton className="h-8 w-14 ml-auto" />
                      <Skeleton className="h-4 w-28 ml-auto" />
                    </div>
                  </div>
                ))
              ) : recentCandidates?.map((report: any) => (
                <div key={report.id} className="flex items-center justify-between p-8 hover:bg-muted/30 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center font-black text-primary text-2xl border border-primary/10 shadow-sm">
                      {report.name ? report.name[0] : 'C'}
                    </div>
                    <div>
                      <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors font-headline">{report.name}</p>
                      <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{report.currentStage}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-2xl font-black font-headline",
                      report.matchScore > 80 ? "text-emerald-500" : report.matchScore > 60 ? "text-amber-500" : "text-red-500"
                    )}>
                      {report.matchScore}%
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center justify-end gap-1.5 font-bold uppercase tracking-wider mt-1">
                      <Clock className="h-3.5 w-3.5" /> {report.appliedDate ? new Date(report.appliedDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
              {!loadingRecent && recentCandidates?.length === 0 && (
                <div className="text-center py-24">
                  <Users className="h-16 w-16 text-muted/20 mx-auto mb-6" />
                  <p className="text-muted-foreground italic text-lg font-medium">No recent matches found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="border-none shadow-sm rounded-3xl bg-card p-8">
            <CardTitle className="text-xl font-black mb-8 text-foreground font-headline">Pipeline Actions</CardTitle>
            <div className="space-y-4">
               <Button 
                variant="outline" 
                className="w-full justify-start h-14 rounded-2xl group hover:border-primary/50 transition-all px-5 border-2" 
                onClick={() => window.location.href='/dashboard/jobs'}
              >
                 <Briefcase className="h-5 w-5 mr-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" /> 
                 <span className="font-bold text-foreground truncate text-base">Create New Position</span>
               </Button>
               <Button 
                variant="outline" 
                className="w-full justify-start h-14 rounded-2xl group hover:border-primary/50 transition-all px-5 border-2" 
                onClick={() => window.location.href='/dashboard/screening'}
              >
                 <Bot className="h-5 w-5 mr-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" /> 
                 <span className="font-bold text-foreground truncate text-base">Start AI Screening</span>
               </Button>
               <Button 
                variant="outline" 
                className="w-full justify-start h-14 rounded-2xl group hover:border-primary/50 transition-all px-5 border-2" 
                onClick={() => window.location.href='/dashboard/analytics'}
              >
                 <PieChart className="h-5 w-5 mr-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" /> 
                 <span className="font-bold text-foreground truncate text-base">Detailed Metrics</span>
               </Button>
            </div>
          </Card>

          <Card className="border-none shadow-2xl shadow-primary/10 rounded-3xl bg-primary p-8 text-primary-foreground relative overflow-hidden">
             <div className="absolute -top-10 -right-10 h-40 w-40 bg-white/10 rounded-full blur-3xl" />
             <div className="flex items-center gap-4 mb-6 relative">
                <div className="p-3 bg-white/20 rounded-2xl shadow-inner">
                   <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-black text-xl font-headline">AI Pro Tip</h3>
             </div>
             <p className="text-sm opacity-90 leading-relaxed font-medium relative">
               Candidates with a match score above 85% have a 3x higher retention rate. Use the "AI Screening" tool to quickly identify top-tier talent from bulk uploads.
             </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
