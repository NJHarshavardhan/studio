"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bot, ArrowRight, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      router.push('/dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F8] via-white to-[#FDF4FF] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center space-x-2 mb-4 group">
            <div className="bg-primary p-2.5 rounded-2xl text-white shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform">
              <Bot className="h-8 w-8" />
            </div>
            <span className="font-extrabold text-3xl tracking-tight font-headline text-slate-900">HireStack</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
            <Sparkles className="h-3 w-3" /> Secure AI Infrastructure
          </div>
        </div>

        <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-white/70 backdrop-blur-xl">
          <div className="h-2 bg-primary" />
          <CardHeader className="pt-10 px-8 text-center">
            <CardTitle className="text-2xl font-black text-slate-900">Welcome Back</CardTitle>
            <CardDescription className="text-slate-500 mt-2 font-medium">Access your recruitment intelligence dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10 pt-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Work Email</Label>
                  <Input 
                    placeholder="name@company.com" 
                    type="email"
                    required
                    className="h-12 rounded-xl text-base px-4 bg-white/50 border-slate-200 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold text-slate-700">Password</Label>
                    <button type="button" className="text-xs font-bold text-primary hover:underline">Forgot?</button>
                  </div>
                  <Input 
                    type="password"
                    required
                    className="h-12 rounded-xl text-base px-4 bg-white/50 border-slate-200 focus-visible:ring-primary"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl shadow-xl shadow-primary/20" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <>Sign In to Platform <ArrowRight className="ml-2 h-5 w-5" /></>}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center space-y-4">
              <p className="text-sm text-slate-400 font-medium">Don't have an account?</p>
              <Button variant="outline" className="w-full h-11 rounded-xl font-bold border-slate-200 text-slate-600">
                Register Company
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 font-medium">
          Protected by enterprise-grade AES-256 encryption.
        </p>
      </div>
    </div>
  );
}
