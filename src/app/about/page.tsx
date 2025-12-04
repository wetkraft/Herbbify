
"use client";

import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Bot, BrainCircuit, HeartHandshake } from "lucide-react";

const SectionTitle = ({ children, icon: Icon }: { children: React.ReactNode; icon: React.ElementType }) => (
  <div className="flex items-center gap-3 mt-6 mb-3">
    <Icon className="h-6 w-6 text-primary" />
    <h3 className="text-xl font-bold">{children}</h3>
  </div>
);


export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="w-full p-4 md:p-8 md:px-12">
        <AppHeader onShowSavedForLater={() => router.push('/')} onShowSymptoms={() => router.push('/')} />
      </div>
      <main className="flex-1 flex flex-col items-center p-4 md:p-8 pt-0">
          <div className="w-full max-w-4xl">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl">About Herbbify</CardTitle>
              <p className="text-muted-foreground text-lg pt-1">
                Your personal AI herbalist for natural wellness.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <SectionTitle icon={HeartHandshake}>Our Mission</SectionTitle>
              <p>
                Our mission is to make the world of natural wellness accessible and understandable for everyone. We believe in the power of traditional herbal wisdom and want to combine it with the best of modern technology to help you on your health journey. We aim to provide a bridge between age-old remedies and today's fast-paced world, offering a starting point for those curious about natural health.
              </p>

              <SectionTitle icon={BrainCircuit}>Our Philosophy</SectionTitle>
              <p>
                We are passionate about holistic health. Our philosophy is built on the idea that the body has a remarkable ability to find balance. The herbal and fruit recommendations provided by our AI are intended to support this natural process. We focus on common, accessible ingredients that have been used for generations in traditional medicine systems across the world.
              </p>

              <SectionTitle icon={Bot}>How It Works</SectionTitle>
              <p>
                Herbbify uses a sophisticated Large Language Model (LLM) that has been trained on a vast library of herbalist texts, traditional medicine knowledge, and modern botanical research. When you describe your symptoms, our AI analyzes your input and cross-references it with this extensive database to identify and suggest herbs and fruits that may be beneficial for your specific situation.
              </p>

              <Alert variant="destructive" className="mt-8">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important Medical Disclaimer</AlertTitle>
                <AlertDescription>
                  Herbbify is an informational tool, not a medical professional. The recommendations provided are for educational purposes only and are not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider before starting any new treatment or if you have any questions about a medical condition.
                </AlertDescription>
              </Alert>

              <div className="text-center pt-4">
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
