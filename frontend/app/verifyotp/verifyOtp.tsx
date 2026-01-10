'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { axiosInstance } from '@/lib/axiosInstance';
import axios from 'axios';
import { toast } from 'sonner';

export default function VerifyOtpClient() {
  const router = useRouter();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(
    null
  );

  useEffect(() => {
    const token = localStorage.getItem('verificationToken');

    if (!token) {
      toast.error('Session expired. Please register again.');
      router.replace('/signup');
      return;
    }

    setVerificationToken(token);
  }, [router]);

  const verifyOtp = async () => {
    if (!verificationToken) return;

    if (otp.length !== 6) {
      toast.warning('Please enter the 6-digit OTP');
      return;
    }

    try {
      setLoading(true);

      await axiosInstance.post(
        '/auth/verifyOtp',
        { otp },
        {
          headers: {
            Authorization: `Bearer ${verificationToken}`,
          },
        }
      );

      toast.success('Email verified successfully');

      localStorage.removeItem('verificationToken');
      router.push('/login');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Invalid or expired OTP');
      } else {
        toast.error('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold">Verify OTP</h1>

        <input
          value={otp}
          onChange={e => setOtp(e.target.value)}
          maxLength={6}
          className="w-full border p-2 text-center text-lg tracking-widest"
          placeholder="Enter OTP"
        />

        <button
          onClick={verifyOtp}
          disabled={loading}
          className="w-full rounded bg-primary py-2 text-white"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </div>
    </div>
  );
}
