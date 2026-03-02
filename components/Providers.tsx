'use client'

import { AuthProvider } from "@/lib/auth/AuthContext"
import { ThemeProvider } from "@/lib/theme/ThemeProvider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}
