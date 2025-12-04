
"use client";

import { AppHeader } from "@/components/app-header";
import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/dashboard";


export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="w-full p-4 md:p-8 md:px-12">
        <AppHeader onShowSavedForLater={() => router.push('/#savedRemedies')} onShowSymptoms={() => router.push('/')} />
      </div>
      <main className="flex-1 flex flex-col items-center p-4 md:p-8 pt-0">
        <Dashboard />
      </main>
    </div>
  );
}
