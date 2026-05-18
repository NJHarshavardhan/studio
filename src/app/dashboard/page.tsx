
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
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground font-headline">Overview</h1>
          <p className="text-muted-foreground mt-1.5 text-lg font-medium">Recruitment intelligence & pipeline health.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
           <Button 
            variant="outline" 
            onClick={seedDemoData} 
            disabled={isSeeding}
            className="rounded-2xl border-none glass-morphism hover:bg-white/50 dark:hover:bg-black/60 h-14 px-8 font-bold shadow-xl"
          >
            {isSeeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
            Initialize Demo
          </Button>
          <Button className="rounded-2xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 h-14 px-8 font-black">
             <Sparkles className="h-4 w-4 mr-2" /> AI Insights
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="glass-morphism border-none rounded-[2.5rem] overflow-hidden hover:scale-[1.02] transition-all duration-500 group shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className={cn("p-4 rounded-[1.5rem] transition-transform group-hover:scale-110", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                {isLoading ? <Skeleton className="h-6 w-14 rounded-full" /> : (
                  <div className={cn(
                    "flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full backdrop-blur-md",
                    stat.isUp ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-red-500/15 text-red-600 dark:text-red-400"
                  )}>
                    {stat.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.trend}
                  </div>
                )}
              </div>
              <div className="mt-8">
                <h3 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] font-headline">{stat.title}</h3>
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
        <Card className="glass-morphism border-none rounded-[2.5rem] overflow-hidden p-2 shadow-xl">
          <CardHeader className="pb-0 pt-8 px-8">
            <CardTitle className="text-2xl font-black text-foreground font-headline">Activity Flow</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">Daily applications & technical throughput</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] mt-8 px-4">
            {isLoading ? (
              <div className="w-full h-full flex flex-col gap-4 p-4">
                <Skeleton className="w-full flex-1 rounded-3xl" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.3)" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '24px', 
                      border: 'none', 
                      backdropFilter: 'blur(16px)',
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                      boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area type="monotone" dataKey="applications" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorFlow)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="glass-morphism border-none rounded-[2.5rem] overflow-hidden p-2 shadow-xl">
          <CardHeader className="pb-0 pt-8 px-8">
            <CardTitle className="text-2xl font-black text-foreground font-headline">Session Volume</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">AI Screening completion trends</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] mt-8 px-4">
             {isLoading ? (
              <div className="w-full h-full flex flex-col gap-4 p-4">
                <div className="flex items-end justify-between flex-1 gap-4">
                   {Array.from({ length: 7 }).map((_, i) => (
                     <Skeleton 
                      key={i} 
                      className="w-full rounded-t-2xl" 
                      style={{ height: skeletonHeights[i] ? `${skeletonHeights[i]}%` : '50%' }} 
                    />
                   ))}
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.3)" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '24px', 
                      border: 'none', 
                      backdropFilter: 'blur(16px)',
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                      boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="interviews" fill="hsl(var(--primary))" radius={[12, 12, 0, 0]} barSize={48} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <Card className="lg:col-span-2 glass-morphism border-none rounded-[3rem] overflow-hidden shadow-2xl">
          <CardHeader className="p-10 border-b border-white/10">
            <CardTitle className="text-2xl font-black flex items-center gap-4 text-foreground font-headline">
               <Sparkles className="h-7 w-7 text-amber-500" /> Recent Talent Matches
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/10">
              {loadingRecent ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-10">
                    <div className="flex items-center gap-6">
                      <Skeleton className="h-14 w-14 rounded-2xl" />
                      <div className="space-y-3">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </div>
                ))
              ) : recentCandidates?.map((report: any) => (
                <div key={report.id} className="flex items-center justify-between p-10 hover:bg-white/20 dark:hover:bg-black/30 transition-all group cursor-pointer">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-2xl border border-primary/20 shadow-xl group-hover:scale-105 transition-transform">
                      {report.name ? report.name[0] : 'C'}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground group-hover:text-primary transition-colors font-headline">{report.name}</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em] mt-1 font-headline">{report.currentStage}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-3xl font-black font-headline",
                      report.matchScore > 80 ? "text-emerald-500" : report.matchScore > 60 ? "text-amber-500" : "text-red-500"
                    )}>
                      {report.matchScore}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="glass-morphism border-none rounded-[3rem] p-10 shadow-xl">
            <CardTitle className="text-xl font-black mb-8 text-foreground font-headline">Pipeline Actions</CardTitle>
            <div className="space-y-5">
               <Button 
                variant="outline" 
                className="w-full justify-start h-15 rounded-2xl group glass-morphism hover:bg-white/50 border-none transition-all px-6 shadow-sm" 
                onClick={() => window.location.href='/dashboard/jobs'}
              >
                 <Briefcase className="h-5 w-5 mr-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" /> 
                 <span className="font-bold text-foreground truncate text-base font-headline">Create Position</span>
               </Button>
               <Button 
                variant="outline" 
                className="w-full justify-start h-15 rounded-2xl group glass-morphism hover:bg-white/50 border-none transition-all px-6 shadow-sm" 
                onClick={() => window.location.href='/dashboard/screening'}
              >
                 <Bot className="h-5 w-5 mr-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" /> 
                 <span className="font-bold text-foreground truncate text-base font-headline">AI Screening</span>
               </Button>
               <Button 
                variant="outline" 
                className="w-full justify-start h-15 rounded-2xl group glass-morphism hover:bg-white/50 border-none transition-all px-6 shadow-sm" 
                onClick={() => window.location.href='/dashboard/analytics'}
              >
                 <PieChart className="h-5 w-5 mr-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" /> 
                 <span className="font-bold text-foreground truncate text-base font-headline">Metrics</span>
               </Button>
            </div>
          </Card>

          <Card className="border-none shadow-2xl shadow-primary/20 rounded-[3rem] bg-primary p-10 text-primary-foreground relative overflow-hidden group">
             <div className="absolute -top-10 -right-10 h-64 w-64 bg-white/10 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-1000" />
             <div className="flex items-center gap-4 mb-6 relative">
                <div className="p-3 bg-white/15 rounded-[1.25rem] backdrop-blur-md">
                   <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-black text-xl font-headline">AI Pro Tip</h3>
             </div>
             <p className="text-sm opacity-95 leading-relaxed font-bold relative">
               Candidates with a match score above 85% are 3x more likely to reach final rounds. Use the AI Interviewer to validate their soft skills early.
             </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
