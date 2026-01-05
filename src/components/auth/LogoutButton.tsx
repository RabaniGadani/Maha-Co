'use client';

import { useState } from 'react';
import { logout } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      isLoading={isLoading}
      className={className}
    >
      Sign Out
    </Button>
  );
}
