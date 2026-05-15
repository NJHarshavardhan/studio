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
    <div className="min-h-screen seasonal-gradient flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-10 right-10 text-primary/5">
        <Heart className="h-40 w-40 fill-current" />
      </div>
      
      <div className="w-full max-w-md space-y-10 relative">
        <div className="flex flex-col items-center text-center space-y-4">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="bg-primary p-3 rounded-2xl text-white shadow-2xl shadow-primary/20 group-hover:scale-110 transition-transform">
              <Heart className="h-8 w-8 fill-current" />
            </div>
            <span className="font-black text-4xl tracking-tighter font-headline text-foreground">HireStack</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20">
            <Sparkles className="h-3 w-3" /> Secure Recruitment Portal
          </div>
        </div>

        <Card className="glass-morphism rounded-[2.5rem] overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
          <CardHeader className="pt-12 px-10 text-center">
            <CardTitle className="text-3xl font-black text-foreground">Welcome back</CardTitle>
            <CardDescription className="text-muted-foreground mt-2 font-bold">Access your HR dashboard and talent matches.</CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-12 pt-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm font-black text-foreground uppercase tracking-widest">Work Email</Label>
                  <Input 
                    placeholder="name@company.com" 
                    type="email"
                    required
                    className="h-14 rounded-2xl text-base px-6 bg-background/50 border-border focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-black text-foreground uppercase tracking-widest">Password</Label>
                    <button type="button" className="text-xs font-black text-primary hover:underline uppercase tracking-widest">Reset</button>
                  </div>
                  <Input 
                    type="password"
                    required
                    className="h-14 rounded-2xl text-base px-6 bg-background/50 border-border focus-visible:ring-primary"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-14 text-lg font-black rounded-2xl shadow-2xl shadow-primary/20 bg-primary" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Sign In <ArrowRight className="ml-2 h-6 w-6" /></>}
              </Button>
            </form>

            <div className="mt-10 pt-10 border-t border-border flex flex-col items-center space-y-4">
              <p className="text-sm text-muted-foreground font-bold">New to HireStack?</p>
              <Button variant="outline" className="w-full h-12 rounded-2xl font-black border-border text-foreground uppercase tracking-widest text-xs">
                Create Organization
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">
          Powered by Secure GenAI Architecture
        </p>
      </div>
    </div>
  );
}
