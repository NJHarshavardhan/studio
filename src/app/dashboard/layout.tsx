"use client"

import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Heart, Bell, User, Menu, Sparkles } from "lucide-react";
import Link from "next/link";
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
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 z-50 glass-morphism border-r-0 m-4 rounded-[2.5rem] overflow-hidden">
        <div className="h-24 flex items-center px-8 shrink-0">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="bg-primary p-2.5 rounded-2xl shadow-2xl shadow-primary/20">
              <Heart className="h-6 w-6 text-primary-foreground fill-current" />
            </div>
            <span className="font-black text-2xl tracking-tighter font-headline text-foreground">HireStack</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-6">
          <SidebarNav />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/5 hover:bg-white/40 dark:hover:bg-black/40 transition-all cursor-pointer group backdrop-blur-md">
            <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-sm shadow-xl shadow-primary/20 group-hover:scale-105 transition-transform">
              JD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black truncate leading-none mb-1 text-foreground">Jane Doe</span>
              <span className="text-[10px] text-primary truncate uppercase font-black tracking-[0.2em]">HR Director</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-80">
        <header className="h-24 glass-morphism sticky top-4 z-40 mx-4 rounded-[2rem] flex items-center justify-between px-8 border-none transition-all duration-300">
          <div className="flex items-center gap-6">
            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-2xl h-12 w-12 glass-morphism border-none">
                  <Menu className="h-6 w-6 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80 glass-morphism border-none rounded-r-[3rem] overflow-hidden">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>Access recruitment pipeline and automated tools.</SheetDescription>
                </SheetHeader>
                <div className="h-24 flex items-center px-10 border-b border-white/10">
                  <Link href="/dashboard" className="flex items-center space-x-3" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="bg-primary p-2.5 rounded-2xl shadow-xl shadow-primary/20">
                      <Heart className="h-6 w-6 text-primary-foreground fill-current" />
                    </div>
                    <span className="font-black text-2xl tracking-tighter font-headline text-foreground">HireStack</span>
                  </Link>
                </div>
                <div className="py-12">
                  <SidebarNav onItemClick={() => setIsMobileMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Liquid OS v5.0</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <ThemeToggle />
            <Link href="/dashboard/notifications">
              <Button variant="ghost" size="icon" className="relative rounded-2xl w-12 h-12 glass-morphism border-none">
                <Bell className="h-6 w-6 text-muted-foreground" />
                <span className="absolute top-3.5 right-3.5 h-2.5 w-2.5 bg-primary rounded-full border-2 border-background shadow-[0_0_10px_rgba(255,51,102,0.5)]"></span>
              </Button>
            </Link>
            <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />
            <Link href="/dashboard/profile">
              <div className="h-12 w-12 rounded-2xl glass-morphism flex items-center justify-center border-none hover:bg-white/60 dark:hover:bg-black/60 cursor-pointer transition-all overflow-hidden group">
                <User className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-[1800px] mx-auto w-full">
          <div className="glass-morphism-card rounded-[3rem] p-8 min-h-[calc(100vh-12rem)] border-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}