
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, Trash2, BookOpen, Volume2, Calendar as CalendarIcon, Gem } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase, deleteDocumentNonBlocking, updateDocumentNonBlocking, useDoc } from "@/firebase";
import { collection, doc, query, orderBy, increment } from "firebase/firestore";
import Link from 'next/link';
import { Skeleton } from "./ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import React, { useState, useRef } from "react";
import { textToSpeech } from "@/ai/flows/text-to-speech-flow";
import { useError } from "./error-provider";
import { GenerateRemedyCalendarOutput } from '@/ai/flows/generate-remedy-calendar-flow';
import { RemedyCalendar } from './remedy-calendar';


type DailyPlan = {
  day: number;
  recommendation: string;
  tip: string;
};

type Remedy = {
  id: string;
  title: string;
  symptoms: string;
  remedyDescription: string;
  instructionsSummary: string;
  instructions: string;
  wellnessPlan?: DailyPlan[];
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
};

const FormattedPreparation = ({ text, isPremiumUser }: { text: string, isPremiumUser: boolean }) => {
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const { showError } = useError();
  const audioRef = useRef<HTMLAudioElement>(null);

  if (!text) return null;

  const handleGenerateAudio = async () => {
    setIsGeneratingAudio(true);
    setAudioDataUri(null);
    try {
      const result = await textToSpeech({ text });
      setAudioDataUri(result.audioDataUri);
    } catch (error) {
      console.error("Error generating audio:", error);
      showError("Audio Generation Failed", "Could not generate audio for the instructions. Please try again.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const elements = text.split('\n').filter(line => line.trim() !== '').map((line, index) => {
    const key = `${index}-${line.substring(0, 10)}`;
    if (line.startsWith('**Title:**')) {
        return null;
    }
    if (line.startsWith('**') && line.endsWith('**')) {
      return <h4 key={key} className="font-bold mt-4 mb-2">{line.replace(/\*\*/g, '')}</h4>;
    }
    if (/^\d+\./.test(line)) {
      return <p key={key} className="my-1">{line}</p>;
    }
    if (line.startsWith('- ')) {
      return <p key={key} className="my-1 pl-4">{line}</p>;
    }
    return <p key={key}>{line}</p>;
  }).filter(Boolean);

  return (
    <div className="space-y-2">
      {isPremiumUser && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sticky top-2 z-10 p-2 rounded-lg">
          {!audioDataUri && (
            <Button variant="outline" onClick={handleGenerateAudio} disabled={isGeneratingAudio} className="w-full sm:w-auto">
              {isGeneratingAudio ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Volume2 className="mr-2 h-5 w-5" />
              )}
              Generate Audio
            </Button>
          )}
          {audioDataUri && (
            <audio ref={audioRef} controls src={audioDataUri} className="w-full h-10">
              Your browser does not support the audio element.
            </audio>
          )}
        </div>
      )}
      <div>{elements}</div>
    </div>
  );
};

export function SavedRemediesList() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const remediesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'remedies'), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: savedRemedies, isLoading: areRemediesLoading } = useCollection<Remedy>(remediesQuery);
  
  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile } = useDoc(userProfileRef);
  const isPremiumUser = (userProfile as any)?.plan === 'Premium';


  const handleDeleteRemedy = (remedyId: string) => {
    if (!firestore || !user) return;
    const userDocRef = doc(firestore, 'users', user.uid);
    const remedyDocRef = doc(firestore, 'users', user.uid, 'remedies', remedyId);
    
    deleteDocumentNonBlocking(remedyDocRef);

    // Only decrement if the user is on a free plan
    if ((userProfile as any)?.plan === 'Free') {
        updateDocumentNonBlocking(userDocRef, {
            savedRemediesCreditsUsed: increment(-1)
        });
    }
  };
  
  if (isUserLoading || areRemediesLoading) {
    return (
      <Card className="shadow-lg bg-card/80">
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="shadow-lg text-center bg-card/80">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            Sign In to View Saved Remedies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            Please sign in to access your collection of saved remedies.
          </p>
          <Button asChild className="mt-4">
            <Link href="/login">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (savedRemedies && savedRemedies.length === 0) {
    return (
      <Card className="shadow-lg text-center bg-card/80">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            No Saved Remedies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            You haven't saved any remedies yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Generate a remedy and click "Save Remedy" to add it to your collection.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Your Saved Remedies
        </CardTitle>
        <CardDescription>
            A personal collection of your generated herbal remedies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full space-y-2">
          {savedRemedies?.map((remedy) => (
            <AccordionItem value={remedy.id} key={remedy.id} className="border rounded-lg bg-background/70 shadow-sm data-[state=open]:bg-secondary/50">
              <AccordionTrigger className="p-4 text-left hover:no-underline">
                  <div className="flex-1">
                    <h4 className="font-semibold text-base">{remedy.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{remedy.remedyDescription}</p>
                  </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0">
                  <div className="mb-4">
                    <FormattedPreparation text={remedy.instructions} isPremiumUser={isPremiumUser} />
                  </div>
                  
                  {remedy.wellnessPlan ? (
                    <RemedyCalendar calendarData={remedy.wellnessPlan} remedyTitle={remedy.title} />
                  ) : (
                    <div className="flex justify-center my-4 items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Your 30-day wellness plan is being generated...</span>
                    </div>
                  )}

                   <div className="flex justify-end mt-4">
                      <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRemedy(remedy.id)
                          }}
                          aria-label={`Delete ${remedy.title}`}
                      >
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
