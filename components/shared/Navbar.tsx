"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTheme } from "@/lib/theme/ThemeProvider";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Incidents", href: "/incidents" },
  { name: "Centers", href: "/centers" },
  { name: "Map", href: "/map" },
  { name: "Chatbot", href: "/chatbot" },
  { name: "Profile", href: "/profile" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <nav className="bg-[#0B3D91] dark:bg-gray-800 text-white shadow-lg transition-colors duration-200">
      <div className="mx-auto px-8">
        <div className="flex h-[72px] justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="text-3xl font-bold">
              🤝 <span className="text-white">Hope Link</span>
            </div>
            <div className="text-xs text-blue-200 tracking-wider">
              CONNECTING HOPE & HELP
            </div>
          </div>

          {/* Center Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-4">
            {/* User Avatar */}
            {user && profile && (
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold ring-2 ring-white/30">
                  {profile.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-sm">
                  <div className="font-medium">{profile.name}</div>
                  <div className="text-xs text-blue-200 capitalize">{profile.role}</div>
                </div>
              </div>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden px-4 pb-3 space-y-1 border-t border-white/10 pt-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "block px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-white/20 text-white"
                  : "text-blue-100 hover:bg-white/10"
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
