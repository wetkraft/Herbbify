'use client';

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Check, ChevronRight } from 'lucide-react';

type SecurityPuzzleProps = {
  onSolve: (solved: boolean) => void;
};

export function SecurityPuzzle({ onSolve }: SecurityPuzzleProps) {
  const [sliderValue, setSliderValue] = useState([0]);
  const [isSolved, setIsSolved] = useState(false);

  const handleSliderChange = (value: number[]) => {
    if (isSolved) return;
    setSliderValue(value);
    if (value[0] === 100) {
      setIsSolved(true);
      onSolve(true);
    }
  };
  
  const handleSliderCommit = (value: number[]) => {
    if (isSolved) return;
    if (value[0] < 100) {
      setSliderValue([0]);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border bg-secondary/50 p-4">
       {!isSolved && (
        <p className="text-sm font-medium text-muted-foreground">
          Slide to verify you are human
        </p>
       )}
      <div
        className={cn(
          "relative w-full h-10 flex items-center justify-center rounded-full overflow-hidden",
          "text-sm font-medium text-primary-foreground",
          isSolved ? "bg-primary" : "bg-background"
        )}
      >
        {isSolved && <span>Verified!</span>}
        <Slider
          value={sliderValue}
          onValueChange={handleSliderChange}
          onValueCommit={handleSliderCommit}
          max={100}
          step={1}
          disabled={isSolved}
          className={cn('w-full h-full absolute inset-0 z-20 transition-opacity', isSolved && "opacity-0" )}
          thumb={
            <div className={cn("h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground cursor-pointer transition-colors", isSolved && "bg-green-500")}>
              {isSolved ? <Check className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </div>
          }
        />
      </div>
    </div>
  );
}
