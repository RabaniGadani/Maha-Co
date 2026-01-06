'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { LogoutButton } from '@/components/auth/LogoutButton';

interface HeaderProps {
  showAuthButtons?: boolean;
  userEmail?: string | null;
}

export function Header({ showAuthButtons = true, userEmail }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-700 bg-slate-800 shadow-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span className="text-lg font-bold text-white">M</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Hamood LPG Co</span>
        </Link>

        {/* User is logged in - show user info and Sign Out */}
        {userEmail ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <span className="text-emerald-400 font-semibold text-sm">
                  {userEmail.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-slate-300 text-sm hidden sm:block">{userEmail}</span>
            </div>
            <LogoutButton className="bg-red-600 hover:bg-red-700 text-white border-0" />
          </div>
        ) : (
          /* User is not logged in - show Sign In button */
          showAuthButtons && (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-slate-700 hover:text-white border border-slate-600"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          )
        )}
      </div>
    </header>
  );
}
