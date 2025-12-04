
'use client';

import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { useUser, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from 'firebase/firestore';
import { MobileNavBar } from '@/components/mobile-nav-bar';

const PLANS = {
  monthly: {
    usd: { name: 'Premium Monthly', price: 9.99, currency: 'USD' },
    ngn: { name: 'Premium Monthly', price: 15000, currency: 'NGN' },
  },
  yearly: {
    usd: { name: 'Premium Yearly', price: 99.90, pricePerMonth: 8.33, currency: 'USD' },
    ngn: { name: 'Premium Yearly', price: 150000, pricePerMonth: 12500, currency: 'NGN' },
  }
}

export default function PricingPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  const [billingCycle, setBillingCycle] = useState('monthly');

  const isLoading = isUserLoading || isProfileLoading;
  const isNigerianUser = userProfile?.country === 'Nigeria';

  const handleChoosePlan = (plan: 'monthly' | 'yearly') => {
    const currencyType = isNigerianUser ? 'ngn' : 'usd';
    const selectedPlan = PLANS[plan][currencyType];
    router.push(`/billing?plan=${encodeURIComponent(selectedPlan.name)}&amount=${selectedPlan.price}&cycle=${plan}&currency=${selectedPlan.currency}`);
  };

  const getPlanDetails = (cycle: 'monthly' | 'yearly') => {
    return isNigerianUser ? PLANS[cycle].ngn : PLANS[cycle].usd;
  }

  const getCurrencySymbol = () => {
    return isNigerianUser ? '₦' : '$';
  }
  
  const handleNavigation = (view: 'symptoms' | 'savedRemedies' | 'dashboard' | 'profile') => {
    router.push(`/#${view}`);
  }


  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="w-full p-4 md:p-8 md:px-12">
        <AppHeader onShowSavedForLater={() => router.push('/#savedRemedies')} onShowSymptoms={() => router.push('/')} />
      </div>
      <main className="flex-1 flex flex-col items-center p-4 md:p-8 pt-0">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-4xl font-headline font-bold text-primary mb-2">Our Pricing Plans</h1>
          <p className="text-lg text-muted-foreground mb-8">Choose the plan that's right for you.</p>
          
          {isLoading ? (
             <div className="flex justify-center mb-8">
               <Loader2 className="h-6 w-6 animate-spin" />
             </div>
          ) : (
            <Tabs defaultValue="monthly" onValueChange={setBillingCycle} className="w-full max-w-md mx-auto mb-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>
            </Tabs>
          )}


          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-lg text-left">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Free</CardTitle>
                <CardDescription>Get started with basic features.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-4xl font-bold">
                  $0<span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Unlimited symptom checks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>10 "How to Prepare" uses (one-time)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Save up to 5 Remedies (one-time)</span>
                  </li>
                   <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>5 Social Post Downloads (one-time)</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                 <Button variant="outline" className="w-full" disabled>
                  Your Current Plan
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="shadow-lg text-left border-primary border-2 relative h-full flex flex-col">
              {billingCycle === 'yearly' && (
                <div className="absolute top-0 right-4 -mt-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  SAVE 17%
                </div>
              )}
               <CardHeader>
                <CardTitle className="font-headline text-2xl">Premium</CardTitle>
                <CardDescription>Unlock the full power of Herbbify.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 flex-grow">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin"/>
                ) : (
                  <>
                  {billingCycle === 'monthly' ? (
                    <div className="text-4xl font-bold">
                      {getCurrencySymbol()}{getPlanDetails('monthly').price.toLocaleString()}<span className="text-lg font-normal text-muted-foreground">/month</span>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl font-bold">
                        {getCurrencySymbol()}{getPlanDetails('yearly').price.toLocaleString()}<span className="text-lg font-normal text-muted-foreground">/year</span>
                      </div>
                      <p className="text-muted-foreground text-sm">({getCurrencySymbol()}{getPlanDetails('yearly').pricePerMonth?.toLocaleString()}/month)</p>
                    </div>
                  )}
                  </>
                )}
                <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Everything in Free, plus:</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Unlimited "How to Prepare" uses</span>
                  </li>
                    <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Unlimited Remedy Saves</span>
                  </li>
                    <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Unlimited Social Post Downloads</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Priority Customer Support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleChoosePlan(billingCycle === 'monthly' ? 'monthly' : 'yearly')} className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upgrade to Premium
                </Button>
              </CardFooter>
            </Card>
          </div>
           <Button asChild variant="link" className="mt-8">
                <Link href="/">Back to Home</Link>
            </Button>
        </div>
      </main>
      <MobileNavBar onNavigate={handleNavigation} activeView="" />
    </div>
  );
}
