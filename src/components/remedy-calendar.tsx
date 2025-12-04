
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, CheckCircle } from 'lucide-react';

type DailyPlan = {
  day: number;
  recommendation: string;
  tip: string;
};

type RemedyCalendarProps = {
  calendarData: DailyPlan[];
  remedyTitle: string;
};

export function RemedyCalendar({ calendarData, remedyTitle }: RemedyCalendarProps) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          30-Day Wellness Plan for {remedyTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72 w-full">
          <div className="space-y-4 pr-4">
            {calendarData.map((dayPlan) => (
              <div key={dayPlan.day} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    {dayPlan.day}
                  </div>
                  <div className="h-full w-px bg-border my-1"></div>
                </div>
                <div className="pb-4 flex-1">
                  <p className="font-semibold">{dayPlan.recommendation}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-semibold">Tip:</span> {dayPlan.tip}
                  </p>
                </div>
              </div>
            ))}
             <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                </div>
                <div className="pt-1">
                    <p className="font-bold text-lg">Plan Complete!</p>
                    <p className="text-muted-foreground">You've completed your 30-day wellness journey.</p>
                </div>
             </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
