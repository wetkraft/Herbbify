
'use client';

import { Suspense } from 'react';
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, useFirestore, useMemoFirebase, updateDocumentNonBlocking, useDoc } from "@/firebase";
import { doc } from 'firebase/firestore';
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { useToast } from "@/hooks/use-toast";
import { useError } from "@/components/error-provider";
import { add, format } from 'date-fns';

const PLANS = {
  monthly: {
    usd: { key: 'monthly-usd', name: 'Premium Monthly', price: 9.99, currency: 'USD' },
    ngn: { key: 'monthly-ngn', name: 'Premium Monthly', price: 15000, currency: 'NGN' },
  },
  yearly: {
    usd: { key: 'yearly-usd', name: 'Premium Yearly', price: 99.90, currency: 'USD' },
    ngn: { key: 'yearly-ngn', name: 'Premium Yearly', price: 150000, currency: 'NGN' },
  }
}

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { showError } = useError();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  // Determine if the user is just checking out or managing their billing
  const isCheckoutFlow = searchParams.has('plan');

  // Read plan details from URL for checkout, or set defaults for plan management view
  const planName = searchParams.get('plan') || 'Premium Monthly';
  const planAmount = parseFloat(searchParams.get('amount') || '9.99');
  const billingCycle = searchParams.get('cycle') || 'monthly';
  const currency = searchParams.get('currency') || 'USD';

  const isNigerianUser = userProfile?.country === 'Nigeria';
  const yearlyPlanDetails = isNigerianUser ? PLANS.yearly.ngn : PLANS.yearly.usd;
  const yearlyCurrencySymbol = yearlyPlanDetails.currency === 'NGN' ? '₦' : '$';


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const getFlutterwaveConfig = (amount: number, currency: string, planName: string) => ({
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY!,
    tx_ref: `herbbify-${user?.uid}-${Date.now()}`,
    amount,
    currency,
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: user?.email || '',
      name: user?.displayName || 'Herbbify User',
    },
    customizations: {
      title: 'Herbbify Premium Plan',
      description: `Payment for ${planName}`,
      logo: '/logo (3).png',
    },
  });

  const handlePayment = (config: any, cycle: 'monthly' | 'yearly') => {
    const handleFlutterwavePayment = useFlutterwave(config);
    
    handleFlutterwavePayment({
      callback: (response) => {
        console.log('Flutterwave response:', response);
        
        const now = new Date();
        const expirationDate = cycle === 'yearly' 
            ? add(now, { years: 1 })
            : add(now, { months: 1 });

        if (!userProfileRef) return;
        
        updateDocumentNonBlocking(userProfileRef, {
            plan: 'Premium',
            planExpiresAt: expirationDate
        });

        toast({
          title: "Payment Successful!",
          description: "Your account has been upgraded to Premium.",
        });

        closePaymentModal();
        router.push('/dashboard');
      },
      onClose: () => {
        toast({
          variant: "destructive",
          title: "Payment Cancelled",
          description: "You have cancelled the payment process.",
        })
      },
    });
  }

  const handleUpgradeClick = () => {
    if (!user || !userProfileRef) {
        showError("Authentication Error", "You must be signed in to make a payment.");
        return;
    }
    const config = getFlutterwaveConfig(planAmount, currency, planName);
    handlePayment(config, billingCycle as 'monthly' | 'yearly');
  }
  
  const handleYearlyUpgradeClick = () => {
    if (!user || !userProfileRef) {
        showError("Authentication Error", "You must be signed in to make a payment.");
        return;
    }
    const config = getFlutterwaveConfig(yearlyPlanDetails.price, yearlyPlanDetails.currency, yearlyPlanDetails.name);
    handlePayment(config, 'yearly');
  }


   if (isUserLoading || isProfileLoading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>
    )
  }

  const currencySymbol = currency === 'NGN' ? '₦' : '$';
  
  // RENDER MANAGE BILLING VIEW
  if (userProfile?.plan === 'Premium' && !isCheckoutFlow) {
    const isMonthly = !userProfile.planExpiresAt || (add(new Date(), { months: 2 }) > userProfile.planExpiresAt.toDate());
    
    return (
      <div className="flex flex-col flex-1 w-full">
        <div className="w-full p-4 md:p-8 md:px-12">
            <AppHeader onShowSavedForLater={() => router.push('/#savedRemedies')} onShowSymptoms={() => router.push('/')} />
        </div>
        <main className="flex-1 flex flex-col items-center p-4 md:p-8 pt-0">
            <div className="w-full max-w-md space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Manage Subscription</CardTitle>
                        <CardDescription>View your current plan and available options.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 border rounded-lg bg-secondary/50">
                            <p className="text-sm text-muted-foreground">Current Plan</p>
                            <p className="text-lg font-bold">{isMonthly ? 'Premium Monthly' : 'Premium Yearly'}</p>
                            {userProfile.planExpiresAt && (
                                <p className="text-sm text-muted-foreground">
                                    Renews on {format(userProfile.planExpiresAt.toDate(), 'PPP')}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {isMonthly && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Upgrade and Save</CardTitle>
                      <CardDescription>Switch to a yearly plan to save on your subscription.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="flex justify-between items-baseline p-4 border rounded-lg bg-secondary/50">
                          <span className="font-semibold text-lg">{yearlyPlanDetails.name}</span>
                          <div>
                            <span className="text-3xl font-bold">{yearlyCurrencySymbol}{yearlyPlanDetails.price.toLocaleString()}</span>
                            <span className="text-muted-foreground">/year</span>
                          </div>
                      </div>
                    </CardContent>
                    <CardContent>
                      <Button onClick={handleYearlyUpgradeClick} className="w-full" size="lg">
                          Upgrade to Yearly
                      </Button>
                    </CardContent>
                  </Card>
                )}
            </div>
        </main>
      </div>
    )
  }

  // RENDER CHECKOUT FLOW
  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="w-full p-4 md:p-8 md:px-12">
        <AppHeader onShowSavedForLater={() => router.push('/#savedRemedies')} onShowSymptoms={() => router.push('/')} />
      </div>
      <main className="flex-1 flex flex-col items-center p-4 md:p-8 pt-0">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Complete Your Purchase</CardTitle>
              <CardDescription>You are upgrading to the {planName} plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-baseline p-4 border rounded-lg bg-secondary/50">
                    <span className="font-semibold text-lg">{planName}</span>
                    <div>
                      <span className="text-3xl font-bold">{currencySymbol}{planAmount.toLocaleString()}</span>
                      <span className="text-muted-foreground">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">
                    Click the button below to complete your payment securely with Flutterwave.
                </p>
                <Button onClick={handleUpgradeClick} className="w-full" size="lg">
                    Pay with Flutterwave
                </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>
    }>
      <BillingContent />
    </Suspense>
  )
}
