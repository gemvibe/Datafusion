'use client'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // AUTH DISABLED FOR TESTING - Remove this to re-enable authentication
  return <>{children}</>
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  // AUTH DISABLED FOR TESTING - Remove this to re-enable admin checks
  return <>{children}</>
}

