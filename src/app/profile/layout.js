'use client';

import { AuthProvider } from '@/components/AuthProvider';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardNav from '@/components/DashboardNav';

export default function ProfileLayout({ children }) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
          <DashboardNav />
          <main>{children}</main>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}
