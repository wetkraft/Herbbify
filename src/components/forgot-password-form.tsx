
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useError } from "@/components/error-provider";
import { useToast } from "@/hooks/use-toast";
import { sendPasswordResetLink } from "@/ai/flows/send-password-reset-link-flow";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

export function ForgotPasswordForm() {
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
      await sendPasswordResetLink({ email: values.email });
      toast({
        title: "Password Reset Email Sent",
        description: "If an account with this email exists, we've sent a link to reset your password.",
      });
      router.push('/login');
    } catch (error: any) {
      showError("Error", error.message || "An unexpected error occurred while sending the reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
              Send Reset Link
          </Button>
        </form>
      </Form>
      <Button variant="link" asChild>
          <Link href="/login">Back to Sign In</Link>
      </Button>
    </>
  );
}
