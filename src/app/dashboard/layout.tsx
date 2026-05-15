"use client"

import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Bot, Bell, Search, User, Menu, X, Sparkles } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FDF4FF] dark:bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-50 border-r bg-white/80 dark:bg-card/80 backdrop-blur-xl">
        <div className="h-20 flex items-center px-6 border-b shrink-0">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-extrabold text-xl tracking-tight font-headline">HireStack</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-8">
          <SidebarNav />
        </div>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors cursor-pointer group">
            <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              JD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold truncate leading-none mb-1">Jane Doe</span>
              <span className="text-[10px] text-primary truncate uppercase font-black tracking-wider">HR Manager</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64">
        <header className="h-20 border-b bg-white/70 dark:bg-background/70 backdrop-blur-xl flex items-center justify-between px-6 md:px-8 lg:px-10 sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-6 flex-1">
            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-xl h-11 w-11 bg-slate-50 border border-slate-100">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 border-r-0 rounded-r-[40px] overflow-hidden">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>Access dashboard sections and candidate management.</SheetDescription>
                </SheetHeader>
                <div className="h-20 flex items-center px-8 border-b">
                  <Link href="/dashboard" className="flex items-center space-x-3" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
                      <Bot className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className="font-extrabold text-2xl tracking-tight font-headline">HireStack</span>
                  </Link>
                </div>
                <div className="py-10">
                  <SidebarNav onItemClick={() => setIsMobileMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            <div className="hidden md:flex items-center gap-4 flex-1 max-w-lg">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  placeholder="Search talent, jobs, reports..." 
                  className="pl-12 h-12 bg-slate-50 dark:bg-muted/40 border-slate-100 dark:border-none focus-visible:ring-primary rounded-2xl w-full text-base font-medium" 
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-5">
            <div className="hidden sm:flex items-center gap-2 mr-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">AI Core Online</span>
            </div>
            <ThemeToggle />
            <Link href="/dashboard/notifications">
              <Button variant="ghost" size="icon" className="relative rounded-2xl w-11 h-11 bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-none">
                <Bell className="h-5 w-5 text-slate-500" />
                <span className="absolute top-3 right-3 h-2.5 w-2.5 bg-primary rounded-full border-2 border-white dark:border-background"></span>
              </Button>
            </Link>
            <div className="h-10 w-px bg-slate-100 dark:bg-border mx-1 hidden sm:block" />
            <Link href="/dashboard/profile">
              <div className="h-11 w-11 rounded-2xl bg-slate-100 dark:bg-muted flex items-center justify-center border-2 border-transparent hover:border-primary/30 cursor-pointer transition-all overflow-hidden shadow-sm">
                <User className="h-5 w-5 text-slate-500" />
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 lg:p-12 max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
