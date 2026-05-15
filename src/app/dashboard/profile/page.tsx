"use client"

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Shield, Briefcase, Camera, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "Jane Doe",
    email: "jane.doe@hirestack.ai",
    title: "Senior HR Manager",
  });
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatarUrl(dataUrl);
      setIsUploading(false);
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Could not read the image file.",
      });
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUpdateProfile = () => {
    setIsSaving(true);
    // Simulating a database save
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Profile Updated",
        description: "Your personal details have been saved successfully.",
      });
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">User Profile</h1>
        <p className="text-muted-foreground">Manage your personal account details and preferences.</p>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-sm bg-card rounded-[32px] overflow-hidden">
          <CardHeader className="bg-muted/20 border-b">
            <CardTitle className="text-foreground font-black">Public Information</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">This information will be visible to your team members.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="flex items-center gap-8 pb-8 border-b border-border">
              <div className="relative group">
                <Avatar className="h-28 w-28 border-4 border-card shadow-2xl">
                  <AvatarImage src={avatarUrl} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary text-4xl font-black">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <button 
                  onClick={triggerFileInput}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="h-8 w-8" />
                </button>
              </div>
              <div className="space-y-3">
                <Input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                />
                <Button size="sm" variant="outline" onClick={triggerFileInput} disabled={isUploading} className="rounded-xl h-10 px-6 font-bold">
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
                  Change Avatar
                </Button>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">JPG, PNG or GIF. Max 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-foreground font-bold">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    value={profile.name} 
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="pl-12 h-12 bg-muted/20 border-border rounded-xl font-medium focus-visible:ring-primary" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-bold">Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    value={profile.email} 
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="pl-12 h-12 bg-muted/20 border-border rounded-xl font-medium focus-visible:ring-primary" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-bold">Job Title</Label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    value={profile.title} 
                    onChange={(e) => setProfile({...profile, title: e.target.value})}
                    className="pl-12 h-12 bg-muted/20 border-border rounded-xl font-medium focus-visible:ring-primary" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-bold">Access Role</Label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input value="Admin" disabled className="pl-12 h-12 bg-muted/50 border-border rounded-xl font-bold opacity-70" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" className="h-12 rounded-xl px-10 font-bold" disabled={isSaving}>Cancel</Button>
          <Button 
            className="h-12 rounded-xl px-10 font-black shadow-lg shadow-primary/20" 
            onClick={handleUpdateProfile}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Update Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
