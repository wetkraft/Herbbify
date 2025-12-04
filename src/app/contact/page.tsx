
"use client";

import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Mail, Instagram } from "lucide-react";

const ContactInfo = ({ icon: Icon, title, value, href }: { icon: React.ElementType, title: string, value: string, href: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block p-4 border rounded-lg hover:bg-secondary transition-colors">
        <div className="flex items-center gap-4">
            <Icon className="h-8 w-8 text-primary" />
            <div>
                <p className="font-semibold text-lg">{title}</p>
                <p className="text-muted-foreground">{value}</p>
            </div>
        </div>
    </a>
);


export default function ContactPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="w-full p-4 md:p-8 md:px-12">
        <AppHeader onShowSavedForLater={() => router.push('/')} onShowSymptoms={() => router.push('/')} />
      </div>
      <main className="flex-1 flex flex-col items-center p-4 md:p-8 pt-0">
          <div className="w-full max-w-lg">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl">Contact Us</CardTitle>
              <CardDescription>
                We'd love to hear from you! Reach out with any questions or feedback.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <ContactInfo 
                icon={Mail}
                title="Email Support"
                value="support@herbbify.app"
                href="mailto:support@herbbify.app"
              />

              <ContactInfo 
                icon={Instagram}
                title="Follow us on Instagram"
                value="@herbbify"
                href="https://www.instagram.com/herbbify"
              />

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
