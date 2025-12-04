
'use client';
import { forwardRef } from 'react';
import Image from 'next/image';

type SocialPostCardProps = {
  symptoms: string | null;
  herbs: string[];
  description: string | null;
  imageUrl: string | null;
};

export const SocialPostCard = forwardRef<HTMLDivElement, SocialPostCardProps>(({ symptoms, herbs, description, imageUrl }, ref) => {
  
  const getCleanHerbName = (herb: string) => herb.replace(/\s\(.*\)/, '');
  const herbList = herbs.map(getCleanHerbName).join(' & ');

  return (
    <div 
      ref={ref} 
      className="w-[1080px] h-[1080px] bg-gray-100 text-gray-800 relative flex flex-col font-body" 
      style={{ fontFamily: 'Alegreya, serif' }}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={herbList}
          fill
          className="object-cover"
          crossOrigin="anonymous"
        />
      )}
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent"></div>

      <div className="relative z-10 flex flex-col h-full p-16">
        <div className="text-white space-y-4 max-w-4xl">
            {symptoms && (
                <p className="text-3xl text-gray-200">A natural remedy for {symptoms}</p>
            )}
            <h1 className="text-5xl font-bold leading-tight">
                {herbList}
            </h1>
            {description && (
                <p className="text-3xl text-gray-300 leading-relaxed">
                    {description}
                </p>
            )}
        </div>
        
        <div className="mt-auto ml-auto">
            <p className="text-3xl font-bold text-white/90">Herbbify</p>
        </div>
      </div>
    </div>
  );
});

SocialPostCard.displayName = 'SocialPostCard';
