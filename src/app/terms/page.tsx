
"use client";

import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xl font-bold mt-6 mb-2">{children}</h3>
);

export default function TermsPage() {
  const router = useRouter();
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString());
  }, []);

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="w-full p-4 md:p-8 md:px-12">
        <AppHeader onShowSavedForLater={() => router.push('/')} onShowSymptoms={() => router.push('/')} />
      </div>
      <main className="flex-1 flex flex-col items-center p-4 md:p-8 pt-0">
          <div className="w-full max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-3xl">Terms and Conditions</CardTitle>
                <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Welcome to Herbbify ("we," "us," or "our"). By accessing or using our application (the "Service"), you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not access the Service.
                </p>

                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>1. Important Medical Disclaimer</AlertTitle>
                  <AlertDescription>
                    The information and recommendations provided by Herbbify are for informational and educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read or received from this Service. Reliance on any information provided by this Service is solely at your own risk.
                  </AlertDescription>
                </Alert>

                <SectionTitle>2. Use of the Service</SectionTitle>
                <p>
                  You must be at least 18 years old to use this Service. You are responsible for any activity that occurs through your account and you agree you will not sell, transfer, license or assign your account, username, or any account rights.
                </p>

                <SectionTitle>3. User Accounts</SectionTitle>
                <p>
                  When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
                </p>

                <SectionTitle>4. Intellectual Property</SectionTitle>
                <p>
                  The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of Herbbify and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
                </p>

                <SectionTitle>5. Limitation Of Liability</SectionTitle>
                <p>
                  In no event shall Herbbify, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                </p>

                <SectionTitle>6. Termination</SectionTitle>
                <p>
                  We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>

                <SectionTitle>7. Governing Law</SectionTitle>
                <p>
                  These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which the company is established, without regard to its conflict of law provisions.
                </p>

                <SectionTitle>8. Changes to Terms</SectionTitle>
                <p>
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                </p>
                
                <SectionTitle>9. Contact Us</SectionTitle>
                <p>If you have any questions about these Terms, please contact us at support@herbbify.app.</p>

                <div className="pt-4">
                  <Button asChild>
                    <Link href="/">Back to Home</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
    </div>
  );
}
