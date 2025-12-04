
'use client';

import Link from 'next/link';
import Image from 'next/image';

export function AppFooter() {
  return (
    <footer className="w-full bg-card border-t mt-auto hidden md:flex">
      <div className="max-w-4xl w-full mx-auto p-4 md:px-8 flex flex-col md:flex-row justify-center md:justify-between items-center text-center gap-4">
        <div className="flex items-center gap-2">
          <Image src="/logo (3).png" alt="Herbbify logo" width={24} height={24} className="h-6 w-6" />
          <p className="text-sm font-semibold text-primary">Herbbify</p>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/about" className="hover:text-primary transition-colors">About</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
        </div>
        <div className="text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Herbbify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
