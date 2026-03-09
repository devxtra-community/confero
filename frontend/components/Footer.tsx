'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Linkedin, Github, ArrowUpRight } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

const socials = [
  { icon: Twitter, href: 'https://twitter.com/conferoo', label: 'Twitter' },
  {
    icon: Linkedin,
    href: 'https://linkedin.com/company/conferoo',
    label: 'LinkedIn',
  },
  { icon: Github, href: 'https://github.com/conferoo', label: 'GitHub' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/auth/greenbg.png"
          fill
          alt="background"
          className="object-cover"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-black/40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* CTA strip */}
        <motion.div
          className="py-14 sm:py-16 border-b border-white/10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-sans text-white leading-tight mb-2">
                Your next great conversation{' '}
                <span className="text-emerald-500">is waiting.</span>
              </h3>
              <p className="text-white/50 text-sm sm:text-base">
                Join thousands of professionals already sharing knowledge on
                Conferoo.
              </p>
            </div>
            <Link href="/signup" className="shrink-0">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-emerald-600 text-white font-semibold rounded-full transition-colors text-sm"
              >
                Start Connecting
                <ArrowUpRight size={15} strokeWidth={2.5} />
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Middle: logo + description + socials */}
        <div className="py-10 sm:py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/af5.svg"
                width={28}
                height={28}
                alt="Conferoo Logo"
              />
              <span className="text-white font-sans font-semibold text-lg">
                Conferoo
              </span>
            </div>
            <p className="text-white/40 text-xs sm:text-sm leading-relaxed max-w-xs">
              Real-time video and voice platform for professionals who believe
              the best knowledge lives in real conversations.
            </p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-3">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-white/50 hover:text-white text-sm transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Socials */}
          <div className="flex gap-2.5">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-full bg-white/8 hover:bg-primary/30 border border-white/10 hover:border-primary/40 flex items-center justify-center text-white/50 hover:text-white transition-all duration-200"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-5 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <p>© {new Date().getFullYear()} Conferoo. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
