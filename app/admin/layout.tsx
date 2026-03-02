'use client'

import { AdminRoute } from "@/lib/auth/ProtectedRoute";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTheme } from "@/lib/theme/ThemeProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { signOut, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Admin Navbar */}
        <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-800 dark:to-indigo-800 shadow-lg border-b border-purple-700 dark:border-purple-900 transition-colors duration-200">
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
                
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 hover:bg-purple-700 rounded-lg transition-colors"
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
                
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
