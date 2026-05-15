import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Users, BarChart3, ShieldCheck, Sparkles, CheckCircle2, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between sticky top-0 z-50 bg-white/80 dark:bg-background/80 backdrop-blur-md border-b">
        <Link className="flex items-center space-x-2.5" href="/">
          <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20">
            <Heart className="h-6 w-6 fill-current" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight font-headline text-foreground">HireStack</span>
        </Link>
        <nav className="hidden md:flex gap-8 items-center">
          <Link className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors" href="/candidate/portal">
            Candidate Portal
          </Link>
          <Link className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors" href="/dashboard">
            HR Platform
          </Link>
          <div className="h-4 w-px bg-border" />
          <Link href="/login">
            <Button variant="ghost" className="font-bold">Sign In</Button>
          </Link>
          <Link href="/dashboard">
            <Button className="rounded-2xl px-6 font-bold shadow-xl shadow-primary/20 h-11">Get Started</Button>
          </Link>
        </nav>
        <Button variant="ghost" size="icon" className="md:hidden">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        </Button>
      </header>

      <main className="flex-1">
        <section className="w-full py-24 lg:py-36 seasonal-gradient overflow-hidden relative">
          <div className="absolute top-20 left-10 text-primary/10 animate-bounce">
            <Heart className="h-12 w-12 fill-current" />
          </div>
          <div className="absolute bottom-20 right-10 text-primary/10 animate-pulse">
            <Heart className="h-16 w-16 fill-current" />
          </div>
          
          <div className="container px-6 mx-auto relative">
            <div className="flex flex-col items-center text-center space-y-12 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 duration-700 border border-primary/20">
                <Sparkles className="h-4 w-4" /> Season of Talent Love
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter font-headline text-foreground leading-[0.95]">
                Fall in love with <br />
                <span className="text-primary italic">automation.</span>
              </h1>
              <p className="max-w-[700px] text-muted-foreground text-xl md:text-2xl leading-relaxed font-medium">
                Experience the world's most advanced recruitment engine. Automate screening, conduct dynamic interviews, and manage your pipeline with surgical precision.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 pt-6 w-full sm:w-auto">
                <Button size="lg" className="h-16 px-12 rounded-[2rem] text-xl font-bold shadow-2xl shadow-primary/30 group bg-primary" asChild>
                  <Link href="/dashboard">
                    Start Hiring Now <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-16 px-12 rounded-[2rem] text-xl font-bold border-2" asChild>
                  <Link href="/candidate/portal">
                    View Opportunities
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-32 bg-white dark:bg-background">
          <div className="container px-6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
              {[
                { 
                  title: "Instant Matching", 
                  desc: "Our AI analyzes resumes in seconds, calculating a perfect match score against your specific JD.", 
                  icon: ShieldCheck 
                },
                { 
                  title: "Dynamic Agents", 
                  desc: "Intelligent conversational interviewers that evaluate technical fit 24/7 without fatigue.", 
                  icon: Bot 
                },
                { 
                  title: "Deep Analytics", 
                  desc: "Visual funnel data that helps you understand bottlenecks and optimize conversion rates.", 
                  icon: BarChart3 
                }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col space-y-8 group">
                  <div className="p-6 w-20 h-20 rounded-[2rem] bg-accent text-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <feature.icon className="h-10 w-10" />
                  </div>
                  <h3 className="text-3xl font-black font-headline text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg font-medium">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-32 bg-foreground text-background rounded-[4rem] mx-6 mb-12 shadow-2xl relative overflow-hidden">
           <div className="absolute inset-0 bg-primary/5 opacity-50" />
           <div className="container px-6 mx-auto flex flex-col items-center text-center space-y-16 relative">
              <h2 className="text-5xl md:text-7xl font-black font-headline max-w-3xl leading-[1.05]">
                Ready to transform your recruitment pipeline?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-xl w-full">
                <Link href="/dashboard" className="w-full">
                  <Button className="w-full h-16 rounded-[2rem] text-xl font-bold bg-background text-foreground hover:bg-white transition-all shadow-xl">
                    Deploy Platform
                  </Button>
                </Link>
                <Link href="/candidate/portal" className="w-full">
                  <Button variant="outline" className="w-full h-16 rounded-[2rem] text-xl font-bold border-white/20 hover:bg-white/10 text-white transition-all">
                    Apply as Talent
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-12 pt-6 opacity-80">
                 {['Fast Screening', 'AI Interviewing', 'Skill Mapping', 'Safe & Secure'].map((text) => (
                   <div key={text} className="flex items-center gap-3">
                     <CheckCircle2 className="h-5 w-5 text-primary" />
                     <span className="text-sm font-black uppercase tracking-[0.2em]">{text}</span>
                   </div>
                 ))}
              </div>
           </div>
        </section>
      </main>

      <footer className="py-20 px-6 bg-background border-t">
        <div className="container px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center space-x-2.5">
            <div className="bg-primary p-2 rounded-xl text-white">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <span className="font-black text-2xl tracking-tight text-foreground">HireStack</span>
          </div>
          <p className="text-sm font-bold text-muted-foreground">© 2024 HireStack Inc. Engineered with Love.</p>
          <div className="flex gap-10">
            <Link className="text-sm font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest" href="#">Terms</Link>
            <Link className="text-sm font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest" href="#">Privacy</Link>
            <Link className="text-sm font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest" href="#">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
