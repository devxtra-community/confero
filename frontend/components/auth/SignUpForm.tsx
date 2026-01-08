'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff } from 'lucide-react';
import GoogleButton from './GoogleButton';
import { Button } from '../ui/button';
import { axiosInstance } from '@/lib/axiosInstance';
import Link from 'next/link';
import axios from 'axios';

export function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.post('/auth/register', {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });
      console.log(res);

      const temp_token = res.data.verificationToken;

      localStorage.setItem('temp_token', temp_token);
      router.push('/verifyotp');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message || 'Signup failed. Please try again.'
        );
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="text-lg text-primary font-sans hover:text-foreground cursor-pointer"
        >
          ← Go back
        </Link>
      </div>

      <h1 className="text-4xl font-sans">Sign Up</h1>

      <div className="space-y-2">
        <label className="text-sm font-medium">Full Name</label>
        <Input
          name="fullName"
          placeholder="Enter your first name"
          required
          className="mt-1"
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Email address</label>
        <Input
          type="email"
          name="email"
          placeholder="Enter your email"
          required
          className="mt-1"
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2 relative">
        <label className="text-sm font-medium">Password</label>
        <Input
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Password"
          required
          className="mt-1"
          minLength={6}
          onChange={handleChange}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute  top-9 right-3 text-primary cursor-pointer "
        >
          {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>

      <div className="space-y-2 relative">
        <label className="text-sm font-medium">Confirm Password</label>
        <Input
          type={showPassword ? 'text' : 'password'}
          name="confirmPassword"
          placeholder="Confirm password"
          required
          className="mt-1"
          minLength={6}
          onChange={handleChange}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute  top-9 right-3 text-primary cursor-pointer "
        >
          {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 cursor-pointer"
        disabled={loading}
      >
        {loading ? 'Signing up...' : 'Signup'}
      </Button>

      <Separator />

      <GoogleButton />
    </form>
  );
}
