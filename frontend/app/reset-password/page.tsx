'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { axiosInstance } from '@/lib/axiosInstance';
import { toast } from 'sonner';
import { LockKeyhole, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic strength check
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
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message ?? 'Login failed');
      } else {
        toast.error('Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-r from-primary/70 to-foreground/10 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid md:grid-cols-2 bg-background rounded-[2.5rem] border border-slate-100 _32px_64px_-12px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="p-8 md:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <div className="w-12 h-12 bg-primary/80 rounded-2xl flex items-center justify-center mb-6  een-200">
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
            <div className="relative">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2 block ml-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-11 px-4 rounded-md border border-input"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-3 right-3 text-primary"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              <div className="mt-3 flex gap-1.5 px-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      i < strength ? 'bg-favor' : 'bg-slate-100'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-2 ml-1">
                {strength === 1 && 'Too short...'}
                {strength === 2 && 'Getting better...'}
                {strength === 3 && "That's a strong one!"}
              </p>
            </div>

            <button
              onClick={handleReset}
              disabled={isLoading}
              className="w-full h-14 bg-primary hover:bg-hoverMain text-background font-bold rounded-2xl  transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="hidden md:flex bg-favor relative overflow-hidden items-center justify-center p-12">
          <Image src="/auth/password.jpg" fill alt="image" />
        </div>
      </div>
    </div>
  );
}
