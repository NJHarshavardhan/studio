
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Briefcase, Bot, CheckCircle2, TrendingUp, Clock, Loader2 } from "lucide-react";
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
import { collection, query, orderBy, limit } from "firebase/firestore";
import { cn } from "@/lib/utils";

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
  const firestore = useFirestore();
  
  const candidatesRef = useMemoFirebase(() => firestore ? collection(firestore, "candidates") : null, [firestore]);
  const jobsRef = useMemoFirebase(() => firestore ? collection(firestore, "jobs") : null, [firestore]);
  const interviewsRef = useMemoFirebase(() => firestore ? collection(firestore, "interviews") : null, [firestore]);

  const { data: candidates } = useCollection(candidatesRef);
  const { data: jobs } = useCollection(jobsRef);
  const { data: interviews } = useCollection(interviewsRef);

  const recentReportsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "candidates"), orderBy("appliedDate", "desc"), limit(5));
  }, [firestore]);
  
  const { data: recentCandidates, loading: loadingRecent } = useCollection(recentReportsQuery);

  const stats = [
    { title: "Total Candidates", value: candidates?.length || 0, icon: Users, trend: "+12.5%", color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Active Jobs", value: jobs?.length || 0, icon: Briefcase, trend: "+3 new", color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "AI Interviews", value: interviews?.length || 0, icon: Bot, trend: "+24 today", color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Hired", value: candidates?.filter((c: any) => c.currentStage === "Selected").length || 0, icon: CheckCircle2, trend: "+2 this week", color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Welcome back, here's your recruitment overview powered by Firebase.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn("p-2 rounded-lg", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <TrendingUp className="h-3 w-3" /> {stat.trend}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-slate-500">{stat.title}</h3>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Application Trends</CardTitle>
            <CardDescription>Daily candidate application activity</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B5BDB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B5BDB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="applications" stroke="#3B5BDB" strokeWidth={2} fillOpacity={1} fill="url(#colorApp)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Interviews Scheduled</CardTitle>
            <CardDescription>Volume of AI vs Manual interviews</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="interviews" fill="#3B86DB" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent AI Match Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {loadingRecent ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : recentCandidates?.map((report: any) => (
                <div key={report.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                      {report.name ? report.name[0] : 'C'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{report.name}</p>
                      <p className="text-xs text-slate-500">Candidate • {report.currentStage}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-sm font-bold",
                      report.matchScore > 80 ? "text-emerald-600" : report.matchScore > 60 ? "text-amber-600" : "text-red-600"
                    )}>
                      {report.matchScore}% Match
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                      <Clock className="h-2 w-2" /> {report.appliedDate ? new Date(report.appliedDate).toLocaleDateString() : 'Pending'}
                    </div>
                  </div>
                </div>
              ))}
              {recentCandidates?.length === 0 && (
                <p className="text-center py-10 text-slate-400 italic text-sm">No recent matches to display.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Quick Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div onClick={() => window.location.href='/dashboard/jobs'} className="flex items-start gap-3 p-3 rounded-lg border border-dashed hover:border-primary cursor-pointer transition-colors group">
               <div className="p-2 rounded bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white">
                 <Briefcase className="h-4 w-4" />
               </div>
               <div>
                 <p className="text-sm font-medium">Create Job Opening</p>
                 <p className="text-xs text-slate-500">Post a new role to your board</p>
               </div>
             </div>
             <div onClick={() => window.location.href='/dashboard/screening'} className="flex items-start gap-3 p-3 rounded-lg border border-dashed hover:border-primary cursor-pointer transition-colors group">
               <div className="p-2 rounded bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white">
                 <Bot className="h-4 w-4" />
               </div>
               <div>
                 <p className="text-sm font-medium">Setup AI Screening</p>
                 <p className="text-xs text-slate-500">Configure AI resume matching</p>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
