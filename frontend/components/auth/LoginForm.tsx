'use client';

import { ArrowRight, Eye, EyeOff, LockKeyholeOpen } from 'lucide-react';
import { useState } from 'react';
import GoogleButton from './GoogleButton';
import Link from 'next/link';
import { axiosInstance } from '@/lib/axiosInstance';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

export function LoginRight() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [openForgotModal, setOpenForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const router = useRouter();

  // LOGIN
  const handleLogin = async () => {
    setLoading(true);

    try {
      const res = await axiosInstance.post('/auth/login', {
        email,
        password,
      });

      const role = res.data.role;
      const target = role === 'admin' ? '/admin' : '/home';

      console.log('target route:', target);

      router.prefetch(target);
      console.log('prefetch success');

      window.location.href = target;

      console.log('after navigating');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message ?? 'Login failed');
      } else {
        toast.error('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // FORGOT PASSWORD
  const handleForgotPassword = async () => {
    try {
      await axiosInstance.post('/auth/forgot-password', {
        email: forgotEmail,
      });

      toast.success('Reset link sent if email exists');

      setOpenForgotModal(false);
      setForgotEmail('');
    } catch {
      toast.error('Failed to send reset link');
    }
  };

  return (
    <>
      <div className="w-full lg:w-1/2 bg-background flex flex-col min-h-screen">
        <div className="flex flex-1 items-center justify-center px-4 sm:px-8 md:px-16">
          <div className="w-full max-w-md space-y-6 py-10">
            <div>
              <h2 className="text-3xl sm:text-5xl font-sans pb-4">
                Welcome <span className="text-primary">Back!</span>
              </h2>
              <p className="text-muted-foreground font-sans text-xl">Log in</p>
            </div>

            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-11 px-4 rounded-md border border-input"
              />

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

              <button
                onClick={() => setOpenForgotModal(true)}
                className="text-sm text-primary hover:underline text-right w-full cursor-pointer"
              >
                {'Forgot password'}
              </button>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm text-muted-foreground">Or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <GoogleButton />

            <p className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline">
                Signup
              </Link>
            </p>
          </div>
        </div>
      </div>

      {openForgotModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 transition-opacity duration-300"
          onClick={e =>
            e.target === e.currentTarget && setOpenForgotModal(false)
          }
        >
          <div className="bg-background p-1 rounded-[2rem] shadow-2xl w-full max-w-sm transform transition-all animate-in fade-in zoom-in duration-200">
            <div className="bg-background rounded-[1.9rem] p-8 space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-2xl mb-4 rotate-3 hover:rotate-0 transition-transform duration-300">
                  <LockKeyholeOpen size={35} className="text-primary" />
                </div>
                <h3 className="text-2xl font-sans text-foreground tracking-tight">
                  {'Lost your way?'}
                </h3>
                <p className="text-foreground/60 text-sm mt-2 leading-relaxed">
                  Tell us your email and reset your Password.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] uppercase tracking-widest font-bold text-primary ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter Your Email.."
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  className="w-full h-14 px-5 rounded-2xl border-2 border-foreground/20 bg-background/30 focus:bg-background focus:border-primary/40 outline-none mt-2 transition-all duration-200 placeholder:text-foreground/30"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleForgotPassword}
                  className="w-full h-14 bg-favor hover:bg-havorBg text-background cursor-pointer font-semibold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Send Reset Link</span>
                  <ArrowRight />
                </button>

                <button
                  onClick={() => setOpenForgotModal(false)}
                  className="w-full py-2 text-sm font-semibold text-foreground/60 hover:text-primary transition-colors"
                >
                  Nevermind, I remembered!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
