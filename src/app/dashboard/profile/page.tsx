
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
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
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
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage src={avatarUrl} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">JD</AvatarFallback>
                </Avatar>
                <button 
                  onClick={triggerFileInput}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-2">
                <Input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                />
                <Button size="sm" variant="outline" onClick={triggerFileInput} disabled={isUploading}>
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
                  Change Avatar
                </Button>
                <p className="text-[10px] text-slate-400">JPG, PNG or GIF. Max size 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <Label className="text-slate-700">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input defaultValue="Jane Doe" className="pl-10 h-11 bg-slate-50 border-none focus-visible:ring-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input defaultValue="jane.doe@hirestack.ai" className="pl-10 h-11 bg-slate-50 border-none focus-visible:ring-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Job Title</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input defaultValue="Senior HR Manager" className="pl-10 h-11 bg-slate-50 border-none focus-visible:ring-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Access Role</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input defaultValue="Admin" disabled className="pl-10 h-11 bg-slate-100 border-none opacity-70" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" className="h-11 px-8">Cancel</Button>
          <Button className="h-11 px-8 shadow-lg shadow-primary/20" onClick={() => toast({ title: "Profile Updated", description: "Your changes have been saved." })}>
            Update Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
