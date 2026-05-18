
"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, CreditCard, ShieldCheck, Loader2, Smartphone } from "lucide-react";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    description: "Perfect for testing the platform.",
    limit: 4,
    features: ["4 Candidate Analyses", "Basic AI Matching", "Email Support", "Liquid UI Access"],
    highlight: false
  },
  {
    id: "starter",
    name: "Starter",
    price: "$19",
    description: "Great for small growing teams.",
    limit: 10,
    features: ["10 Candidate Analyses", "Advanced AI Insights", "WhatsApp Notifications", "Priority Support"],
    highlight: true
  },
  {
    id: "pro",
    name: "Professional",
    price: "$49",
    description: "Unlimited power for high-volume hiring.",
    limit: 999999,
    features: ["Unlimited Candidates", "Custom AI Models", "Full API Access", "Dedicated Success Manager"],
    highlight: false
  }
];

export default function BillingPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const subRef = useMemoFirebase(() => (user && firestore) ? doc(firestore, "subscriptions", user.uid) : null, [user, firestore]);
  const { data: subscription, loading } = useDoc(subRef);

  const handleUpgrade = async (plan: typeof PLANS[0]) => {
    if (!user || !firestore) return;
    setIsProcessing(plan.id);

    // Simulate GPay/Payment processing
    setTimeout(async () => {
      try {
        await setDoc(doc(firestore, "subscriptions", user.uid), {
          userId: user.uid,
          planId: plan.id,
          candidateLimit: plan.limit,
          status: "active",
          updatedAt: new Date().toISOString()
        }, { merge: true });

        toast({
          title: "Plan Upgraded!",
          description: `You are now on the ${plan.name} plan.`,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Upgrade Failed",
          description: "There was an error processing your subscription.",
        });
      } finally {
        setIsProcessing(null);
      }
    }, 1500);
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground font-headline">Subscription & Plans</h1>
        <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">Scale your recruitment power with Liquid Glass infrastructure. Choose a plan that fits your growth flow.</p>
      </div>

      {subscription && (
        <Card className="glass-morphism border-none rounded-[3rem] p-10 overflow-hidden relative">
           <div className="absolute top-0 right-0 h-40 w-40 bg-primary/10 rounded-full blur-[80px]" />
           <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Current Plan</p>
                 <h2 className="text-3xl font-black text-foreground uppercase tracking-tight font-headline">
                   {PLANS.find(p => p.id === subscription.planId)?.name || "Free"}
                 </h2>
                 <p className="text-sm font-bold text-muted-foreground">Status: <span className="text-emerald-500 uppercase tracking-widest">{subscription.status || "Active"}</span></p>
              </div>
              <div className="flex flex-col items-center gap-2">
                 <div className="text-right">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Usage Status</p>
                    <div className="h-4 w-64 bg-muted/30 rounded-full overflow-hidden border border-white/10">
                       <div 
                         className="h-full bg-primary animate-liquid" 
                         style={{ width: `${Math.min(100, (subscription.candidateCount || 0) / (subscription.candidateLimit || 4) * 100)}%` }}
                       />
                    </div>
                    <p className="text-sm font-black text-foreground mt-2">{subscription.candidateCount || 0} / {subscription.candidateLimit || 4} Candidates Used</p>
                 </div>
              </div>
           </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <Card 
            key={plan.id} 
            className={cn(
              "glass-morphism border-none rounded-[3.5rem] overflow-hidden transition-all duration-500 hover:scale-[1.02] shadow-2xl flex flex-col",
              plan.highlight ? "ring-2 ring-primary/40 bg-white/60 dark:bg-black/40" : ""
            )}
          >
            {plan.highlight && (
              <div className="bg-primary py-2 text-center text-[10px] font-black text-white uppercase tracking-[0.4em]">Most Popular Flow</div>
            )}
            <CardHeader className="p-10 pb-0">
               <CardTitle className="text-2xl font-black font-headline">{plan.name}</CardTitle>
               <div className="mt-4 flex items-baseline gap-1">
                 <span className="text-5xl font-black font-headline tracking-tighter">{plan.price}</span>
                 <span className="text-muted-foreground font-bold text-lg">/mo</span>
               </div>
               <CardDescription className="mt-4 font-medium text-muted-foreground">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-10 flex-1">
               <div className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                       <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Check className="h-3.5 w-3.5" />
                       </div>
                       <span className="text-sm font-bold text-muted-foreground">{feature}</span>
                    </div>
                  ))}
               </div>
            </CardContent>
            <CardFooter className="p-10 pt-0">
               <Button 
                onClick={() => handleUpgrade(plan)}
                disabled={isProcessing === plan.id || subscription?.planId === plan.id}
                className={cn(
                  "w-full h-15 rounded-3xl text-lg font-black transition-all shadow-xl font-headline",
                  plan.highlight ? "bg-primary hover:bg-primary/90 shadow-primary/20" : "glass-morphism border-none text-foreground hover:bg-white/50"
                )}
               >
                 {isProcessing === plan.id ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                   subscription?.planId === plan.id ? "Current Plan" : (
                     <span className="flex items-center gap-3">
                       <Smartphone className="h-5 w-5" /> Pay with GPay
                     </span>
                   )
                 )}
               </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex flex-col items-center gap-6 pt-10">
         <div className="flex items-center gap-4 px-6 py-2 rounded-full glass-morphism border-none">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Secure Encryption • Powered by GPay & Stripe</span>
         </div>
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
