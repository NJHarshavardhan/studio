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
        <h1 className="text-3xl font-black tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure your multi-tenant environment and AI integrations.</p>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-sm bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
               <Bot className="h-5 w-5 text-primary" />
               <CardTitle className="text-foreground font-black">AI Provider Configuration</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground font-medium">Plug in your own API keys for preferred AI models.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground font-bold">Primary Provider</Label>
                <Select defaultValue="gemini">
                  <SelectTrigger className="bg-muted/20 border-border">
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
                <Label className="text-foreground font-bold">Model Version</Label>
                <Select defaultValue="flash">
                  <SelectTrigger className="bg-muted/20 border-border">
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
              <Label className="text-foreground font-bold">API Key</Label>
              <Input type="password" placeholder="sk-..." defaultValue="••••••••••••••••••••••••" className="bg-muted/20 border-border" />
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Keys are encrypted at rest using AES-256.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
               <Mail className="h-5 w-5 text-indigo-500" />
               <CardTitle className="text-foreground font-black">Email & Communications</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground font-medium">Automated workflow messaging settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-foreground font-bold">Auto-invite candidates</Label>
                <p className="text-xs text-muted-foreground font-medium">Automatically send AI interview links to matches {'>'} 80%</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-bold">Sender Name</Label>
              <Input placeholder="HireStack Recruitment Team" className="bg-muted/20 border-border" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label className="text-foreground font-bold">WhatsApp Updates</Label>
                 <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                    <MessageSquare className="h-4 w-4" /> WhatsApp Cloud API: Connected
                 </div>
               </div>
               <div className="space-y-2">
                  <Label className="text-foreground font-bold">Workflow Rules</Label>
                  <Select defaultValue="strict">
                    <SelectTrigger className="bg-muted/20 border-border">
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
          <Button variant="outline" className="rounded-xl h-11 px-8">Cancel</Button>
          <Button onClick={handleSave} className="rounded-xl h-11 px-8 shadow-lg shadow-primary/20">Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
