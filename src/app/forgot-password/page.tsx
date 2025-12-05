
"use client";

import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="w-full p-4 md:p-8 md:px-12">
        <AppHeader onShowSavedForLater={() => router.push('/')} onShowSymptoms={() => router.push('/')} />
      </div>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center items-center">
            <CardTitle className="font-headline text-2xl">Forgot Password?</CardTitle>
            <CardDescription>Enter your email to receive a password reset link.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <ForgotPasswordForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
