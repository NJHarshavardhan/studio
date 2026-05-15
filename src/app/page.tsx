import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Users, BarChart3, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <Link className="flex items-center space-x-2.5" href="/">
          <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20">
            <Bot className="h-6 w-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight font-headline text-slate-900">HireStack</span>
        </Link>
        <nav className="hidden md:flex gap-8 items-center">
          <Link className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors" href="/candidate/portal">
            Candidate Portal
          </Link>
          <Link className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors" href="/dashboard">
            HR Platform
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <Link href="/login">
            <Button variant="ghost" className="font-bold text-slate-900">Sign In</Button>
          </Link>
          <Link href="/dashboard">
            <Button className="rounded-xl px-6 font-bold shadow-lg shadow-primary/20">Get Started</Button>
          </Link>
        </nav>
        <Button variant="ghost" size="icon" className="md:hidden">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        </Button>
      </header>

      <main className="flex-1">
        <section className="w-full py-20 lg:py-32 bg-gradient-to-b from-[#FFF5F8] to-white overflow-hidden">
          <div className="container px-6 mx-auto relative">
            <div className="flex flex-col items-center text-center space-y-10 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 duration-700">
                <Sparkles className="h-3.5 w-3.5" /> Empowering the future of HR
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight font-headline text-slate-900 leading-[1.1]">
                Hire smarter with <br />
                <span className="text-primary italic">AI-driven</span> automation.
              </h1>
              <p className="max-w-[700px] text-slate-500 text-lg md:text-xl leading-relaxed">
                Experience the world's most advanced recruitment engine. Automate screening, conduct dynamic interviews, and manage your pipeline with surgical precision.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 pt-4">
                <Button size="lg" className="h-14 px-10 rounded-2xl text-lg font-bold shadow-2xl shadow-primary/30 group" asChild>
                  <Link href="/dashboard">
                    Start Hiring Now <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl text-lg font-bold border-2" asChild>
                  <Link href="/candidate/portal">
                    View Opportunities
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="mt-20 relative max-w-6xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-3xl opacity-30" />
              <div className="relative bg-white rounded-[40px] border shadow-2xl overflow-hidden aspect-[16/9] flex items-center justify-center p-4">
                 <div className="w-full h-full bg-slate-50 rounded-[32px] border-dashed border-2 flex flex-col items-center justify-center space-y-4">
                    <Bot className="h-16 w-16 text-primary/20" />
                    <p className="text-slate-400 font-medium">Dashboard Preview Placeholder</p>
                 </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-24 bg-white">
          <div className="container px-6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
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
                <div key={i} className="flex flex-col space-y-6">
                  <div className="p-4 w-16 h-16 rounded-3xl bg-[#FFF5F8] flex items-center justify-center text-primary shadow-inner">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold font-headline text-slate-900">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-24 bg-slate-900 text-white rounded-[60px] mx-6 mb-12">
           <div className="container px-6 mx-auto flex flex-col items-center text-center space-y-12">
              <h2 className="text-4xl md:text-5xl font-bold font-headline max-w-2xl leading-tight">
                Ready to transform your recruitment pipeline?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-md w-full">
                <Link href="/dashboard" className="w-full">
                  <Button className="w-full h-14 rounded-2xl text-lg font-bold bg-white text-slate-900 hover:bg-slate-100">
                    Deploy Platform
                  </Button>
                </Link>
                <Link href="/candidate/portal" className="w-full">
                  <Button variant="outline" className="w-full h-14 rounded-2xl text-lg font-bold border-white/20 hover:bg-white/10 text-white">
                    Apply as Talent
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-8 pt-6 opacity-60">
                 {['Fast Screening', 'AI Interviewing', 'Skill Mapping', 'Safe & Secure'].map((text) => (
                   <div key={text} className="flex items-center gap-2">
                     <CheckCircle2 className="h-4 w-4 text-primary" />
                     <span className="text-sm font-bold uppercase tracking-wider">{text}</span>
                   </div>
                 ))}
              </div>
           </div>
        </section>
      </main>

      <footer className="py-12 px-6 bg-white border-t">
        <div className="container px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-2.5">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <Bot className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">HireStack</span>
          </div>
          <p className="text-sm font-medium text-slate-400">© 2024 HireStack Inc. Precision Engineering for People.</p>
          <div className="flex gap-8">
            <Link className="text-sm font-bold text-slate-500 hover:text-primary transition-colors" href="#">Terms</Link>
            <Link className="text-sm font-bold text-slate-500 hover:text-primary transition-colors" href="#">Privacy</Link>
            <Link className="text-sm font-bold text-slate-500 hover:text-primary transition-colors" href="#">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
