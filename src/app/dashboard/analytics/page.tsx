"use client"

import { useMemo, useState, useEffect } from "react";
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
  Cell
} from 'recharts';
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Loader2, PieChart as PieChartIcon, TrendingUp, Users, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AnalyticsPage() {
  const [skeletonWidths, setSkeletonWidths] = useState<number[]>([]);
  const firestore = useFirestore();
  
  useEffect(() => {
    // Generate random widths once on mount to avoid hydration mismatch
    setSkeletonWidths(Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 20));
  }, []);

  const candidatesRef = useMemoFirebase(() => firestore ? collection(firestore, "candidates") : null, [firestore]);
  const interviewsRef = useMemoFirebase(() => firestore ? collection(firestore, "interviews") : null, [firestore]);

  const { data: candidates, loading: loadingCandidates } = useCollection(candidatesRef);
  const { data: interviews, loading: loadingInterviews } = useCollection(interviewsRef);

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

  const isInitializing = !firestore;
  const isLoading = isInitializing || loadingCandidates || loadingInterviews;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">Recruitment Analytics</h1>
        <p className="text-muted-foreground">In-depth performance metrics for your hiring pipeline.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-none shadow-sm bg-card">
            <CardHeader className="pb-2">
              <Skeleton className="h-3 w-24 mb-2" />
              {isLoading ? <Skeleton className="h-10 w-20" /> : (
                <CardTitle className="text-3xl font-black text-foreground">
                  {i === 1 ? (candidates?.length ? Math.round(candidates.reduce((acc, curr: any) => acc + (curr.matchScore || 0), 0) / candidates.length) : 0) + "%" :
                   i === 2 ? (candidates?.length ? Math.round((candidates.filter((c: any) => c.currentStage === "Selected").length / candidates.length) * 100) : 0) + "%" :
                   candidates?.length || 0}
                </CardTitle>
              )}
            </CardHeader>
            <CardContent>
               <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-black flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5 text-primary" /> Candidate Funnel
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium">Distribution of candidates across pipeline stages</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {isLoading ? (
              <div className="space-y-4 h-full flex flex-col justify-center">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton 
                      className="h-4 flex-1" 
                      style={{ width: skeletonWidths[i] ? `${skeletonWidths[i]}%` : '50%' }} 
                    />
                  </div>
                ))}
              </div>
            ) : candidates?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: 'hsl(var(--card))' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground italic text-sm border-2 border-dashed border-border rounded-3xl">
                No pipeline data available yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-black flex items-center gap-2 text-foreground">
              <PieChartIcon className="h-5 w-5 text-primary" /> AI Interview Scores
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium">Performance breakdown of AI screening sessions</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center">
            {isLoading ? (
              <div className="relative h-48 w-48 flex items-center justify-center">
                 <Skeleton className="h-full w-full rounded-full" />
                 <div className="absolute h-32 w-32 rounded-full bg-card" />
              </div>
            ) : interviews?.length ? (
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
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: 'hsl(var(--card))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full w-full text-muted-foreground italic text-sm border-2 border-dashed border-border rounded-3xl">
                No interview data available yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
