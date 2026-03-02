"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Disasters", href: "/incidents" },
  { name: "Centers", href: "/centers" },
  { name: "Chatbot", href: "/chatbot" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            {/* Logo */}
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                First72 TN
              </Link>
            </div>

            {/* Primary Navigation */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {/* Disaster Report Button */}
            <Link
              href="/incidents/new"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              🌪️ Report Disaster
            </Link>

            {/* User Info & Menu */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-right">
                  <div className="font-medium text-gray-900">{profile?.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{profile?.role}</div>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {profile?.name?.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden px-4 pb-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "block px-3 py-2 text-base font-medium rounded-md transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
