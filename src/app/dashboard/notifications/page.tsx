"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, UserPlus, Bot, Calendar, MessageCircle } from "lucide-react";

const notifications = [
  {
    id: 1,
    title: "New Candidate Applied",
    desc: "John Smith applied for the Senior Developer role.",
    time: "2 hours ago",
    icon: UserPlus,
    color: "bg-blue-100 text-blue-600",
    unread: true
  },
  {
    id: 2,
    title: "AI Screening Complete",
    desc: "Sarah Wilson's resume matches 92% with the Product Designer JD.",
    time: "5 hours ago",
    icon: Bot,
    color: "bg-purple-100 text-purple-600",
    unread: true
  },
  {
    id: 3,
    title: "Interview Completed",
    desc: "Michael Brown finished his AI technical screening session.",
    time: "Yesterday",
    icon: MessageCircle,
    color: "bg-emerald-100 text-emerald-600",
    unread: false
  },
  {
    id: 4,
    title: "Job Opening Expiring",
    desc: "The Frontend Lead position is closing in 3 days.",
    time: "2 days ago",
    icon: Calendar,
    color: "bg-amber-100 text-amber-600",
    unread: false
  }
];

export default function NotificationsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Notifications</h1>
          <p className="text-slate-500">Stay updated with candidate activities and AI reports.</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary">
          2 New
        </Badge>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="border-b bg-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Alerts</CardTitle>
            <button className="text-xs font-medium text-primary hover:underline">Mark all as read</button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {notifications.map((n) => (
              <div key={n.id} className={`p-6 flex items-start gap-4 hover:bg-slate-50 transition-colors ${n.unread ? "bg-blue-50/30" : ""}`}>
                <div className={`p-2.5 rounded-xl ${n.color}`}>
                  <n.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <p className={`text-sm font-bold ${n.unread ? "text-slate-900" : "text-slate-600"}`}>{n.title}</p>
                    <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{n.desc}</p>
                </div>
                {n.unread && <div className="h-2 w-2 rounded-full bg-primary mt-2" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
