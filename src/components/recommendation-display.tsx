
'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { getPreparationInstructions } from '@/ai/flows/preparation-instructions-flow';
import { generateHerbsImage } from '@/ai/flows/generate-herbs-image-flow';
import { summarizeRemedy } from '@/ai/flows/summarize-remedy-flow';
import { summarizeInstructions } from '@/ai/flows/summarize-instructions-flow';
import { textToSpeech } from '@/ai/flows/text-to-speech-flow';
import { generateRemedyCalendar } from '@/ai/flows/generate-remedy-calendar-flow';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Heart, Leaf, Loader2, CookingPot, ArrowLeft, Download, Clipboard, Volume2, Gem } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import { SocialPostCard } from './social-post-card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useUser, useFirestore, useDoc, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { useRouter } from 'next/navigation';
import { doc, collection, serverTimestamp, increment, addDoc, updateDoc } from 'firebase/firestore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import Link from 'next/link';
import { useError } from './error-provider';

const FormattedPreparation = ({ text, audioDataUri, isGeneratingAudio, showAudio, onGenerateAudio }: { text: string; audioDataUri: string | null; isGeneratingAudio: boolean; showAudio: boolean, onGenerateAudio: () => void; }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  if (!text) return null;

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
      {showAudio && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sticky top-2 z-10 p-2 rounded-lg">
          {isGeneratingAudio && (
              <div className="flex items-center justify-center w-full h-10 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating audio...
              </div>
          )}
          {audioDataUri && !isGeneratingAudio && (
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

type RecommendationDisplayProps = {
  recommendations: { name: string; description: string }[];
  warnings: string[];
  submittedSymptoms: string;
  onBack: () => void;
};


const PREPARATION_CREDIT_LIMIT = 10;
const SAVE_CREDIT_LIMIT = 5;
const DOWNLOAD_CREDIT_LIMIT = 5;

const loadingMessages = [
  "Please be patient as Herbbify generates your preparation...",
  "Analyzing the best preparation methods for your remedy...",
  "Cross-referencing traditional herbal wisdom...",
  "Generating step-by-step instructions...",
  "Creating a custom image of your ingredients...",
  "Composing an audio guide for the instructions...",
  "Finalizing the details of your wellness plan...",
  "It's almost ready, just a few more seconds...",
];

export function RecommendationDisplay({
  recommendations,
  warnings,
  submittedSymptoms,
  onBack,
}: RecommendationDisplayProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { showError } = useError();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  const [isPreparing, setIsPreparing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [preparation, setPreparation] = useState<string | null>(null);
  const [herbsImage, setHerbsImage] = useState<string | null>(null);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const postRef = useRef<HTMLDivElement>(null);
  const [currentLoadingMessageIndex, setCurrentLoadingMessageIndex] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPreparing) {
      interval = setInterval(() => {
        setCurrentLoadingMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [isPreparing]);

  const herbNames = recommendations.map(r => r.name);
  
  const isFreeUser = userProfile?.plan === 'Free';
  const isPremiumUser = userProfile?.plan === 'Premium';

  const hasReachedPreparationLimit = isFreeUser && (userProfile?.preparationCreditsUsed || 0) >= PREPARATION_CREDIT_LIMIT;
  const hasReachedSaveLimit = isFreeUser && (userProfile?.savedRemediesCreditsUsed || 0) >= SAVE_CREDIT_LIMIT;
  const hasReachedDownloadLimit = isFreeUser && (userProfile?.socialPostDownloadCreditsUsed || 0) >= DOWNLOAD_CREDIT_LIMIT;

  async function handleGetPreparation() {
    if (!recommendations || !submittedSymptoms || !user || !userProfileRef) return;

    if (hasReachedPreparationLimit) {
        showError("Credit Limit Reached", `You've used all your ${PREPARATION_CREDIT_LIMIT} free preparations. Please upgrade to Premium for unlimited access.`);
        router.push('/pricing');
        return;
    }

    setIsPreparing(true);
    setCurrentLoadingMessageIndex(0);
    if(isPremiumUser) setIsGeneratingAudio(true);
    setPreparation(null);
    setHerbsImage(null);
    setAudioDataUri(null);

    try {
      // Always generate instructions first
      const instructionsResult = await getPreparationInstructions({
        herbs: herbNames,
        symptoms: submittedSymptoms,
      });

      setPreparation(instructionsResult.instructions);

      if (userProfile?.plan === 'Free') {
          updateDocumentNonBlocking(userProfileRef, {
              preparationCreditsUsed: increment(1)
          });
      }

      // Start image and (conditional) audio generation in parallel
      const promises = [
          generateHerbsImage({
              herbs: herbNames,
              instructions: instructionsResult.instructions,
          }).catch(e => { console.error("Image generation failed:", e); return { imageUrl: null }; })
      ];

      if (isPremiumUser) {
          promises.push(
              textToSpeech({ text: instructionsResult.instructions })
                  .catch(e => { console.error("Audio generation failed:", e); return { audioDataUri: null }; })
          );
      }
      
      const results = await Promise.all(promises);
      
      const imageResult = results[0] as { imageUrl: string | null };
      setHerbsImage(imageResult.imageUrl);

      if (isPremiumUser) {
        const audioResult = results[1] as { audioDataUri: string | null };
        setAudioDataUri(audioResult.audioDataUri);
      }

    } catch (error) {
      console.error("Error getting preparation info:", error);
      showError("An Error Occurred", "Failed to get preparation information. Please try again.");
    } finally {
      setIsPreparing(false);
      if(isPremiumUser) setIsGeneratingAudio(false);
    }
  }

  const handlePrepareClick = () => {
    if (!user) {
      showError("Please Sign In", "You need to be logged in to prepare remedies.");
      router.push('/login');
    } else {
      handleGetPreparation();
    }
  };

  const handleSaveClick = async () => {
    if (!user || !firestore || !userProfileRef) {
      showError("Please Sign In", "You need to be logged in to save remedies.");
      router.push('/login');
      return;
    }
    if (hasReachedSaveLimit) {
      showError("Save Limit Reached", `You have used your ${SAVE_CREDIT_LIMIT} free remedy saves. Please upgrade to save more remedies.`);
      router.push('/pricing');
      return;
    }
    if (!preparation || !submittedSymptoms) {
      showError("Cannot Save", "Please generate the preparation instructions first.");
      return;
    }

    setIsSaving(true);
    try {
      // Create summaries
      const remedySummaryPromise = summarizeRemedy({
        symptoms: submittedSymptoms,
        herbs: herbNames,
      });

      const instructionsSummaryPromise = summarizeInstructions({
        instructions: preparation,
        herbs: herbNames,
      });

      const [remedySummary, instructionsSummary] = await Promise.all([
        remedySummaryPromise,
        instructionsSummaryPromise,
      ]);
      
      const remedyTitle = preparation?.match(/\*\*Title:\*\*\s*(.*)/)?.[1] || "Herbal Remedy";

      // Save initial remedy document
      const remediesCol = collection(firestore, 'users', user.uid, 'remedies');
      const newRemedyRef = await addDoc(remediesCol, {
        title: remedyTitle,
        symptoms: submittedSymptoms,
        herbs: herbNames,
        instructions: preparation,
        remedyDescription: remedySummary.remedyDescription,
        instructionsSummary: instructionsSummary.summary,
        createdAt: serverTimestamp(),
        wellnessPlan: null, // Initially null
      });
      
      // Always increment, regardless of plan.
      updateDocumentNonBlocking(userProfileRef, {
          savedRemediesCreditsUsed: increment(1)
      });


      toast({
        title: "Remedy Saved",
        description: "Your remedy is saved. Generating your 30-day wellness plan...",
      });
      
      // Asynchronously generate and update the wellness plan
      generateRemedyCalendar({
          remedyTitle: remedyTitle,
          symptoms: submittedSymptoms
      }).then(calendarResult => {
          updateDoc(newRemedyRef, { wellnessPlan: calendarResult.calendar })
            .then(() => {
              toast({
                  title: "Wellness Plan Ready!",
                  description: "Your 30-day plan has been added to your saved remedy.",
                });
            });
      }).catch(err => {
          console.error("Failed to generate or save calendar", err);
          showError("Plan Generation Failed", "We couldn't create the wellness plan for this remedy.");
      });


    } catch (error) {
      console.error("Error saving remedy:", error);
      showError("Save Failed", "Could not save the remedy. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const handleCopy = () => {
    if (!preparation) return;
    const shareText = `Herbal Remedy for "${submittedSymptoms}"\n\nIngredients: ${herbNames.join(', ')}\n\nInstructions:\n${preparation}`;
    navigator.clipboard.writeText(shareText).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "Preparation instructions have been copied.",
      });
    }, (err) => {
      console.error('Could not copy text: ', err);
      showError("Copy Failed", "Could not copy instructions to clipboard.");
    });
  };

  const handleDownload = async () => {
    if (!postRef.current || !preparation || !userProfileRef) return;
    
    if (hasReachedDownloadLimit) {
        showError("Download Limit Reached", `You've used all your ${DOWNLOAD_CREDIT_LIMIT} free post downloads. Upgrade to Premium for unlimited downloads.`);
        router.push('/pricing');
        return;
    }

    setIsDownloading(true);
    try {
        const canvas = await html2canvas(postRef.current, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
        });
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'herbbify-remedy.png';
        link.href = dataUrl;
        link.click();
        
        // Always increment, regardless of plan
        updateDocumentNonBlocking(userProfileRef, {
            socialPostDownloadCreditsUsed: increment(1)
        });

    } catch (error) {
        console.error("Error generating image:", error);
        showError("Download Failed", "Could not generate the post image. Please try again.");
    } finally {
        setIsDownloading(false);
    }
  };
  
  const handleGenerateAudioForPreparation = async () => {
    if (!preparation) return;
    setIsGeneratingAudio(true);
    setAudioDataUri(null);
    try {
      const result = await textToSpeech({ text: preparation });
      setAudioDataUri(result.audioDataUri);
    } catch (error) {
      console.error("Error generating audio:", error);
      showError("Audio Generation Failed", "Could not generate audio for the instructions. Please try again.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const getCleanHerbName = (herb: string) => herb.replace(/\s\(.*\)/, '');
  
  if (recommendations.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Card className="w-full max-w-md p-8">
              <CardHeader>
                <CardTitle>No Recommendations Found</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We couldn't retrieve recommendations based on your symptoms.</p>
                <Button onClick={onBack} className="mt-4">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
      )
  }

  const postDescription = recommendations.map(r => r.description).join(' ');

  return (
    <div className="space-y-6">
       <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Symptoms
      </Button>
      <div>
        <h3 className="text-xl font-headline font-semibold mb-4">
          Herbal & Fruit Recommendations
        </h3>
        {recommendations?.length > 0 ? (
        <Card>
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {recommendations.map((item) => (
                <AccordionItem value={item.name} key={item.name}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-3">
                      <Leaf className="h-5 w-5 text-accent" />
                      <span className="font-semibold text-lg">{getCleanHerbName(item.name)}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-10 pr-2 text-muted-foreground">
                    {item.description}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
          <CardFooter className="flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2">
            {isFreeUser && userProfile && !hasReachedPreparationLimit && (
              <p className="text-xs text-muted-foreground mr-auto text-center sm:text-left">
                {PREPARATION_CREDIT_LIMIT - (userProfile.preparationCreditsUsed || 0)} free preparations remaining
              </p>
            )}
             <Button onClick={handlePrepareClick} disabled={isPreparing || isProfileLoading} className="w-full md:w-auto">
                {isPreparing || isProfileLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <CookingPot className="mr-2 h-4 w-4" />
                    <span>How to Prepare</span>
                  </>
                )}
              </Button>
          </CardFooter>
        </Card>
        ) : (
          <p className="text-muted-foreground">No specific herbal recommendations could be generated based on your symptoms.</p>
        )}
      </div>

      {isPreparing && (
         <div className="relative aspect-video w-full flex flex-col items-center justify-center rounded-lg border bg-card overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 animate-loader-wipe opacity-30"></div>
            <Image
                src="/logo (3).png"
                alt="Herbbify logo"
                width={80}
                height={80}
                className="relative z-10"
            />
            <p className="relative z-10 mt-4 text-center text-muted-foreground px-4">
              {loadingMessages[currentLoadingMessageIndex]}
            </p>
         </div>
      )}

      {(preparation || herbsImage) && !isPreparing && (
        <div>
          <Card>
            {herbsImage && (
              <div className="aspect-video w-full relative rounded-t-lg overflow-hidden">
                  <Image
                      src={herbsImage}
                      alt={herbNames.join(', ')}
                      fill
                      className="object-cover"
                  />
              </div>
            )}
            {preparation && (
              <CardContent className="pt-6">
                  <FormattedPreparation 
                    text={preparation} 
                    audioDataUri={audioDataUri} 
                    isGeneratingAudio={isGeneratingAudio}
                    showAudio={isPremiumUser ?? false}
                    onGenerateAudio={handleGenerateAudioForPreparation}
                  />
              </CardContent>
            )}
            <CardFooter className="flex flex-col sm:flex-row justify-end gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span tabIndex={0}> {/* Wrapper for Tooltip with disabled button */}
                                <Button
                                    onClick={handleSaveClick}
                                    disabled={isProfileLoading || isSaving || !preparation || hasReachedSaveLimit}
                                    className="w-full sm:w-auto"
                                    variant="outline"
                                >
                                    {isSaving || isProfileLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Heart className="mr-2 h-4 w-4" />
                                    )}
                                    Save Remedy
                                </Button>
                            </span>
                        </TooltipTrigger>
                        {isFreeUser && hasReachedSaveLimit && (
                           <TooltipContent>
                             <p>You've used your {SAVE_CREDIT_LIMIT} free saves. <Link href="/pricing" className="underline font-bold">Upgrade now!</Link></p>
                           </TooltipContent>
                        )}
                         {isFreeUser && !hasReachedSaveLimit && (
                           <TooltipContent>
                             <p>You can save {SAVE_CREDIT_LIMIT - (userProfile?.savedRemediesCreditsUsed || 0)} more remedies on the free plan.</p>
                           </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>

                <Button variant="outline" className="w-full sm:w-auto" onClick={handleCopy} disabled={!preparation}>
                  <Clipboard className="mr-2 h-4 w-4" />
                  Copy
                </Button>

                <Button
                  onClick={handleDownload}
                  disabled={isDownloading || isProfileLoading || !preparation}
                  className="w-full sm:w-auto"
                >
                  {isDownloading || isProfileLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Download Post
                </Button>

            </CardFooter>
          </Card>
           {!isPremiumUser && (
                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'><Gem className="h-5 w-5 text-primary" />Unlock Audio with Premium</CardTitle>
                        <CardDescription>Upgrade to a Premium account to get audible preparation instructions.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild>
                            <Link href="/pricing">Upgrade Now</Link>
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
      )}

      {preparation && (
        <div className="absolute -left-[9999px] top-0">
             <SocialPostCard
                ref={postRef}
                symptoms={submittedSymptoms}
                herbs={herbNames}
                description={postDescription}
                imageUrl={herbsImage}
             />
        </div>
      )}
    </div>
  );
}
