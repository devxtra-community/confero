'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FcGoogle } from 'react-icons/fc';

export function SignUpForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password: form.password,
          }),
          credentials: 'include',
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Signup failed');
      }

      router.push('/signin');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Go back
        </button>
      </div>

      <h1 className="text-3xl font-sans">Sign Up</h1>

      {/* First Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium">First Name</label>
        <Input
          name="firstName"
          placeholder="Enter your first name"
          required
          onChange={handleChange}
        />
      </div>

      {/* Last Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Last Name</label>
        <Input
          name="lastName"
          placeholder="Enter your last name"
          onChange={handleChange}
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Email address</label>
        <Input
          type="email"
          name="email"
          placeholder="Enter your email"
          required
          onChange={handleChange}
        />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>
        <Input
          type="password"
          name="password"
          placeholder="Password"
          required
          minLength={6}
          onChange={handleChange}
        />
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Confirm Password</label>
        <Input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          required
          minLength={6}
          onChange={handleChange}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Submit */}
      <Button
        type="submit"
        className="w-full bg-green-700 hover:bg-green-800"
        disabled={loading}
      >
        {loading ? 'Signing up...' : 'Signup'}
      </Button>

      <Separator />

      {/* Google signup */}
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
      >
        <FcGoogle size={20} />
        Sign up with Google
      </Button>
    </form>
  );
}
