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
    <div className="flex h-screen bg-background relative overflow-hidden liquid-gradient">
      {/* Desktop Sidebar - Premium Floating Glass */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-4 left-4 z-50 glass-morphism rounded-[2.5rem] overflow-hidden border-none shadow-2xl bg-gradient-to-b from-white/20 to-white/5 dark:from-black/40 dark:to-black/20">
        <div className="h-20 flex items-center px-8 shrink-0">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="bg-primary p-2 rounded-xl shadow-2xl shadow-primary/20">
              <Heart className="h-5 w-5 text-primary-foreground fill-current" />
            </div>
            <span className="font-black text-xl tracking-tighter font-headline text-foreground">HireStack</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <SidebarNav />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 p-3.5 rounded-3xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/5 hover:bg-white/20 dark:hover:bg-black/40 transition-all cursor-pointer group backdrop-blur-md">
            <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xs shadow-xl shadow-primary/20 group-hover:scale-105 transition-transform">
              JD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black truncate leading-none mb-1 text-foreground">Jane Doe</span>
              <span className="text-[9px] text-primary truncate uppercase font-black tracking-[0.2em]">HR Director</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-80 h-full overflow-y-auto scrollbar-hide">
        <header className="h-16 glass-morphism sticky top-4 z-40 mx-4 rounded-[1.75rem] flex items-center justify-between px-6 border-none transition-all duration-300 shadow-xl shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-xl h-10 w-10 glass-morphism border-none">
                  <Menu className="h-5 w-5 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80 glass-morphism border-none rounded-r-[3rem] overflow-hidden bg-gradient-to-b from-white/40 to-white/10 dark:from-black/60 dark:to-black/30">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>Access recruitment pipeline and automated tools.</SheetDescription>
                </SheetHeader>
                <div className="h-20 flex items-center px-10 border-b border-white/10">
                  <Link href="/dashboard" className="flex items-center space-x-3" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="bg-primary p-2 rounded-xl shadow-xl shadow-primary/20">
                      <Heart className="h-5 w-5 text-primary-foreground fill-current" />
                    </div>
                    <span className="font-black text-xl tracking-tighter font-headline text-foreground">HireStack</span>
                  </Link>
                </div>
                <div className="py-10">
                  <SidebarNav onItemClick={() => setIsMobileMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 text-primary border border-primary/10 backdrop-blur-md">
              <Sparkles className="h-3 w-3" />
              <span className="text-[8px] font-black uppercase tracking-[0.2em]">Liquid AI Core</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <Link href="/dashboard/notifications">
              <Button variant="ghost" size="icon" className="relative rounded-xl w-10 h-10 glass-morphism border-none">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-3 right-3 h-1.5 w-1.5 bg-primary rounded-full border border-background shadow-[0_0_8px_rgba(255,51,102,0.4)]"></span>
              </Button>
            </Link>
            <div className="h-5 w-px bg-white/20 mx-1 hidden sm:block" />
            <Link href="/dashboard/profile">
              <div className="h-10 w-10 rounded-xl glass-morphism flex items-center justify-center border-none hover:bg-white/30 dark:hover:bg-black/60 cursor-pointer transition-all overflow-hidden group">
                <User className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-[1800px] mx-auto w-full">
          <div className="glass-morphism-card rounded-[2.5rem] p-6 md:p-10 min-h-full border-none shadow-2xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
