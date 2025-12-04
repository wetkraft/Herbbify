"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Leaf, Trash2 } from "lucide-react";

type SavedForLaterListProps = {
  savedItems: string[];
  toggleSaveForLater: (herb: string) => void;
};

export function SavedForLaterList({
  savedItems,
  toggleSaveForLater,
}: SavedForLaterListProps) {
  if (savedItems.length === 0) {
    return (
      <Card className="shadow-lg text-center">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            Saved for Later
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            You haven&apos;t saved any items yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Click the heart icon next to a recommendation to save it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Your Saved Items
        </CardTitle>
        <p className="text-muted-foreground">
            A collection of your saved remedies for quick access.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {savedItems.map((herb) => (
            <div
              key={herb}
              className="flex items-center justify-between rounded-lg border p-3 bg-card"
            >
              <div className="flex items-center gap-3">
                <Leaf className="h-5 w-5 text-accent" />
                <span className="font-semibold">{herb}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => toggleSaveForLater(herb)}
                aria-label={`Remove ${herb} from saved items`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
