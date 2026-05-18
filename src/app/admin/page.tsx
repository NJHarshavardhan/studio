
"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ShieldAlert, Database, Key, Globe, Save, Loader2, Sparkles, Server } from "lucide-react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function AdminPortal() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const configRef = useMemoFirebase(() => firestore ? doc(firestore, "admin", "config") : null, [firestore]);
  const { data: config, loading } = useDoc(configRef);

  const [localConfig, setLocalConfig] = useState({
    platformName: "HireStack Liquid",
    aiApiKey: "••••••••••••••••",
    maintenanceMode: false,
    liquidPerformance: true
  });

  useEffect(() => {
    if (config) {
      setLocalConfig({
        platformName: config.platformName || "HireStack Liquid",
        aiApiKey: config.aiApiKey || "••••••••••••••••",
        maintenanceMode: !!config.maintenanceMode,
        liquidPerformance: true
      });
    }
  }, [config]);

  const handleSaveConfig = async () => {
    if (!firestore) return;
    setIsSaving(true);
    try {
      await setDoc(doc(firestore, "admin", "config"), localConfig, { merge: true });
      toast({
        title: "Configuration Saved",
        description: "Global system settings updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "You may not have administrative permissions.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background liquid-gradient p-8 md:p-20">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-morphism border-none text-primary mb-4">
               <ShieldAlert className="h-4 w-4" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Admin Access</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground font-headline">Platform Core</h1>
            <p className="text-muted-foreground mt-2 font-medium text-lg">Manage key secrets and liquid engine parameters.</p>
          </div>
          <Button 
            onClick={handleSaveConfig} 
            disabled={isSaving}
            className="h-16 px-12 rounded-3xl bg-primary text-xl font-black shadow-2xl shadow-primary/20 transition-all hover:scale-105"
          >
            {isSaving ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <Save className="h-6 w-6 mr-3" />}
            Deploy Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-8">
              <Card className="glass-morphism border-none rounded-[3.5rem] p-10 shadow-2xl overflow-hidden relative">
                 <div className="absolute top-0 right-0 h-64 w-64 bg-primary/5 rounded-full blur-[100px]" />
                 <CardHeader className="p-0 mb-10">
                    <div className="flex items-center gap-4">
                       <div className="p-4 rounded-3xl bg-primary/10 text-primary">
                          <Globe className="h-8 w-8" />
                       </div>
                       <CardTitle className="text-2xl font-black font-headline">Platform Identity</CardTitle>
                    </div>
                 </CardHeader>
                 <CardContent className="p-0 space-y-8">
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase tracking-[0.3em] ml-1">Platform Name</Label>
                       <Input 
                         value={localConfig.platformName}
                         onChange={(e) => setLocalConfig({...localConfig, platformName: e.target.value})}
                         className="h-16 rounded-2xl bg-white/40 dark:bg-black/20 border-none px-8 font-bold text-lg" 
                       />
                    </div>
                    <div className="space-y-3">
                       <Label className="text-[10px] font-black uppercase tracking-[0.3em] ml-1">Master Neural API Key</Label>
                       <div className="relative">
                          <Key className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input 
                            type="password"
                            value={localConfig.aiApiKey}
                            onChange={(e) => setLocalConfig({...localConfig, aiApiKey: e.target.value})}
                            className="h-16 rounded-2xl bg-white/40 dark:bg-black/20 border-none pl-16 font-mono" 
                          />
                       </div>
                    </div>
                 </CardContent>
              </Card>

              <Card className="glass-morphism border-none rounded-[3.5rem] p-10 shadow-2xl">
                 <CardHeader className="p-0 mb-10">
                    <div className="flex items-center gap-4">
                       <div className="p-4 rounded-3xl bg-amber-500/10 text-amber-500">
                          <Server className="h-8 w-8" />
                       </div>
                       <CardTitle className="text-2xl font-black font-headline">Neural Engine Controls</CardTitle>
                    </div>
                 </CardHeader>
                 <CardContent className="p-0 space-y-8">
                    <div className="flex items-center justify-between p-6 rounded-3xl bg-white/20 dark:bg-black/20">
                       <div className="space-y-1">
                          <p className="font-black text-foreground font-headline">Maintenance Mode</p>
                          <p className="text-xs text-muted-foreground font-bold">Freeze all public-facing liquid flows.</p>
                       </div>
                       <Switch 
                         checked={localConfig.maintenanceMode}
                         onCheckedChange={(val) => setLocalConfig({...localConfig, maintenanceMode: val})}
                       />
                    </div>
                    <div className="flex items-center justify-between p-6 rounded-3xl bg-white/20 dark:bg-black/20">
                       <div className="space-y-1">
                          <p className="font-black text-foreground font-headline">Liquid Performance Boost</p>
                          <p className="text-xs text-muted-foreground font-bold">Optimize backdrop-blur for low-end neural cores.</p>
                       </div>
                       <Switch 
                         checked={localConfig.liquidPerformance}
                         onCheckedChange={(val) => setLocalConfig({...localConfig, liquidPerformance: val})}
                       />
                    </div>
                 </CardContent>
              </Card>
           </div>

           <div className="lg:col-span-4 space-y-8">
              <Card className="bg-primary border-none rounded-[3.5rem] p-10 text-white shadow-2xl shadow-primary/20">
                 <Sparkles className="h-12 w-12 mb-8" />
                 <h3 className="text-2xl font-black font-headline mb-4">Admin Insights</h3>
                 <p className="font-bold opacity-90 leading-relaxed mb-8">
                   Changes made here affect all liquid nodes across the platform instantly. Handle with care.
                 </p>
                 <div className="p-6 rounded-3xl bg-white/20 backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2">Platform Health</p>
                    <div className="flex items-center gap-3">
                       <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                       <span className="font-black text-xl">100% Operational</span>
                    </div>
                 </div>
              </Card>

              <Card className="glass-morphism border-none rounded-[3.5rem] p-10">
                 <Database className="h-8 w-8 text-muted-foreground mb-6" />
                 <h3 className="font-black text-lg font-headline mb-2">Neural Cache</h3>
                 <p className="text-xs text-muted-foreground font-bold mb-6">Flush global liquid cache to propagate DNS-level neural changes.</p>
                 <Button variant="outline" className="w-full rounded-2xl h-12 font-black border-white/20">Flush Cache</Button>
              </Card>
           </div>
        </div>
      </div>
    </div>
  );
}
