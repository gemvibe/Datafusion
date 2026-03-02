'use client'

import { AdminRoute } from "@/lib/auth/ProtectedRoute";
import { useAuth } from "@/lib/auth/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { signOut, profile } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Navbar */}
        <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg border-b border-purple-700">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/admin" className="text-2xl font-bold text-white flex items-center">
                  <span className="mr-2">⚡</span>
                  Hope Link Admin
                </Link>
              </div>

              {/* Admin Nav */}
              <div className="hidden sm:flex sm:space-x-1">
                <Link
                  href="/admin"
                  className="px-3 py-2 text-sm font-medium text-white hover:bg-purple-700 rounded-md transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/map"
                  className="px-3 py-2 text-sm font-medium text-white hover:bg-purple-700 rounded-md transition-colors"
                >
                  Map
                </Link>
                <Link
                  href="/admin/users"
                  className="px-3 py-2 text-sm font-medium text-white hover:bg-purple-700 rounded-md transition-colors"
                >
                  Users
                </Link>
                <Link
                  href="/admin/centers"
                  className="px-3 py-2 text-sm font-medium text-white hover:bg-purple-700 rounded-md transition-colors"
                >
                  Centers
                </Link>
                <Link
                  href="/admin/incidents"
                  className="px-3 py-2 text-sm font-medium text-white hover:bg-purple-700 rounded-md transition-colors"
                >
                  Incidents
                </Link>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <div className="text-white text-sm">
                  <div className="font-semibold">{profile?.name}</div>
                  <div className="text-xs text-purple-200">Administrator</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-700 hover:bg-purple-800 rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </AdminRoute>
  );
}
