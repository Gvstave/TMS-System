'use client';

import { useAuth } from '@/context/auth-context';
import { Button } from './ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { LogOut, UserCircle } from 'lucide-react';

export function SidebarUserProfile() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-3">
        <UserCircle className="h-8 w-8 text-muted-foreground" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground truncate">
            {user.name}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {user.email}
          </span>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-8 w-8 shrink-0">
        <LogOut className="h-4 w-4" />
        <span className="sr-only">Log out</span>
      </Button>
    </div>
  );
}
