
"use client"

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useFirestore, useCollection } from "@/firebase";
import { collection } from "firebase/firestore";
import { Loader2, PieChart as PieChartIcon, TrendingUp, Users, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AnalyticsPage() {
  const firestore = useFirestore();
  
  const { data: candidates, loading: loadingCandidates } = useCollection(collection(firestore, "candidates"));
  const { data: interviews, loading: loadingInterviews } = useCollection(collection(firestore, "interviews"));

  const pipelineData = useMemo(() => {
    if (!candidates) return [];
    const stages = ["Applied", "AI Screening", "Shortlisted", "AI Interview", "HR Review", "Selected", "Rejected"];
    return stages.map(stage => ({
      name: stage,
      count: candidates.filter((c: any) => c.currentStage === stage).length
    }));
  }, [candidates]);

  const scoreDistribution = useMemo(() => {
    if (!interviews) return [];
    const brackets = [
      { name: '0-20', count: 0 },
      { name: '21-40', count: 0 },
      { name: '41-60', count: 0 },
      { name: '61-80', count: 0 },
      { name: '81-100', count: 0 },
    ];

    interviews.forEach((i: any) => {
      const score = i.score || 0;
      if (score <= 20) brackets[0].count++;
      else if (score <= 40) brackets[1].count++;
      else if (score <= 60) brackets[2].count++;
      else if (score <= 80) brackets[3].count++;
      else brackets[4].count++;
    });

    return brackets;
  }, [interviews]);

  const isLoading = loadingCandidates || loadingInterviews;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Recruitment Analytics</h1>
        <p className="text-slate-500">In-depth performance metrics for your hiring pipeline.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">Avg. Match Score</CardDescription>
            <CardTitle className="text-3xl font-bold text-blue-600">
              {candidates?.length 
                ? Math.round(candidates.reduce((acc, curr: any) => acc + (curr.matchScore || 0), 0) / candidates.length) 
                : 0}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
              <TrendingUp className="h-3 w-3" /> +5.2% from last month
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">Interview Conversion</CardDescription>
            <CardTitle className="text-3xl font-bold text-indigo-600">
              {candidates?.length 
                ? Math.round((candidates.filter((c: any) => c.currentStage === "Selected").length / candidates.length) * 100) 
                : 0}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Target className="h-3 w-3" /> Target: 15%
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">Total Throughput</CardDescription>
            <CardTitle className="text-3xl font-bold text-purple-600">{candidates?.length || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Users className="h-3 w-3" /> Applications processed
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Candidate Funnel
            </CardTitle>
            <CardDescription>Distribution of candidates across pipeline stages</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={100} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-indigo-500" /> AI Interview Score Distribution
            </CardTitle>
            <CardDescription>Performance breakdown of AI screening sessions</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center">
            {interviews?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoreDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {scoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 italic text-sm">No interview data available yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
