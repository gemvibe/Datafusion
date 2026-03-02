'use client'

import { Navbar } from "@/components/shared/Navbar";
import { ProtectedRoute } from "@/lib/auth/ProtectedRoute";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect admin users to admin dashboard
    if (!loading && profile?.role === 'admin') {
      router.push('/admin');
    }
  }, [profile, loading, router]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F5F7FB] dark:bg-gray-900 transition-colors duration-200">
        <Navbar />
        <main className="px-6 py-6 dark:text-gray-100">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
