
'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function LandingPage() {
  return (
    <section className="flex-1 flex items-center justify-center text-center p-4 md:p-6">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none font-headline">
          Task Management & Scheduling System
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          An AI-powered, minimal, and clean way to manage academic projects. Built for
          lecturers and students.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/signup" prefetch={false}>
              Get Started
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
            <Link href="/login" prefetch={false}>
              Sign In
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return <LandingPage />;
}
