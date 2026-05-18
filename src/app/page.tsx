
"use client"

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, BarChart3, ShieldCheck, Sparkles, CheckCircle2, Heart, Loader2 } from "lucide-react";
import { useUser } from '@/firebase';

export default function Home() {
  const { user, loading } = useUser();

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-x-hidden liquid-gradient">
      <header className="px-6 lg:px-12 h-16 flex items-center justify-between sticky top-4 z-50 glass-morphism mx-4 rounded-[1.5rem] border-none transition-all duration-300 shadow-2xl">
        <Link className="flex items-center space-x-3" href="/">
          <div className="bg-primary p-2 rounded-xl text-white shadow-2xl shadow-primary/20">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <span className="font-black text-2xl tracking-tighter font-headline text-foreground">HireStack</span>
        </Link>
        <nav className="hidden md:flex gap-8 items-center">
          <Link className="text-[10px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-[0.2em] font-headline" href="/candidate/portal">
            Talent
          </Link>
          <Link className="text-[10px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-[0.2em] font-headline" href="/dashboard">
            Platform
          </Link>
          <div className="h-5 w-px bg-white/20" />
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : user ? (
            <Link href="/dashboard">
              <Button className="rounded-full px-8 font-black shadow-[0_10px_30px_rgba(255,51,102,0.3)] h-10 text-xs font-headline">Enter Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="font-black uppercase tracking-[0.2em] text-[10px] font-headline hover:bg-white/20 h-10">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="rounded-full px-8 font-black shadow-[0_10px_30px_rgba(255,51,102,0.3)] h-10 text-xs font-headline">Get Started</Button>
              </Link>
            </>
          )}
        </nav>
        <Button variant="ghost" size="icon" className="md:hidden glass-morphism border-none h-10 w-10 rounded-xl">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        </Button>
      </header>

      <main className="flex-1">
        <section className="w-full py-24 lg:py-48 relative">
          <div className="container px-8 mx-auto relative">
            <div className="flex flex-col items-center text-center space-y-12 max-w-5xl mx-auto">
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass-morphism text-primary text-[9px] font-black uppercase tracking-[0.4em] animate-in fade-in slide-in-from-bottom-4 duration-1000 border-none">
                <Sparkles className="h-3.5 w-3.5" /> The Future of Neural HR
              </div>
              <h1 className="text-5xl md:text-[7rem] font-black tracking-tight font-headline text-foreground leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 drop-shadow-sm">
                Hire without <br />
                <span className="text-primary italic opacity-90">friction.</span>
              </h1>
              <p className="max-w-3xl text-muted-foreground text-lg md:text-xl leading-relaxed font-bold animate-in fade-in slide-in-from-bottom-12 duration-1000">
                A transparent, dynamic recruitment engine that flows with your team's needs. AI matching meets liquid intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 pt-6 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-16 duration-1000">
                <Button size="lg" className="h-14 px-12 rounded-full text-lg font-black shadow-[0_20px_50px_rgba(255,51,102,0.4)] group bg-primary transition-all hover:scale-105 active:scale-95 font-headline" asChild>
                  <Link href={user ? "/dashboard" : "/signup"}>
                    {user ? "Enter Dashboard" : "Get Started Now"} <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-12 rounded-full text-lg font-black glass-morphism border-none shadow-xl transition-all hover:scale-105 active:scale-95 font-headline" asChild>
                  <Link href="/candidate/portal">
                    For Talent
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-32">
          <div className="container px-8 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
              {[
                { 
                  title: "Neural Matching", 
                  desc: "Analyze resumes with liquid precision. Match scores calculated across deep competency layers.", 
                  icon: ShieldCheck 
                },
                { 
                  title: "Dynamic Agents", 
                  desc: "Conversational glass UI interfaces for automated screenings that feel human and organic.", 
                  icon: Bot 
                },
                { 
                  title: "Liquid Flow", 
                  desc: "Experience a recruitment funnel that moves as fast as your growth. Real-time glass analytics.", 
                  icon: BarChart3 
                }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col space-y-6 group">
                  <div className="p-6 w-16 h-16 rounded-[2rem] glass-morphism text-primary flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-700 border-none">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-black font-headline text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-base font-bold">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-32 px-4 md:px-0">
          <div className="max-w-5xl mx-auto glass-morphism-card rounded-[3rem] md:rounded-[4rem] p-12 md:p-20 relative overflow-hidden group shadow-2xl">
             <div className="absolute inset-0 bg-primary/20 opacity-30 group-hover:opacity-40 transition-opacity duration-1000" />
             
             <div className="flex flex-col items-center text-center space-y-10 relative z-10">
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black font-headline max-w-4xl leading-[1] tracking-tight text-foreground drop-shadow-2xl">
                  Redefine your <br className="hidden md:block" />
                  <span className="text-primary italic">talent flow.</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl w-full">
                  <Link href={user ? "/dashboard" : "/signup"} className="w-full">
                    <Button className="w-full h-14 rounded-full text-lg font-black bg-white text-foreground hover:bg-slate-100 transition-all shadow-2xl hover:scale-105 active:scale-95 font-headline">
                      {user ? "Enter Dashboard" : "Launch HR"}
                    </Button>
                  </Link>
                  <Link href="/candidate/portal" className="w-full">
                    <Button variant="outline" className="w-full h-14 rounded-full text-lg font-black border-white/20 hover:bg-white/10 text-foreground transition-all backdrop-blur-md font-headline">
                      Join Portal
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-wrap justify-center gap-8 md:gap-12 pt-4">
                   {['Glass UI', 'Liquid Flows', 'Neural Match', 'Pure Speed'].map((text) => (
                     <div key={text} className="flex items-center gap-2">
                       <CheckCircle2 className="h-4 w-4 text-primary" />
                       <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-90 text-foreground font-headline">{text}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </section>
      </main>

      <footer className="py-16 px-8 border-t border-white/10 glass-morphism mx-4 mb-4 rounded-[2rem] border-none shadow-2xl">
        <div className="container px-8 mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center space-x-3">
            <div className="bg-primary p-2 rounded-xl text-white shadow-xl">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <span className="font-black text-xl tracking-tighter text-foreground font-headline">HireStack</span>
          </div>
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] font-headline">© 2025 Neural HR Systems • Engineered with Love.</p>
          <div className="flex gap-8">
            {['Terms', 'Privacy', 'Contact'].map(link => (
              <Link key={link} className="text-[9px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-[0.3em] font-headline" href="#">{link}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
