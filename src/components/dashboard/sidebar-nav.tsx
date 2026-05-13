"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileSearch, 
  MessageSquare, 
  Settings, 
  PieChart,
  Bot
} from "lucide-react";

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Candidates', href: '/dashboard/candidates', icon: Users },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
  { name: 'AI Screening', href: '/dashboard/screening', icon: FileSearch },
  { name: 'AI Interviews', href: '/dashboard/interviews', icon: Bot },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Analytics', href: '/dashboard/analytics', icon: PieChart },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-2 py-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all group",
              isActive 
                ? "bg-primary text-white shadow-sm" 
                : "text-slate-600 hover:bg-slate-100 hover:text-primary"
            )}
          >
            <item.icon className={cn(
              "h-4 w-4",
              isActive ? "text-white" : "text-slate-400 group-hover:text-primary"
            )} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}