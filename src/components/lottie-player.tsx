
'use client';

import Lottie from 'lottie-react';
import animationData from '@/lib/hanging-plant-lottie.json';

export function LottiePlayer() {
  return (
    <div className="fixed inset-0 z-[-1] opacity-20 dark:opacity-10 pointer-events-none">
      <Lottie
        animationData={animationData}
        loop={true}
        style={{ position: 'absolute', top: '-20%', left: 0, width: '100%', height: '100%' }}
      />
    </div>
  );
}
