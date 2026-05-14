"use client"

import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Bot, Bell, Search, User, Menu, X } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-50 border-r bg-card">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">HireStack</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav />
        </div>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              JD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate">Jane Doe</span>
              <span className="text-[10px] text-muted-foreground truncate uppercase font-bold tracking-wider">HR Manager</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64">
        <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <div className="h-16 flex items-center px-6 border-b">
                  <Link href="/dashboard" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="bg-primary p-1.5 rounded-lg">
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg">HireStack</span>
                  </Link>
                </div>
                <div className="py-4">
                  <SidebarNav onItemClick={() => setIsMobileMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            <div className="hidden md:flex items-center gap-4 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search candidates..." className="pl-10 h-9 bg-muted/50 border-none focus-visible:ring-1" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <Link href="/dashboard/notifications">
              <Button variant="ghost" size="icon" className="relative rounded-full w-9 h-9">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-red-500 rounded-full"></span>
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}