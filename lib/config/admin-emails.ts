// List of authorized admin emails
// Only these emails can access the admin panel
export const ADMIN_EMAILS = [
  'sakthivelanss02@gmail.com',
  'admin@first72.in',
  // Add more admin emails here as needed
] as const;

// Helper function to check if an email is an admin
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase() as any);
}
