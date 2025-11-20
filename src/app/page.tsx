// This file is replaced by `src/app/(public)/page.tsx`
// and this root page will now handle the main layout determination.

'use client';

import PublicLayout from './(public)/layout';
import AppLayout from './(app)/layout';
import LoginPage from './(auth)/login/page';
import SignupPage from './(auth)/signup/page';
import PublicPage from './(public)/page';
import DashboardPage from './(app)/dashboard/page';
import { usePathname } from 'next/navigation';

export default function Page() {
  const pathname = usePathname();

  if (pathname === '/') {
    return <PublicLayout><PublicPage/></PublicLayout>;
  }
  
  if (pathname.startsWith('/dashboard')) {
      return <AppLayout><DashboardPage/></AppLayout>;
  }

  if (pathname === '/login') {
    return <LoginPage/>
  }

  if (pathname === '/signup') {
    return <SignupPage/>
  }

  return null;
}
