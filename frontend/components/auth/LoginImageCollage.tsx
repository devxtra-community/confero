'use client';

import Image from 'next/image';

export function LoginLeft() {
  return (
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
          <div className="lg:w-[80%] rotate-8 pl-10">
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
            <span className="text-blue-500 font-sans">Professionals</span>,
            Trusted Interactions
          </p>
        </div>
      </div>
    </div>
  );
}
