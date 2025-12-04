
'use client';

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useError } from "@/components/error-provider";
import { resetPassword } from "@/ai/flows/reset-password-flow";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const formSchema = z.object({
  otp: z.string().length(6, { message: 'OTP must be 6 digits.' }),
  newPassword: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showError } = useError();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const email = searchParams.get('email');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: '',
      newPassword: '',
    },
  });

  if (!email) {
    return (
        <main className="flex-1 flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Invalid Link</CardTitle>
                    <CardDescription>No email address was provided. Please start the process again.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/forgot-password">Go Back</Link>
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const result = await resetPassword({ 
        email, 
        otp: values.otp, 
        newPassword: values.newPassword 
      });

      if (result.success) {
        toast({
          title: "Password Reset Successful",
          description: "You can now sign in with your new password.",
        });
        router.push('/login');
      } else {
        showError("Reset Failed", result.message || "An unexpected error occurred.");
      }
    } catch (error: any) {
      showError("Error", error.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="w-full p-4 md:p-8 md:px-12">
        <AppHeader onShowSavedForLater={() => router.push('/')} onShowSymptoms={() => router.push('/')} />
      </div>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center items-center">
            <CardTitle className="font-headline text-2xl">Reset Your Password</CardTitle>
            <CardDescription>Enter the code sent to {email} and your new password.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
                        <FormLabel>Verification Code</FormLabel>
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
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                            <div className="relative">
                            <Input type={showPassword ? "text" : "password"} placeholder="New Password" {...field} />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                            </div>
                        </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Reset Password
                </Button>
              </form>
            </Form>
            <Button variant="link" asChild>
                <Link href="/login">Back to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <ResetPasswordContent />
        </Suspense>
    )
}
