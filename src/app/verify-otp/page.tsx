
'use client';

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { useError } from "@/components/error-provider";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { resendOtp } from "@/ai/flows/resend-otp-flow";
import { doc } from "firebase/firestore";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const formSchema = z.object({
  otp: z.string().min(6, { message: 'OTP must be 6 characters.' }),
});

function VerifyOTPPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isUserLoading } = useUser();
  const { showError } = useError();
  const { toast } = useToast();
  const firestore = useFirestore();

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  const uid = searchParams.get('uid');

  const userDocRef = useMemoFirebase(() => {
      if (!firestore || !user) return null;
      return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: '',
    },
  });

  useEffect(() => {
    // If a different user is logged in, they shouldn't be on this page.
    if (!isUserLoading && user && user.uid !== uid) {
      router.push('/dashboard');
    }
    // If the logged-in user is already verified
    if (!isUserLoading && user && userProfile && userProfile.emailVerified) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, userProfile, uid, router]);

  if (isUserLoading || isProfileLoading) {
      return (
         <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
         </div>
      )
  }

  if (!uid || !user) { // If no UID or no logged-in user, something is wrong
    return (
        <main className="flex-1 flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>An Error Occurred</CardTitle>
                    <CardDescription>We couldn't verify your session. Please try logging in again.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/login">Go to Login</Link>
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    if (!userProfile || !userDocRef) {
      showError('Error', 'Could not find user profile. Please try again.');
      setIsLoading(false);
      return;
    }

    try {
      if (userProfile.otp !== values.otp) {
        throw new Error('Invalid OTP. Please check the code and try again.');
      }

      const now = new Date();
      const otpExpires = userProfile.otpExpires.toDate();

      if (now > otpExpires) {
        throw new Error('Your OTP has expired. Please request a new one.');
      }

      // OTP is valid, update user doc
      await updateDocumentNonBlocking(userDocRef, {
        emailVerified: true,
        otp: null,
        otpExpires: null,
      });
      
      toast({
          title: "Email Verified!",
          description: "Your account has been successfully verified.",
      });
      router.push('/dashboard');

    } catch (error: any) {
      showError('Verification Failed', error.message || 'An unexpected error occurred during verification.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!uid) return;
    setIsResending(true);
    try {
      await resendOtp({ userId: uid });
      toast({
        title: "New Code Sent",
        description: "A new OTP has been sent to your email address.",
      });
    } catch (error: any) {
      console.error("Error resending OTP:", error);
      showError("Resend Failed", error.message || "Could not send a new OTP. Please try again later.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="w-full p-4 md:p-8 md:px-12">
        <AppHeader onShowSavedForLater={() => router.push('/')} onShowSymptoms={() => router.push('/')} />
      </div>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center items-center">
            <CardTitle className="font-headline text-2xl">Verify Your Email</CardTitle>
            <CardDescription>Enter the 6-digit code sent to your email.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
                        <FormLabel className="sr-only">One-Time Password</FormLabel>
                        <FormControl>
                          <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading || isResending}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify Account"}
                </Button>
              </form>
            </Form>
             <p className="px-8 text-center text-sm text-muted-foreground">
                Didn't receive the code?{' '}
                <Button variant="link" className="px-0 h-auto" onClick={handleResendOtp} disabled={isLoading || isResending}>
                    {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Resend"}
                </Button>
              </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </div>
        }>
            <VerifyOTPPageContent />
        </Suspense>
    )
}
