"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileUp, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { aiResumeMatcherAndAnalyzer, type AiResumeMatcherAndAnalyzerOutput } from "@/ai/flows/ai-resume-matcher-and-analyzer";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface ResumeAnalyzerProps {
  jobDescription: string;
}

export function ResumeAnalyzer({ jobDescription }: ResumeAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AiResumeMatcherAndAnalyzerOutput | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        try {
          const analysis = await aiResumeMatcherAndAnalyzer({
            resumeDataUri: base64String,
            jobDescription: jobDescription,
          });
          setResult(analysis);
          toast({
            title: "Analysis Complete",
            description: `Candidate matched with a score of ${analysis.matchScore}%`,
          });
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to analyze resume. Please try again.",
          });
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsAnalyzing(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-dashed border-2 bg-slate-50/50">
        <CardContent className="flex flex-col items-center justify-center p-12">
          {isAnalyzing ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <div>
                <h3 className="text-lg font-semibold">Analyzing Resume...</h3>
                <p className="text-sm text-slate-500">Our AI is parsing skills and matching experience.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                <FileUp className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Upload Candidate Resume</h3>
                <p className="text-sm text-slate-500 mb-6">PDF or DOCX supported. Max file size 10MB.</p>
                <input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileUpload}
                />
                <Button asChild>
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    Select Resume File
                  </label>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Match Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl font-bold text-slate-900">{result.matchScore}%</span>
                <div className={cn(
                  "flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full",
                  result.matchScore > 80 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                )}>
                  {result.matchScore > 80 ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {result.matchScore > 80 ? "Strong Fit" : "Potential Match"}
                </div>
              </div>
              <Progress value={result.matchScore} className="h-2" />
              
              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Key Strengths</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.extractedInfo.strengths.slice(0, 4).map(s => (
                      <Badge key={s} variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none">{s}</Badge>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-600 italic">
                  "{result.extractedInfo.candidateSummary}"
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Skill Gap Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.skillGapAnalysis.length > 0 ? (
                  result.skillGapAnalysis.map((gap, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                      <div className="h-2 w-2 mt-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{gap.skill}</p>
                        <p className="text-xs text-slate-500">{gap.reason}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">All required skills matched!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}