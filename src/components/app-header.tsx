
"use client";

import Image from "next/image";
import { User, Heart, Home as HomeIcon, Info, ShieldAlert, LogOut, LogIn, Gem, LayoutDashboard, CreditCard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { useUser } from "@/firebase";
import { handleSignOut } from "@/firebase/auth/client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useError } from "./error-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import { PwaInstallButton } from "./pwa-install-button";

type AppHeaderProps = {
  onShowSavedForLater: () => void;
  onShowSymptoms: () => void;
};

export function AppHeader({ onShowSavedForLater, onShowSymptoms }: AppHeaderProps) {
  const { user } = useUser();
  const { showError } = useError();
  const isMobile = useIsMobile();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('');
  }

  return (
    <header className="flex justify-between items-center">
      <Link href="/" className="flex items-center justify-center gap-3">
        <Image src="/logo (3).png" alt="Herbbify logo" width={50} height={50} className="h-12 w-12" />
        <div className="text-left">
            <h1 className="text-lg sm:text-xl md:text-2xl font-headline font-bold text-primary">
              Herbbify
            </h1>
        </div>
      </Link>
      <div className="flex items-center gap-2">
      <PwaInstallButton />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
            {user ? (
              <Avatar>
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'}/>
                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
              </Avatar>
            ) : (
              <User className="h-5 w-5" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[15rem] p-2 text-base">
          {user ? (
            <>
              <DropdownMenuLabel>{user.displayName || 'User'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isMobile ? (
                <DropdownMenuItem onClick={() => handleSignOut(showError)}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem onClick={onShowSymptoms}>
                    <HomeIcon className="mr-2 h-4 w-4" />
                    <span>Home</span>
                  </DropdownMenuItem>
                  <Link href="/dashboard" passHref>
                    <DropdownMenuItem>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                  </Link>
                   <Link href="/pricing" passHref>
                    <DropdownMenuItem>
                      <Gem className="mr-2 h-4 w-4" />
                      <span>Pricing</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/billing" passHref>
                    <DropdownMenuItem>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Manage Billing</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleSignOut(showError)}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </>
              )}
            </>
          ) : (
            <>
               <Link href="/login" passHref>
                <DropdownMenuItem>
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Sign In</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/signup" passHref>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Sign Up</span>
                </DropdownMenuItem>
              </Link>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    </header>
  );
}
