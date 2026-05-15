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
    <div className="flex min-h-screen bg-background dark:bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 z-50 border-r bg-card/50 backdrop-blur-3xl">
        <div className="h-24 flex items-center px-8 border-b shrink-0">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="bg-primary p-2.5 rounded-2xl shadow-2xl shadow-primary/20">
              <Heart className="h-6 w-6 text-primary-foreground fill-current" />
            </div>
            <span className="font-black text-2xl tracking-tighter font-headline text-foreground">HireStack</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-10">
          <SidebarNav />
        </div>
        <div className="p-6 border-t">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all cursor-pointer group">
            <div className="h-12 w-12 rounded-xl bg-primary text-white flex items-center justify-center font-black text-sm shadow-xl shadow-primary/20 group-hover:scale-105 transition-transform">
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
      <div className="flex-1 flex flex-col lg:pl-72">
        <header className="h-24 border-b bg-background/70 backdrop-blur-3xl flex items-center justify-between px-6 md:px-10 lg:px-12 sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-6">
            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-2xl h-12 w-12 bg-card border border-border shadow-sm">
                  <Menu className="h-6 w-6 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80 border-r-0 rounded-r-[3rem] overflow-hidden glass-morphism">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>Access recruitment pipeline and automated tools.</SheetDescription>
                </SheetHeader>
                <div className="h-24 flex items-center px-10 border-b">
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

            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary border border-primary/20">
              <Sparkles className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">AI Core v4.0</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <ThemeToggle />
            <Link href="/dashboard/notifications">
              <Button variant="ghost" size="icon" className="relative rounded-2xl w-12 h-12 bg-card border border-border shadow-sm">
                <Bell className="h-6 w-6 text-muted-foreground" />
                <span className="absolute top-3.5 right-3.5 h-2.5 w-2.5 bg-primary rounded-full border-2 border-background"></span>
              </Button>
            </Link>
            <div className="h-10 w-px bg-border mx-2 hidden sm:block" />
            <Link href="/dashboard/profile">
              <div className="h-12 w-12 rounded-2xl bg-card flex items-center justify-center border-2 border-transparent hover:border-primary/40 cursor-pointer transition-all overflow-hidden shadow-sm group">
                <User className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 lg:p-14 max-w-[1800px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
