"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Mail, MessageSquare, Shield, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your company configuration has been updated successfully.",
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500">Configure your multi-tenant environment and AI integrations.</p>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
               <Bot className="h-5 w-5 text-primary" />
               <CardTitle>AI Provider Configuration</CardTitle>
            </div>
            <CardDescription>Plug in your own API keys for preferred AI models.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Provider</Label>
                <Select defaultValue="gemini">
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                    <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                    <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                    <SelectItem value="ollama">Ollama (Local)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Model Version</Label>
                <Select defaultValue="flash">
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flash">Gemini 2.0 Flash</SelectItem>
                    <SelectItem value="pro">Gemini 1.5 Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input type="password" placeholder="sk-..." defaultValue="••••••••••••••••••••••••" />
              <p className="text-[10px] text-slate-400">Keys are encrypted at rest using AES-256.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
               <Mail className="h-5 w-5 text-indigo-500" />
               <CardTitle>Email & Communications</CardTitle>
            </div>
            <CardDescription>Automated workflow messaging settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-invite candidates</Label>
                <p className="text-xs text-slate-500">Automatically send AI interview links to matches > 80%</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label>Sender Name</Label>
              <Input placeholder="HirePulse Recruitment Team" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>WhatsApp Updates</Label>
                 <div className="flex items-center gap-2 text-xs text-slate-500 bg-emerald-50 p-2 rounded border border-emerald-100">
                    <MessageSquare className="h-4 w-4 text-emerald-600" /> WhatsApp Cloud API: Connected
                 </div>
               </div>
               <div className="space-y-2">
                  <Label>Workflow Rules</Label>
                  <Select defaultValue="strict">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strict">Strict (Manual Review)</SelectItem>
                      <SelectItem value="auto">Automatic Screening</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}