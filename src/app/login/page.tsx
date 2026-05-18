"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, ArrowRight, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Liquid Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md space-y-10 relative z-10">
        <div className="flex flex-col items-center text-center space-y-6">
          <Link href="/" className="flex items-center space-x-4 group">
            <div className="bg-primary p-4 rounded-[2rem] text-white shadow-2xl shadow-primary/30 group-hover:scale-105 transition-transform duration-500">
              <Heart className="h-10 w-10 fill-current" />
            </div>
            <span className="font-black text-4xl tracking-tighter font-headline text-foreground">HireStack</span>
          </Link>
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass-morphism text-primary text-[9px] font-black uppercase tracking-[0.3em] border-none">
            <Sparkles className="h-4 w-4" /> Secure Recruitment Portal
          </div>
        </div>

        <Card className="glass-morphism rounded-[3.5rem] overflow-hidden border-none shadow-2xl">
          <div className="h-2.5 bg-gradient-to-r from-primary via-accent to-primary animate-liquid" />
          <CardHeader className="pt-12 px-10 text-center space-y-2">
            <CardTitle className="text-3xl font-black text-foreground font-headline">Welcome back</CardTitle>
            <CardDescription className="text-muted-foreground font-bold text-base">Access your HR dashboard and talent matches.</CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-14 pt-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black text-foreground uppercase tracking-[0.3em] font-headline ml-1">Work Email</Label>
                  <Input 
                    placeholder="name@company.com" 
                    type="email"
                    required
                    className="h-14 rounded-2xl text-base px-6 bg-white/40 dark:bg-black/20 border-white/40 dark:border-white/10 focus-visible:ring-primary shadow-inner font-medium"
                  />
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-[10px] font-black text-foreground uppercase tracking-[0.3em] font-headline">Password</Label>
                    <button type="button" className="text-[9px] font-black text-primary hover:underline uppercase tracking-[0.2em] font-headline">Reset</button>
                  </div>
                  <Input 
                    type="password"
                    required
                    className="h-14 rounded-2xl text-base px-6 bg-white/40 dark:bg-black/20 border-white/40 dark:border-white/10 focus-visible:ring-primary shadow-inner font-medium"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-15 text-lg font-black rounded-[1.75rem] shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98] font-headline" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Sign In <ArrowRight className="ml-2 h-6 w-6" /></>}
              </Button>
            </form>

            <div className="mt-10 pt-10 border-t border-white/10 flex flex-col items-center space-y-5">
              <p className="text-xs text-muted-foreground font-bold">New to HireStack?</p>
              <Button variant="outline" className="w-full h-13 rounded-2xl font-black glass-morphism border-none text-foreground uppercase tracking-[0.2em] text-[10px] font-headline hover:bg-white/20">
                Create Organization
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[9px] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-50">
          Powered by Secure GenAI Architecture
        </p>
      </div>
    </div>
  );
}