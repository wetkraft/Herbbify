
'use client';

import { Home, BookHeart, LayoutDashboard, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

type MobileNavBarProps = {
  onNavigate: (view: 'symptoms' | 'savedRemedies' | 'dashboard' | 'profile') => void;
  activeView: string;
};

export function MobileNavBar({ onNavigate, activeView }: MobileNavBarProps) {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const navItems = [
    { label: 'Home', icon: Home, view: 'symptoms' },
    { label: 'Saved', icon: BookHeart, view: 'savedRemedies' },
    { label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' },
    { label: 'Profile', icon: User, view: 'profile' },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t z-50">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeView === item.view || (activeView === 'recommendations' && item.view === 'symptoms');
          
          return (
            <button key={item.label} onClick={() => onNavigate(item.view)} className="appearance-none bg-transparent border-none p-0 m-0 cursor-pointer">
               <div
                className={cn(
                  'flex flex-col items-center justify-center gap-1 w-20 h-full text-muted-foreground transition-colors',
                  isActive && 'text-primary'
                )}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs">{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
