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
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Candidates', href: '/dashboard/candidates', icon: Users },
  { name: 'Job Openings', href: '/dashboard/jobs', icon: Briefcase },
  { name: 'AI Screening', href: '/dashboard/screening', icon: FileSearch },
  { name: 'AI Interviews', href: '/dashboard/interviews', icon: Bot },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Analytics', href: '/dashboard/analytics', icon: PieChart },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface SidebarNavProps {
  onItemClick?: () => void;
}

export function SidebarNav({ onItemClick }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group relative overflow-hidden",
              isActive 
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className={cn(
              "h-4 w-4 transition-transform group-hover:scale-110",
              isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
            )} />
            {item.name}
            {isActive && (
              <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary-foreground/40" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}