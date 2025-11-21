'use client';

import { useAuth } from '@/context/auth-context';
import { LecturerDashboard } from '@/components/dashboard/lecturer-dashboard';
import { StudentDashboard } from '@/components/dashboard/student-dashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  // The loading state is handled by loading.tsx and the layout handles the auth check.
  if (!user) {
    return null;
  }

  return (
    <>
      {user.role === 'lecturer' ? (
        <LecturerDashboard currentUser={user} />
      ) : (
        <StudentDashboard currentUser={user} />
      )}
    </>
  );
}
