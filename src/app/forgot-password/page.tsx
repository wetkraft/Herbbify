
'use client';

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useError } from "@/components/error-provider";
import { sendPasswordResetOtp } from "@/ai/flows/send-password-reset-otp-flow";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { showError } = useError();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const result = await sendPasswordResetOtp({ email: values.email });
      if (result.success) {
        toast({
          title: "Code Sent",
          description: "A password reset code has been sent to your email.",
        });
        router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
      } else {
        showError("Error", result.message || "An unexpected error occurred.");
      }
    } catch (error: any) {
      showError("Error", error.message || "Failed to send reset code. Please try again.");
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
            <CardTitle className="font-headline text-2xl">Forgot Password?</CardTitle>
            <CardDescription>Enter your email to receive a reset code.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Code
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
