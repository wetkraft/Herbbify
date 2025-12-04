
"use client";

import { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  herbalRecommendationFromSymptoms,
  HerbalRecommendationFromSymptomsOutput,
} from "@/ai/flows/herbal-recommendation-from-symptoms";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Mic, MicOff, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useError } from "./error-provider";
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import { speak } from "@/lib/speech";


const FormSchema = z.object({
  symptoms: z
    .string()
    .min(1, { message: "Please describe your symptoms." })
    .max(500, { message: "Please keep your description under 500 characters." }),
  age: z.string().min(1, { message: "Please select an age range." }),
  gender: z.string().min(1, { message: "Please select a gender." }),
});

const placeholderSymptoms = [
  "'I have a persistent dry cough and a headache...'",
  "'Feeling bloated and have an upset stomach after meals.'",
  "'I'm having trouble sleeping and feel anxious.'",
  "'My joints are aching, especially in the morning.'",
  "or click the mic to speak.",
];

type SymptomCheckerProps = {
  onRecommendationReady: (
    data: HerbalRecommendationFromSymptomsOutput & { symptoms: string }
  ) => void;
};

export function SymptomChecker({
  onRecommendationReady,
}: SymptomCheckerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const { showError } = useError();
  const recognitionRef = useRef<any>(null);
  
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  const [animatedPlaceholder, setAnimatedPlaceholder] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(40);

  useEffect(() => {
    const handleTyping = () => {
      const currentPlaceholder = placeholderSymptoms[placeholderIndex];
      if (isDeleting) {
        setAnimatedPlaceholder((prev) => prev.substring(0, prev.length - 1));
        setTypingSpeed(20);
      } else {
        setAnimatedPlaceholder((prev) =>
          currentPlaceholder.substring(0, prev.length + 1)
        );
        setTypingSpeed(40);
      }

      if (!isDeleting && animatedPlaceholder === currentPlaceholder) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && animatedPlaceholder === "") {
        setIsDeleting(false);
        setPlaceholderIndex(
          (prev) => (prev + 1) % placeholderSymptoms.length
        );
      }
    };

    const typingTimeout = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(typingTimeout);
  }, [animatedPlaceholder, isDeleting, placeholderIndex, typingSpeed]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { symptoms: "", age: "", gender: "" },
  });

  useEffect(() => {
    if (userProfile && !isProfileLoading) {
      if (userProfile.age) {
        form.setValue('age', userProfile.age);
      }
      if (userProfile.gender) {
        form.setValue('gender', userProfile.gender);
      }
    }
  }, [userProfile, isProfileLoading, form]);


  const symptomsValue = form.watch("symptoms");
  const hasSymptoms = symptomsValue && symptomsValue.length > 0;

  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showError(
        "Speech Recognition Not Supported",
        "Your browser does not support speech recognition."
      );
      return;
    }
    
    speak("I'm listening.");
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      showError(
        "Speech Recognition Error",
        event.error === "not-allowed"
          ? "Microphone access denied."
          : "An error occurred during speech recognition."
      );
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const currentSymptoms = form.getValues("symptoms");
      form.setValue(
        "symptoms",
        currentSymptoms ? `${currentSymptoms} ${transcript}` : transcript
      );
    };

    recognition.start();
  };

  const handlePrimarySubmit = async () => {
    const symptomsValid = await form.trigger("symptoms");
    if (!symptomsValid) return;
  
    // If user is logged in, and we have their profile, but no age/gender, show dialog
    if (user && userProfile && (!userProfile.age || !userProfile.gender)) {
      setIsInfoDialogOpen(true);
      return;
    }
  
    // If not logged in, or if age/gender are already known, show dialog to get them
    const age = form.getValues("age");
    const gender = form.getValues("gender");
  
    if (age && gender) {
      onSubmit(form.getValues());
    } else {
      setIsInfoDialogOpen(true);
    }
  };

  const handleInfoDialogSubmit = async () => {
    const ageValid = await form.trigger("age");
    const genderValid = await form.trigger("gender");

    if (ageValid && genderValid) {
      setIsInfoDialogOpen(false);
      onSubmit(form.getValues());
    }
  };
  
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // If the dialog is closed without submitting, reset the fields
      // so the user is prompted again next time.
      if (userProfile && !userProfile.age) {
        form.resetField('age');
      }
      if (userProfile && !userProfile.gender) {
        form.resetField('gender');
      }
    }
    setIsInfoDialogOpen(open);
  };


  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);

    if (userProfileRef) {
      // Save age and gender if they've changed or are new
      const newProfileData: { age?: string; gender?: string } = {};
      if (data.age && data.age !== userProfile?.age) {
        newProfileData.age = data.age;
      }
      if (data.gender && data.gender !== userProfile?.gender) {
        newProfileData.gender = data.gender;
      }
      if (Object.keys(newProfileData).length > 0) {
        updateDocumentNonBlocking(userProfileRef, newProfileData);
      }
    }

    try {
      const result = await herbalRecommendationFromSymptoms(data);
      onRecommendationReady({ ...result, symptoms: data.symptoms });
    } catch (error) {
      console.error("Error getting recommendations:", error);
      showError(
        "An Error Occurred",
        "Failed to get recommendations. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="pt-6">
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePrimarySubmit();
            }}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-center block text-xl font-semibold">
                    HI! {user?.displayName || 'guest'} I&apos;m your personal Herbalist today, how can I help?
                  </FormLabel>

                  <p className="text-muted-foreground text-center text-sm">
                    Describe your symptoms, and Herbbify will suggest some vital
                    herbal remedies.
                  </p>

                  <div className="relative">
                    <FormControl>
                      <div className="relative gradient-border">
                        <Textarea
                          placeholder={animatedPlaceholder}
                          className="resize-none pr-16"
                          rows={5}
                          {...field}
                          disabled={isLoading}
                        />

                        {isLoading && (
                          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-md overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 animate-loader-wipe opacity-30"></div>
                            <Image
                              src="/logo (3).png"
                              alt="Herbbify logo"
                              width={60}
                              height={60}
                              className="relative z-10"
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>

                    {!hasSymptoms && !isLoading ? (
                      <Button
                        type="button"
                        variant={isListening ? "destructive" : "default"}
                        size="icon"
                        onClick={handleToggleListening}
                        className={cn(
                          "absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-12 w-12",
                          isListening && "animate-radiate"
                        )}
                      >
                        {isListening ? (
                          <MicOff className="h-6 w-6" />
                        ) : (
                          <Mic className="h-6 w-6" />
                        )}
                      </Button>
                    ) : (
                      !isLoading && (
                        <Button
                          type="submit"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-12 w-12"
                        >
                          <Send className="h-6 w-6" />
                        </Button>
                      )
                    )}
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <Dialog open={isInfoDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent>
            <Form {...form}>
              <DialogHeader>
                <DialogTitle>A Little More Info</DialogTitle>
                <DialogDescription>
                  Please provide your age and gender for more personalized
                  recommendations.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* Gender */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>

                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a gender" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Prefer not to say">
                            Prefer not to say
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Age */}
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>

                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an age range" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          <SelectItem value="18-29">18-29</SelectItem>
                          <SelectItem value="30-39">30-39</SelectItem>
                          <SelectItem value="40-49">40-49</SelectItem>
                          <SelectItem value="50-59">50-59</SelectItem>
                          <SelectItem value="60+">60+</SelectItem>
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button onClick={handleInfoDialogSubmit} disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Continue
                </Button>
              </DialogFooter>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
