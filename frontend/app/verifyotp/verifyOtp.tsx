'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { axiosInstance } from '@/lib/axiosInstance';
import { toast } from 'sonner';
import axios from 'axios';

export default function VerifyOtpPage() {
  const router = useRouter();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [verificationToken, setVerificationToken] = useState<string | null>(
    null
  );
  const [resendTimer, setResendTimer] = useState(30);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('temp_token');

    if (!storedToken) {
      toast.error('Session expired. Please register again.');
      router.push('/signup');
      return;
    }
    setVerificationToken(storedToken);
  }, [router]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (resendTimer <= 0) return;

    const interval = setInterval(() => {
      setResendTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  async function verifyOtp() {
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

      toast.success('Email verified successfully!');
      localStorage.removeItem('temp_token');

      setTimeout(() => {
        router.push('/login');
      }, 1200);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Invalid or expired OTP');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    if (resendTimer > 0 || resending) return;

    if (!verificationToken) {
      toast.error('Verification session expired. Please register again.');
      router.push('/sign-up');
      return;
    }

    try {
      setResending(true);

      await axiosInstance.post(
        '/auth/resend',
        {},
        {
          headers: {
            Authorization: `Bearer ${verificationToken}`,
          },
        }
      );

      toast.success('OTP resent successfully');
      setResendTimer(30);
      setTimeLeft(180);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to resend OTP');
      } else {
        toast.error('Failed to resend OTP');
      }
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-dot-fade px-4">
      <div className="w-full max-w-md rounded-2xl border border-foreground-400/30 bg-white/20 p-8 text-center backdrop-blur-md">
        <h1 className="mb-3 text-3xl text-foreground font-sans">Verify OTP</h1>

        <p className="mb-8 text-md text-foreground ">
          Enter the 6-Digit code sent to your Email
        </p>

        <div className="mb-8 flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            inputMode="numeric"
          >
            <InputOTPGroup className="">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>

            <InputOTPSeparator />

            <InputOTPGroup className="">
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          onClick={verifyOtp}
          disabled={loading}
          className="w-full primarybg hoverBg rounded-lg py-2 font-semibold text-white"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </Button>
      </div>

      <div className="mt-6 text-center space-y-1">
        <p className=" text-sm">
          OTP validity:&nbsp;
          <span className=" font-sans">
            {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </p>

        <p className="text-sm">
          Didn’t receive the code?{' '}
          <span
            onClick={resendOtp}
            className={`font-semibold transition-colors ${
              resendTimer === 0
                ? 'cursor-pointer hover:underline'
                : 'cursor-not-allowed opacity-50'
            }`}
          >
            Resend {resendTimer > 0 && `${resendTimer}s`}
          </span>
        </p>
      </div>
    </div>
  );
}
