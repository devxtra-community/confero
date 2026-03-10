'use client';

import { useEffect, Suspense } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from '@/components/ui/sonner';
import { initPostHog } from '@/lib/posthog';
import { PostHogPageView } from '@/components/PostHogPageView';

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      <Toaster richColors position="top-right" />
      {children}
    </GoogleOAuthProvider>
  );
}