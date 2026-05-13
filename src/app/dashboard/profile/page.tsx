"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Shield, Briefcase } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Profile</h1>
        <p className="text-slate-500">Manage your personal account details and preferences.</p>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Public Information</CardTitle>
            <CardDescription>This information will be visible to your team members.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6 pb-6 border-b">
              <Avatar className="h-20 w-20 border-4 border-slate-50 shadow-sm">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">JD</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <Button size="sm" variant="outline">Change Avatar</Button>
                <p className="text-xs text-slate-400">JPG, GIF or PNG. Max size 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input defaultValue="Jane Doe" className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input defaultValue="jane.doe@hirestack.ai" className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Job Title</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input defaultValue="Senior HR Manager" className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Access Role</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input defaultValue="Admin" disabled className="pl-10 bg-slate-50" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button>Update Profile</Button>
        </div>
      </div>
    </div>
  );
}
