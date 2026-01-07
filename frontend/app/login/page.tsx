'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Minimize2, Square } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen w-full flex">
      <div className="hidden lg:block w-1/2 relative">
        <Image
          src="/auth/bg.jpeg"
          alt="Auth background"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 h-full pl-12 pt-10 flex flex-col">
          <div className="-space-y-7">
            <div className=" lg:w-[80%]  rotate-8 pl-10">
              <Image
                src="/auth/login1.jpg"
                alt="Video call"
                width={470}
                height={450}
                className="rounded-2xl shadow-2xl border border-white/10"
              />
            </div>

            <div className="w-[80%] ml-auto -rotate-5">
              <Image
                src="/auth/login2.jpg"
                alt="Meeting"
                width={470}
                height={400}
                className="rounded-2xl shadow-2xl border border-white/10"
              />
            </div>
          </div>

          <div className="text-2xl text-popover pt-10 pl-3 font-sans">
            <p className="opacity-90">Confero, Where Professionals Meet</p>
            <p className="mt-1 opacity-90">
              Verified{' '}
              <span className="font-sans text-blue-500">
                Professionals
              </span>
              , Trusted Interactions
            </p>
          </div>
        </div>
      </div>

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

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm text-muted-foreground mb-1">Or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <p className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account?{' '}
              <span className="text-primary font-medium cursor-pointer">
                Signup
              </span>
            </p>

            <button className="w-full h-11 rounded-md border border-border flex items-center justify-center gap-3 text-sm">
              <FcGoogle size={20} />
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
