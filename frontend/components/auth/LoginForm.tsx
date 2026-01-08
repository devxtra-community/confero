'use client';

import { useState } from 'react';
import GoogleButton from './GoogleButton';

export function LoginRight() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="w-full lg:w-1/2 bg-background flex flex-col min-h-screen">
      <div className="flex flex-1 items-center justify-center px-4 sm:px-8 md:px-16">
        <div className="w-full max-w-md space-y-6 py-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold font-sans pb-4">
              Welcome <span className="text-primary">Back!</span>
            </h2>
            <p className="text-muted-foreground font-sans text-base sm:text-xl">
              Log in
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-11 px-4 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring outline-none"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full h-11 px-4 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring outline-none"
            />

            <button className="w-full h-11 mt-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90">
              Signup
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted-foreground">Or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{' '}
            <span className="text-primary font-medium cursor-pointer">
              Signup
            </span>
          </p>
          <GoogleButton />
        </div>
      </div>
    </div>
  );
}
