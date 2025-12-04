
'use client';

import { useState, useEffect } from 'react';
import { Button, ButtonProps } from './ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaInstallButtonProps extends ButtonProps {
  children?: React.ReactNode;
}


export function PwaInstallButton({ children, ...props }: PwaInstallButtonProps) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // This will only run on the client, after the component has mounted.
    setIsClient(true);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      toast({
        title: 'Installation Successful!',
        description: 'Herbbify has been added to your home screen.',
      });
    }

    setInstallPrompt(null);
  };
  
  // Only render the button on the client side and if there's an install prompt
  if (!isClient || !installPrompt) {
    return null;
  }

  if (children) {
    return (
        <Button
            onClick={handleInstallClick}
            {...props}
        >
            {children}
        </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleInstallClick}
      aria-label="Install Herbbify App"
      className="h-10 w-10"
      {...props}
    >
      <Download className="h-5 w-5" />
    </Button>
  );
}
