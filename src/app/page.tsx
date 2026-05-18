
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, BarChart3, ShieldCheck, Sparkles, CheckCircle2, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-x-hidden liquid-gradient">
      <header className="px-8 lg:px-16 h-24 flex items-center justify-between sticky top-4 z-50 glass-morphism mx-4 rounded-[2.5rem] border-none transition-all duration-300 shadow-2xl">
        <Link className="flex items-center space-x-3.5" href="/">
          <div className="bg-primary p-2.5 rounded-2xl text-white shadow-2xl shadow-primary/20">
            <Heart className="h-7 w-7 fill-current" />
          </div>
          <span className="font-black text-3xl tracking-tighter font-headline text-foreground">HireStack</span>
        </Link>
        <nav className="hidden md:flex gap-10 items-center">
          <Link className="text-sm font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-[0.2em] font-headline" href="/candidate/portal">
            Talent
          </Link>
          <Link className="text-sm font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-[0.2em] font-headline" href="/dashboard">
            Platform
          </Link>
          <div className="h-6 w-px bg-white/20" />
          <Link href="/login">
            <Button variant="ghost" className="font-black uppercase tracking-[0.2em] text-xs font-headline hover:bg-white/20">Sign In</Button>
          </Link>
          <Link href="/dashboard">
            <Button className="rounded-full px-10 font-black shadow-[0_10px_30px_rgba(255,51,102,0.3)] h-14 text-base font-headline">Get Started</Button>
          </Link>
        </nav>
        <Button variant="ghost" size="icon" className="md:hidden glass-morphism border-none">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        </Button>
      </header>

      <main className="flex-1">
        <section className="w-full py-32 lg:py-56 relative">
          <div className="container px-8 mx-auto relative">
            <div className="flex flex-col items-center text-center space-y-16 max-w-5xl mx-auto">
              <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full glass-morphism text-primary text-[10px] font-black uppercase tracking-[0.4em] animate-in fade-in slide-in-from-bottom-4 duration-1000 border-none">
                <Sparkles className="h-4 w-4" /> The Future of Liquid HR
              </div>
              <h1 className="text-6xl md:text-[8rem] font-black tracking-tight font-headline text-foreground leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 drop-shadow-sm">
                Hire without <br />
                <span className="text-primary italic opacity-90">friction.</span>
              </h1>
              <p className="max-w-3xl text-muted-foreground text-xl md:text-2xl leading-relaxed font-bold animate-in fade-in slide-in-from-bottom-12 duration-1000">
                A transparent, dynamic recruitment engine that flows with your team's needs. AI matching meets liquid intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-8 pt-10 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-16 duration-1000">
                <Button size="lg" className="h-16 px-14 rounded-full text-xl font-black shadow-[0_20px_50px_rgba(255,51,102,0.4)] group bg-primary transition-all hover:scale-105 active:scale-95 font-headline" asChild>
                  <Link href="/dashboard">
                    Enter Platform <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-16 px-14 rounded-full text-xl font-black glass-morphism border-none shadow-xl transition-all hover:scale-105 active:scale-95 font-headline" asChild>
                  <Link href="/candidate/portal">
                    For Talent
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-40">
          <div className="container px-8 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-20">
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
                <div key={i} className="flex flex-col space-y-8 group">
                  <div className="p-8 w-20 h-20 rounded-[2.5rem] glass-morphism text-primary flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-700 border-none">
                    <feature.icon className="h-10 w-10" />
                  </div>
                  <h3 className="text-3xl font-black font-headline text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg font-bold">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-40 px-4 md:px-0">
          <div className="max-w-6xl mx-auto glass-morphism-card rounded-[4rem] md:rounded-[5rem] p-16 md:p-24 relative overflow-hidden group shadow-2xl">
             <div className="absolute inset-0 bg-primary/20 opacity-30 group-hover:opacity-40 transition-opacity duration-1000" />
             
             <div className="flex flex-col items-center text-center space-y-12 relative z-10">
                <h2 className="text-4xl md:text-7xl lg:text-8xl font-black font-headline max-w-5xl leading-[1] tracking-tight text-foreground drop-shadow-2xl">
                  Redefine your <br className="hidden md:block" />
                  <span className="text-primary italic">talent flow.</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
                  <Link href="/dashboard" className="w-full">
                    <Button className="w-full h-16 rounded-full text-xl font-black bg-white text-foreground hover:bg-slate-100 transition-all shadow-2xl hover:scale-105 active:scale-95 font-headline">
                      Launch HR
                    </Button>
                  </Link>
                  <Link href="/candidate/portal" className="w-full">
                    <Button variant="outline" className="w-full h-16 rounded-full text-xl font-black border-white/20 hover:bg-white/10 text-foreground transition-all backdrop-blur-md font-headline">
                      Join Portal
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-wrap justify-center gap-10 md:gap-16 pt-6">
                   {['Glass UI', 'Liquid Flows', 'Neural Match', 'Pure Speed'].map((text) => (
                     <div key={text} className="flex items-center gap-3">
                       <CheckCircle2 className="h-5 w-5 text-primary" />
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-90 text-foreground font-headline">{text}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </section>
      </main>

      <footer className="py-20 px-8 border-t border-white/10 glass-morphism mx-4 mb-4 rounded-[3rem] border-none shadow-2xl">
        <div className="container px-8 mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center space-x-3.5">
            <div className="bg-primary p-2.5 rounded-2xl text-white shadow-xl">
              <Heart className="h-6 w-6 fill-current" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-foreground font-headline">HireStack</span>
          </div>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] font-headline">© 2025 Liquid HR Systems • Engineered with Love.</p>
          <div className="flex gap-10">
            {['Terms', 'Privacy', 'Contact'].map(link => (
              <Link key={link} className="text-[10px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-[0.3em] font-headline" href="#">{link}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
