'use client';

import { axiosInstance } from '@/lib/axiosInstance';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { ArrowRight, MonitorX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { posthog } from '@/lib/posthog';
import { useState } from 'react';
import { toast } from 'sonner';

export default function GoogleButton() {
  const [showAlreadyLoggedInModal, setShowAlreadyLoggedInModal] =
    useState(false);
  const [blockedUserId, setBlockedUserId] = useState<string | null>(null);
  const [forceLoading, setForceLoading] = useState(false);
  const [pendingIdToken, setPendingIdToken] = useState<string | null>(null);
  const router = useRouter();

  const handleForceLogout = async () => {
    if (!blockedUserId || !pendingIdToken) return;

    setForceLoading(true);

    try {
      await axiosInstance.post('/auth/logout', { forceUserId: blockedUserId });

      const res = await axiosInstance.post('/auth/google', {
        idToken: pendingIdToken,
      });

      const role = res.data.role;
      const target = role === 'admin' ? '/admin' : '/home';

      setShowAlreadyLoggedInModal(false);
      setBlockedUserId(null);
      setPendingIdToken(null);

      router.replace(target);
      router.refresh();
    } catch {
      toast.error('Failed to log out other device. Please try again.');
    } finally {
      setForceLoading(false);
    }
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={async credentialResponse => {
          const idToken = credentialResponse.credential;

          if (!idToken) {
            console.error('No ID token from Google');
            return;
          }

          try {
            const res = await axiosInstance.post('/auth/google', {
              idToken,
            });

            const role = res.data.role;
            console.log(role);
            const target = role === 'admin' ? '/admin' : '/home';
            posthog.identify(res.data.userId, {
              role,
            });
            posthog.capture('login_completed', { method: 'google' });
            console.log('navigating navigating');
            router.replace(target);
            router.refresh();

            console.log('after navigating');
          } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
              if (
                err.response?.status === 409 &&
                err.response?.data?.code === 'ALREADY_LOGGED_IN'
              ) {
                setBlockedUserId(err.response.data.userId);
                setPendingIdToken(idToken); // store token
                setShowAlreadyLoggedInModal(true);
              } else {
                toast.error(err.response?.data?.message ?? 'Login failed');
              }
            } else {
              toast.error('Login failed');
            }
          }
        }}
        onError={() => {
          console.error('Google Login Failed');
        }}
        useOneTap={false}
      />

      {showAlreadyLoggedInModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
          onClick={e =>
            e.target === e.currentTarget && setShowAlreadyLoggedInModal(false)
          }
        >
          <div className="bg-background p-1 rounded-[2rem] shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <div className="bg-background rounded-[1.9rem] p-8 space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 rounded-2xl mb-4">
                  <MonitorX size={32} className="text-amber-500" />
                </div>
                <h3 className="text-2xl font-sans text-foreground tracking-tight">
                  Already Logged In
                </h3>
                <p className="text-foreground/60 text-sm mt-2 leading-relaxed">
                  Your account is active on another device or tab. Only one
                  session is allowed at a time.
                </p>
                <p className="text-foreground/40 text-xs mt-2">
                  Click below to log out the other device and continue here.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleForceLogout}
                  disabled={forceLoading}
                  className="w-full h-14 bg-primary hover:opacity-90 text-primary-foreground cursor-pointer font-semibold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>
                    {forceLoading ? 'Logging out...' : 'Log Out Other Device'}
                  </span>
                  {!forceLoading && <ArrowRight size={18} />}
                </button>

                <button
                  onClick={() => {
                    setShowAlreadyLoggedInModal(false);
                    setBlockedUserId(null);
                    setPendingIdToken(null);
                  }}
                  className="w-full py-2 text-sm font-semibold text-foreground/60 hover:text-primary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
