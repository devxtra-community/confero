'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="
        fixed top-6 left-1/2 -translate-x-1/2
        z-50
        w-[calc(100%-2rem)] sm:w-auto
      "
    >
      <div
        className="
          mx-auto max-w-5xl
          bg-teal-800/30 backdrop-blur-md
          border border-white/15
          md:rounded-full
          rounded-2xl
          px-5 sm:px-8 py-3
          shadow-lg
        "
      >
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-6 font-sans">
            <h1 className="text-white text-lg sm:text-xl">Confero</h1>

            <div className="hidden md:flex items-center justify-around gap-6 text-md cursor-pointer">
              <Link href="/home" className="text-white/80 hover:text-white">
                Home
              </Link>
              <a className="text-white/80 hover:text-white">Features</a>
              <a className="text-white/80 hover:text-white">FAQ</a>
            </div>
          </div>

          <div className="flex items-center gap-3 font-sans">
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/login">
                {' '}
                <button className="px-5 py-2 text-sm cursor-pointer text-white bg-glass border border-white/20 rounded-full hover:bg-glassHover">
                  Login
                </button>
              </Link>
              <Link href="/signup">
                {' '}
                <button className="px-5 py-2 text-sm text-white bg-buttonBg rounded-full cursor-pointer">
                  Sign Up
                </button>
              </Link>
            </div>

            <button
              onClick={() => setOpen(!open)}
              className="sm:hidden text-white"
            >
              {open ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        <div
          className={`
            sm:hidden overflow-hidden transition-all duration-300 ease-out
            ${open ? 'max-h-96 mt-4 opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="flex flex-col items-center gap-5 text-white text-md font-sans pb-4">
            <Link href="/">
              <p onClick={() => setOpen(false)}>Home</p>
            </Link>
            <p onClick={() => setOpen(false)}>Features</p>
            <p onClick={() => setOpen(false)}>FAQ</p>

            <div className="w-full h-px bg-white/20" />

            <Link
              href="/login"
              className="w-full py-2 bg-glass rounded-full text-center"
            >
              {' '}
              <button>Login</button>
            </Link>
            <Link
              href="/signup"
              className="w-full py-2 bg-buttonBg rounded-full text-center"
            >
              <button>Sign Up</button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
