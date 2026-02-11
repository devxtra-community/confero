'use client';

import { useState } from 'react';
import { axiosInstance } from '@/lib/axiosInstance';
import { toast } from 'sonner';
import axios from 'axios';
import Image from 'next/image';
import { LockKeyhole, ArrowRight } from 'lucide-react';
import PasswordInput from './PasswordInput';
import PasswordStrength from './PasswordStrength';
import { useRouter } from 'next/navigation';

interface Props {
  token: string;
}

export default function ResetPasswordForm({ token }: Props) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const strength =
    password.length === 0
      ? 0
      : password.length < 6
        ? 1
        : password.length < 10
          ? 2
          : 3;

  const handleReset = async () => {
    if (!password) return toast.error('Please enter a password');

    setIsLoading(true);

    try {
      await axiosInstance.post('/auth/reset-password', {
        token,
        newPassword: password,
      });

      toast.success('Security updated! Your password is now fresh.');
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data?.message ??
            'something wrong with password reseting'
        );
      } else {
        toast.error('something wrong with password reseting');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-r from-primary/70 to-foreground/10 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid md:grid-cols-2 bg-background rounded-[2.5rem] border border-slate-100 overflow-hidden">
        {/* LEFT */}
        <div className="p-8 md:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <div className="w-12 h-12 bg-primary/80 rounded-2xl flex items-center justify-center mb-6">
              <LockKeyhole className="text-background w-6 h-6" />
            </div>

            <h1 className="text-4xl font-bold text-foreground tracking-tight mb-3">
              Secure your <br /> account.
            </h1>

            <p className="text-slate-500 text-lg">
              Enter a strong password to finish the recovery.
            </p>
          </div>

          <div className="space-y-6">
            <PasswordInput password={password} setPassword={setPassword} />

            <PasswordStrength strength={strength} />

            <button
              onClick={handleReset}
              disabled={isLoading}
              className="w-full h-14 bg-primary hover:bg-hoverMain text-background font-bold rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="hidden md:flex bg-favor relative overflow-hidden items-center justify-center p-12">
          <Image src="/auth/password.jpg" fill alt="image" />
        </div>
      </div>
    </div>
  );
}
