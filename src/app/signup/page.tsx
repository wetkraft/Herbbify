
'use client';

import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { handleEmailPasswordSignUp } from '@/firebase/auth/client';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countries } from '@/lib/countries';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useError } from '@/components/error-provider';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  displayName: z.string().min(3, { message: 'Display name must be at least 3 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  country: z.string().min(1, { message: 'Please select your country.' }),
});

export default function SignUpPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { showError } = useError();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      country: '',
    },
  });

  useEffect(() => {
    // If the user is already logged in and verified, redirect them
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsSigningUp(true);
    handleEmailPasswordSignUp(
        values.email, 
        values.password, 
        values.displayName, 
        values.country, 
        (title, desc) => {
            showError(title, desc);
            setIsSigningUp(false);
        },
        (uid) => {
            // On successful creation, redirect to the OTP page
            setIsSigningUp(false);
            router.push(`/verify-otp?uid=${uid}`);
        }
    );
  };

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="w-full p-4 md:p-8 md:px-12">
        <AppHeader onShowSavedForLater={() => router.push('/')} onShowSymptoms={() => router.push('/')} />
      </div>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center items-center">
            <CardTitle className="font-headline text-2xl">Create an Account</CardTitle>
            <CardDescription>Join Herbbify to save your remedies.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Your Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                </div>
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
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <ScrollArea className="h-72">
                            {countries.map(country => (
                              <SelectItem key={country.value} value={country.label}>
                                {country.label}
                              </SelectItem>
                            ))}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="items-top flex space-x-2 pt-2">
                    <Checkbox 
                        id="terms" 
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => setAgreedToTerms(Boolean(checked))}
                    />
                    <div className="grid gap-1.5 leading-none">
                        <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                        I agree to the{' '}
                        <Link href="/terms" target="_blank" className="underline hover:text-primary">
                            Terms and Conditions
                        </Link>
                        </label>
                    </div>
                </div>

                <SecurityPuzzle onSolve={setIsPuzzleSolved} />
                <Button type="submit" className="w-full" disabled={!isPuzzleSolved || isSigningUp || !agreedToTerms}>
                    {isSigningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                </Button>
              </form>
            </Form>
            
            <p className="px-8 pt-2 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="underline underline-offset-4 hover:text-primary"
              >
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
