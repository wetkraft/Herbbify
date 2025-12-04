
'use client';

import { useUser, useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookHeart, Bot, Gem, Download, CreditCard, DollarSign } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect } from "react";
import { formatDistanceToNow, isPast } from 'date-fns';
import { useIsMobile } from "@/hooks/use-mobile";
import { PwaInstallButton } from "./pwa-install-button";

const PREPARATION_CREDIT_LIMIT = 10;
const SAVE_CREDIT_LIMIT = 5;
const DOWNLOAD_CREDIT_LIMIT = 5;

export function Dashboard({ isProfileView }: { isProfileView?: boolean }) {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const isMobile = useIsMobile();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  // Effect to check for plan expiration
  useEffect(() => {
    if (userProfile && userProfile.plan === 'Premium' && userProfile.planExpiresAt) {
      const expirationDate = userProfile.planExpiresAt.toDate(); // Convert Firestore Timestamp to Date
      if (isPast(expirationDate)) {
        // Plan has expired, revert to Free
        if(userProfileRef){
          updateDocumentNonBlocking(userProfileRef, {
            plan: 'Free',
            planExpiresAt: null // Clear the expiration date
          });
        }
      }
    }
  }, [userProfile, userProfileRef]);
  
  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading || !user || !userProfile) {
    return (
        <div className="w-full max-w-4xl space-y-8">
        <Skeleton className="h-10 w-1/2" />
        <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><Skeleton className="h-10 w-1/2" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><Skeleton className="h-10 w-12" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><Skeleton className="h-10 w-12" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><Skeleton className="h-10 w-12" /></CardContent></Card>
        </div>
        </div>
    )
  }
  
  const isFreeUser = userProfile.plan === "Free";
  
  const preparationsUsed = userProfile.preparationCreditsUsed || 0;
  const savesUsed = userProfile.savedRemediesCreditsUsed || 0;
  const downloadsUsed = userProfile.socialPostDownloadCreditsUsed || 0;
  const planExpiresAt = userProfile.planExpiresAt?.toDate();

  return (
    <div className="w-full max-w-4xl">
        <div className="mb-8">
        <h1 className="text-3xl font-headline font-bold">Welcome, {user.displayName || 'User'}!</h1>
        <p className="text-muted-foreground">{isProfileView ? "Manage your account and subscription." : "Here's a summary of your account."}</p>
        </div>

        {isProfileView && (
           <Card className="flex flex-col mb-8 border-2 border-primary/50 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription Plan</CardTitle>
              <Gem className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex-grow">
              <div className="text-2xl font-bold">{userProfile.plan}</div>
              
              {isFreeUser ? (
                  <p className="text-xs text-muted-foreground">Your current plan</p>
              ) : (
                  planExpiresAt && (
                      <p className="text-xs text-muted-foreground">
                          Renews in {formatDistanceToNow(planExpiresAt)}
                      </p>
                  )
              )}
              </CardContent>
              {isFreeUser && (
              <CardFooter className="pt-0">
                  <Button size="sm" variant="link" className="px-0 -mb-2 h-auto whitespace-normal text-center" asChild>
                  <Link href="/pricing">Upgrade to Premium</Link>
                  </Button>
              </CardFooter>
              )}
          </Card>
        )}

        {!isProfileView && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription Plan</CardTitle>
              <Gem className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex-grow">
              <div className="text-2xl font-bold">{userProfile.plan}</div>
              
              {isFreeUser ? (
                  <p className="text-xs text-muted-foreground">Your current plan</p>
              ) : (
                  planExpiresAt && (
                      <p className="text-xs text-muted-foreground">
                          Renews in {formatDistanceToNow(planExpiresAt)}
                      </p>
                  )
              )}
              </CardContent>
              {isFreeUser && (
              <CardFooter className="pt-0">
                  <Button size="sm" variant="link" className="px-0 -mb-2 h-auto whitespace-normal text-center" asChild>
                  <Link href="/pricing">Upgrade to Premium</Link>
                  </Button>
              </CardFooter>
              )}
          </Card>
          <Link href="/#savedRemedies" className="block">
              <Card className="hover:bg-secondary/50 transition-colors flex flex-col h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saved Remedies</CardTitle>
                  <BookHeart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex-grow">
                  <div className="text-2xl font-bold">{savesUsed}</div>
                  {isFreeUser ? (
                      <>
                          <p className="text-xs text-muted-foreground">
                              {savesUsed}/{SAVE_CREDIT_LIMIT} credits used
                          </p>
                          <Progress value={(savesUsed / SAVE_CREDIT_LIMIT) * 100} className="w-full mt-2 h-2" />
                      </>
                  ) : (
                      <p className="text-xs text-muted-foreground">
                          Total remedies saved
                      </p>
                  )}
              </CardContent>
              </Card>
          </Link>

          <Card className="flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preparation Credits</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex-grow">
              <div className="text-2xl font-bold">{preparationsUsed}</div>
              {isFreeUser ? (
                  <>
                  <p className="text-xs text-muted-foreground">
                      {preparationsUsed}/{PREPARATION_CREDIT_LIMIT} credits used
                  </p>
                      <Progress value={(preparationsUsed / PREPARATION_CREDIT_LIMIT) * 100} className="w-full mt-2 h-2" />
                  </>
              ) : (
                  <p className="text-xs text-muted-foreground">
                      Total preparations generated
                  </p>
              )}
              </CardContent>
          </Card>
          
          <Card className="flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Social Post Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex-grow">
                  <div className="text-2xl font-bold">{downloadsUsed}</div>
                  {isFreeUser ? (
                  <>
                      <p className="text-xs text-muted-foreground">
                      {downloadsUsed}/{DOWNLOAD_CREDIT_LIMIT} credits used
                      </p>
                      <Progress value={(downloadsUsed / DOWNLOAD_CREDIT_LIMIT) * 100} className="w-full mt-2 h-2" />
                  </>
                  ) : (
                      <p className="text-xs text-muted-foreground">
                          Total posts downloaded
                      </p>
                  )}
              </CardContent>
          </Card>
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
            {!isProfileView && (
              <Button size="lg" asChild>
                  <Link href="/">Find a New Remedy</Link>
              </Button>
            )}
            <Button size="lg" variant="outline" asChild>
                <Link href="/billing"><CreditCard />Manage Billing</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
                <Link href="/pricing"><DollarSign />View Pricing</Link>
            </Button>
            {isMobile && isProfileView && (
                <PwaInstallButton size="lg">
                    <Download />
                    Download App
                </PwaInstallButton>
            )}
            {!isMobile && !isProfileView && (
                 <PwaInstallButton size="lg">
                    <Download />
                    Download App
                </PwaInstallButton>
            )}
        </div>

    </div>
  );
}
