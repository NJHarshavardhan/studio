import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Users, BarChart3, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white">
        <Link className="flex items-center justify-center space-x-2" href="/">
          <div className="bg-primary p-1.5 rounded-lg text-white">
            <Bot className="h-6 w-6" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight">HireStack</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/candidate/portal">
            Candidate Portal
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/dashboard">
            HR Dashboard
          </Link>
          <Button size="sm" variant="outline">Sign In</Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-[#F8F9FC]">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2 max-w-3xl">
                <h1 className="text-4xl font-headline font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-slate-900">
                  The AI-First <span className="text-primary">Recruitment</span> Platform
                </h1>
                <p className="mx-auto max-w-[700px] text-slate-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Automate resume screening, conduct dynamic AI interviews, and manage your hiring pipeline in one unified multi-tenant platform.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button size="lg" className="px-8 shadow-lg shadow-primary/20" asChild>
                  <Link href="/dashboard">
                    Get Started as HR <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="px-8" asChild>
                  <Link href="/candidate/portal">
                    Apply for Jobs
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-20 bg-white border-y">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 rounded-full bg-primary/10">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Multi-Tenant Isolation</h3>
                <p className="text-slate-500">Secure data partitioning for enterprise-grade security across multiple companies.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 rounded-full bg-primary/10">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">AI Interview Agents</h3>
                <p className="text-slate-500">Dynamic, conversational screening that evaluates candidates 24/7 based on your JDs.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 rounded-full bg-primary/10">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Real-time Analytics</h3>
                <p className="text-slate-500">Track conversion rates and hiring funnel health with deep recruitment metrics.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-white">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© 2024 HireStack Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link className="text-sm text-slate-500 hover:underline underline-offset-4" href="#">Terms</Link>
            <Link className="text-sm text-slate-500 hover:underline underline-offset-4" href="#">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
