'use client';

import Link from 'next/link';
import { UserPen, User, LogOut, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { axiosInstance } from '@/lib/axiosInstance';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ProfileHover() {
  const [hover, setHover] = useState(false);

  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
      toast.success('Logged out');
      router.push('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <div
      className="fixed top-6 right-6 sm:right-10 z-70 "
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link
        href="/profile"
        className="flex items-center justify-center  bg-linear-to-r from-primary to-favor dark:bg-black/20 shadow-xl p-3 rounded-full backdrop-blur-xl border border-white/40 transition-all hover:scale-105 hover:shadow-primary/20 group"
      >
        <User
          size={24}
          className="text-background group-hover:text-background"
        />
      </Link>

      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, y: 12, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 10, scale: 0.95, x: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="absolute right-0  w-64 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-white/50 shadow-2xl backdrop-blur-2xl overflow-hidden"
          >
            <div className="p-4 bg-primary/5 border-b border-primary/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-favor flex items-center justify-center text-white shadow-md">
                  <UserPen size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">
                    My Account
                  </span>
                  <span className="text-[10px] text-primary font-medium uppercase tracking-wider">
                    Active Status
                  </span>
                </div>
              </div>
            </div>

            <div className="p-2">
              <MenuLink
                href="/profile"
                icon={<User size={16} />}
                label="View Profile"
              />

              <div className="h-px bg-slate-200 dark:bg-slate-800 my-2 mx-2" />

              <button className="w-full flex items-center justify-between p-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all group">
                <div className="flex items-center gap-3" onClick={handleLogout}>
                  <LogOut
                    size={16}
                    className="group-hover:rotate-12 transition-transform"
                  />
                  <span className="text-sm font-semibold">Sign Out</span>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface user {
  href: string,
  icon?: React.ReactNode,
  label: string
}

function MenuLink({ href, icon, label }: user) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-primary/5 transition-all group"
    >
      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors">
        {icon}
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <ChevronRight
        size={14}
        className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary"
      />
    </Link>
  );
}
