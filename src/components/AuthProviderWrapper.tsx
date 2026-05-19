'use client';

import { AuthProvider } from '@/contexts/AuthContext';

export default function AuthProviderWrapper({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <AuthProvider>{children}</AuthProvider>;
}
