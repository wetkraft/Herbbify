
"use client";

import { useState, useEffect, Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { SymptomChecker } from "@/components/symptom-checker";
import { SavedRemediesList } from "@/components/saved-remedies-list";
import { RecommendationDisplay } from "@/components/recommendation-display";
import { HerbalRecommendationFromSymptomsOutput } from "@/ai/flows/herbal-recommendation-from-symptoms";
import { useRouter } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/firebase";
import { Dashboard } from "@/components/dashboard";
import { MobileNavBar } from "@/components/mobile-nav-bar";

type View = "symptoms" | "savedRemedies" | "recommendations" | "dashboard" | "profile";


function HomePageContent({ onNavigate }: { onNavigate: (view: View) => void }) {
  const [activeView, setActiveView] = useState<View>("symptoms");
  const [recommendationData, setRecommendationData] = useState<HerbalRecommendationFromSymptomsOutput & {symptoms: string} | null>(null);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    // This allows linking directly to the saved remedies list, e.g. /#savedRemedies
    const hash = window.location.hash.substring(1);
    if (hash === 'savedRemedies' || hash === 'dashboard' || hash === 'profile') {
      setActiveView(hash);
    }
  }, []);

  const handleNavigation = (view: View) => {
    if (!user && (view === 'savedRemedies' || view === 'dashboard' || view === 'profile')) {
      router.push('/login');
      return;
    }
    setActiveView(view);
    window.history.pushState(null, '', view === 'symptoms' ? '/' : `/#${view}`);
    onNavigate(view);
  }

  const handleRecommendationReady = (data: HerbalRecommendationFromSymptomsOutput & {symptoms: string}) => {
    setRecommendationData(data);
    handleNavigation('recommendations');
  };

  const renderContent = () => {
    switch (activeView) {
      case "savedRemedies":
        return <SavedRemediesList />;
      case "dashboard":
        return <Dashboard />;
      case "profile":
        return <Dashboard isProfileView={true} />;
      case "recommendations":
        return recommendationData ? (
          <RecommendationDisplay
            recommendations={recommendationData.recommendations}
            warnings={recommendationData.warnings}
            submittedSymptoms={recommendationData.symptoms}
            onBack={() => handleNavigation('symptoms')}
          />
        ) : null;
      case "symptoms":
      default:
        return (
            <SymptomChecker onRecommendationReady={handleRecommendationReady} />
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="w-full p-4 md:p-8 md:px-12">
        <AppHeader onShowSavedForLater={() => handleNavigation('savedRemedies')} onShowSymptoms={() => handleNavigation('symptoms')} />
      </div>
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 pt-0">
        <div id="mainContent" className="w-full max-w-4xl">
          {renderContent()}
        </div>
      </main>
      <MobileNavBar 
        onNavigate={handleNavigation}
        activeView={activeView}
      />
      <section className="w-full max-w-4xl mx-auto p-4 md:p-8 text-sm text-muted-foreground" hidden>
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Your Guide to Natural Wellness</h2>
          <p>
            Welcome to Herbbify, your personal AI herbalist. We're dedicated to helping you explore the world of natural wellness and herbal remedies. Whether you're dealing with a common cold, a persistent headache, or looking for ways to manage anxiety, our platform provides instant, personalized recommendations. Our goal is to make the wisdom of traditional medicine accessible through modern technology, offering a free guide to natural health.
          </p>
          <h3 className="text-md font-bold text-foreground">Discover Remedies for Common Ailments</h3>
          <p>
            Are you suffering from a nagging <strong className="text-foreground">cough remedy</strong>? Or perhaps seeking natural <strong className="text-foreground">headache relief</strong>? Herbbify's symptom checker is designed to help. Just describe what you're feeling, and our AI will analyze your input to suggest herbs and fruits that could provide relief. We cover a wide range of issues, including <strong className="text-foreground">digestive health</strong> problems like <strong className="text-foreground">bloating</strong> and <strong className="text-foreground">upset stomach</strong>, as well as providing suggestions for <strong className="text-foreground">anxiety relief</strong> and natural <strong className="text-foreground">sleep aids</strong>.
          </p>
          <h3 className="text-md font-bold text-foreground">Harnessing the Power of Plant-Based Healing</h3>
          <p>
            Our recommendations are rooted in the principles of <strong className="text-foreground">herbal medicine</strong> and <strong className="text-foreground">traditional medicine</strong>. We focus on <strong className="text-foreground">plant-based remedies</strong> that can support your body's natural healing processes. From boosting your <strong className="text-foreground">immune support</strong> to easing <strong className="text-foreground">joint pain</strong>, the right herbs can make a world of difference. Herbbify is your partner in discovering a more <strong className="text-foreground">holistic health</strong> approach.
          </p>
          <p>
            As a <strong className="text-foreground">free health AI</strong>, we believe everyone should have access to information about <strong className="text-foreground">natural healing</strong>. Our <strong className="text-foreground">AI herbalist</strong> is constantly learning, providing you with the best possible <strong className="text-foreground">health recommendations</strong> based on your unique symptoms. Start your journey to <strong className="text-foreground">natural wellness</strong> today.
          </p>
          <p className="text-xs italic mt-4">
            Disclaimer: The information provided by Herbbify is for educational purposes only and is not a substitute for professional medical advice. Always consult with a a healthcare provider for any health concerns.
          </p>
        </div>
      </section>
    </div>
  );
}

function PageSkeleton() {
    return (
        <div className="flex flex-col flex-1 w-full">
            <div className="w-full p-4 md:p-8 md:px-12">
                <div className="flex justify-between items-center">
                    <div className="flex items-center justify-center gap-3">
                        <Skeleton className="h-12 w-12" />
                        <div className="text-left">
                            <Skeleton className="h-10 w-48" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </div>
            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 pt-0">
                <div className="w-full max-w-4xl">
                    <Skeleton className="h-64 w-full" />
                </div>
            </main>
        </div>
    );
}

export default function Home() {
  const [activeView, setActiveView] = useState<View>('symptoms');
  
  return (
    <div className="flex-1 flex flex-col">
      <Suspense fallback={<PageSkeleton />}>
        <HomePageContent onNavigate={setActiveView} />
      </Suspense>
    </div>
  );
}
