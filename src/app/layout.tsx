
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AppFooter } from '@/components/app-footer';
import { FirebaseClientProvider } from '@/firebase';
import { ErrorProvider } from '@/components/error-provider';
import { LottiePlayer } from '@/components/lottie-player';


export const metadata: Metadata = {
  title: 'Herbbify - Free AI Herbal Remedy Recommendations',
  description: 'Get free, personalized herbal remedy recommendations for your health and wellness needs. Describe your symptoms—like a cough, headache, bloating, anxiety, or trouble sleeping—and our AI herbalist will suggest natural herbs and fruits to help you on your wellness journey. Your free guide to natural health.',
  keywords: [
    'herbal remedies',
    'natural wellness',
    'AI herbalist',
    'health recommendations',
    'symptom checker',
    'herbal medicine',
    'natural healing',
    'free health AI',
    'cough remedy',
    'headache relief',
    'digestive health',
    'anxiety relief',
    'sleep aid',
    'bloating remedy',
    'upset stomach',
    'joint pain',
    'immune support',
    'traditional medicine',
    'plant-based remedies',
    'holistic health',
    'infectious-diseases',
    'chronic-illness',
    'autoimmune-disorders',
    'inflammatory-conditions',
    'metabolic-disorders',
    'neurological-disorders',
    'respiratory-conditions',
    'cardiovascular-diseases',
    'digestive-disorders',
    'viral-infections',
    'bacterial-infections',
    'fungal-infections',
    'parasitic-infections',
    'common-cold',
    'influenza',
    'covid-19',
    'viral-fever',
    'viral-gastroenteritis',
    'hepatitis',
    'dengue',
    'chikungunya',
    'zika-virus',
    'measles',
    'mumps',
    'rubella',
    'shingles',
    'herpes-virus',
    'hpv',
    'strep-throat',
    'pneumonia',
    'tuberculosis',
    'urinary-tract-infection',
    'sinus-infection',
    'cellulitis',
    'lyme-disease',
    'food-poisoning',
    'bacterial-gastroenteritis',
    'asthma',
    'bronchitis',
    'chronic-obstructive-pulmonary-disease',
    'sinusitis',
    'seasonal-allergies',
    'respiratory-infections',
    'hypertension',
    'high-blood-pressure',
    'heart-disease',
    'arrhythmia',
    'coronary-artery-disease',
    'stroke',
    'high-cholesterol',
    'acid-reflux',
    'gastritis',
    'ibs',
    'ulcer',
    'constipation',
    'diarrhea',
    'indigestion',
    'bloating',
    'gallbladder-issues',
    'liver-conditions',
    'arthritis',
    'rheumatoid-arthritis',
    'lupus',
    'fibromyalgia',
    'psoriasis',
    'eczema',
    'crohns-disease',
    'ulcerative-colitis',
    'migraine',
    'headache',
    'anxiety',
    'stress',
    'depression',
    'insomnia',
    'neuropathy',
    'epilepsy',
    'diabetes',
    'hypothyroidism',
    'hyperthyroidism',
    'hormone-imbalance',
    'pcos',
    'obesity',
    'adrenal-fatigue',
    'fatigue',
    'nausea',
    'vomiting',
    'inflammation',
    'chronic-pain',
    'joint-pain',
    'muscle-pain',
    'cough',
    'fever',
    'chills',
    'dizziness',
    'skin-rash',
    'swelling'
  ],
  manifest: '/manifest.json',
  openGraph: {
    title: 'Herbbify - Free AI Herbal Remedy Recommendations',
    description: 'Your personal AI guide to natural wellness. Get instant recommendations for herbs and fruits based on your symptoms.',
    type: 'website',
    url: 'https://herbbify.app', 
    images: [
      {
        url: '/logo (3).png', 
        width: 1200,
        height: 630,
        alt: 'Herbbify Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Herbbify - Free AI Herbal Remedy Recommendations',
    description: 'Get free, personalized herbal remedy recommendations for your health and wellness needs.',
    images: ['/logo (3).png'], 
  },
   icons: {
    icon: '/logo (3).png',
    apple: '/logo (3).png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5375753322856186"
     crossOrigin="anonymous"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Herbbify" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#E9F5E8" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen bg-background">
        <ErrorProvider>
          <FirebaseClientProvider>
            <LottiePlayer />
            <div className="relative z-10 flex-1 flex flex-col">
              {children}
              <AppFooter />
            </div>
            <Toaster />
          </FirebaseClientProvider>
        </ErrorProvider>
      </body>
    </html>
  );
}
