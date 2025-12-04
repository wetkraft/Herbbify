
'use client';

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { handleEmailPasswordSignIn } from '@/firebase/auth/client';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SecurityPuzzle } from '@/components/security-puzzle';
import Image from 'next/image';
import { Eye, EyeOff } from "lucide-react";
import { useError } from "@/components/error-provider";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showError } = useError();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    // If the user is logged in and their email is verified, they can stay.
    // The useUser hook will reflect the signed-out state if verification fails during login.
    if (!isUserLoading && user && user.emailVerified) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    handleEmailPasswordSignIn(values.email, values.password, showError, router.push);
  };

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="w-full p-4 md:p-8 md:px-12">
        <AppHeader onShowSavedForLater={() => router.push('/')} onShowSymptoms={() => router.push('/')} />
      </div>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center items-center">
            <Image src="/logo (3).png" alt="Herbbify Logo" width={64} height={64} />
            <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to access your saved remedies.</CardDescription>
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
                        <Input placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                           <Input type={showPassword ? "text" : "password"} placeholder="Password" {...field} />
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

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="remember-me" />
                        <label
                        htmlFor="remember-me"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                        Remember me
                        </label>
                    </div>
                  <Link href="/forgot-password" passHref>
                    <Button variant="link" className="px-0 h-auto text-sm">Forgot Password?</Button>
                  </Link>
                </div>
                
                <SecurityPuzzle onSolve={setIsPuzzleSolved} />

                <Button type="submit" className="w-full" disabled={!isPuzzleSolved}>Sign In</Button>
              </form>
            </Form>

             <p className="px-8 text-center text-sm text-muted-foreground pt-2">
                Don&apos;t have an account?{' '}
                <Link
                  href="/signup"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Sign up
                </Link>
              </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
