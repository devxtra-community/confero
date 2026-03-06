'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Home,
  Users,
  Ban,
  BarChart3,
  Menu,
  X,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { axiosInstance } from '@/lib/axiosInstance';
import { toast } from 'sonner';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, href: '/admin' },
    { id: 'connection', label: 'Connection', icon: Users, href: '/admin/connection' },
    { id: 'banned', label: 'Banned Users', icon: Ban, href: '/admin/banned-users' },
    { id: 'reports', label: 'Reports', icon: BarChart3, href: '/admin/reports' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      console.log("hi")
      await axiosInstance.post('/auth/logout');
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message ?? 'Logout failed');
      } else {
        toast.error('Logout failed');
      }
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg hover: hover:scale-105 active:scale-95 transition-all duration-200 border border-gray-100"
        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {sidebarOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} className="text-gray-700" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu size={24} className="text-gray-700" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : '-100%',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 flex flex-col  lg:shadow-none lg:translate-x-0"
      >
        <div className="relative flex items-center gap-3 p-6 border-b border-gray-100 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-teal-50/80 via-emerald-50/80 to-teal-50/80 opacity-50" />
          <motion.div
            whileHover={{ scale: 1.08, rotate: 3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="relative w-10 h-10 rounded-xl overflow-hidden -mr-2"
          >
            <Image
              src="/Logo c.svg"
              alt="Confero Logo"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
          <h1 className="relative text-2xl font-bold bg-linear-to-r from-teal-600 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
            Confero
          </h1>
        </div>

        <nav
          className="flex-1 p-4 overflow-y-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}
        >
          <div className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.07, type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
                      transition-colors duration-200 group relative overflow-hidden
                      ${active
                        ? 'bg-linear-to-r from-teal-50 to-emerald-50 text-teal-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-linear-to-b from-teal-500 to-emerald-600 rounded-r-full shadow-md"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}

                    <Icon
                      size={20}
                      className={`transition-colors duration-200 ${active ? 'text-teal-600' : 'text-gray-500 group-hover:text-teal-600'
                        }`}
                      strokeWidth={active ? 2.5 : 2}
                    />

                    <span className={`flex-1 font-medium ${active ? 'font-semibold' : ''}`}>
                      {item.label}
                    </span>

                    <motion.div
                      animate={{ opacity: active ? 1 : 0, x: active ? 0 : -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight
                        size={16}
                        className={active ? 'text-teal-600' : 'text-gray-400'}
                      />
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100 bg-linear-to-b from-transparent to-gray-50/50 relative">

          <AnimatePresence>
            {showLogout && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="absolute bottom-17 left-4 right-4 mb-2 bg-white rounded-xl  border border-gray-100 overflow-hidden z-50"
              >
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-red-600 hover:bg-red-50 transition-colors duration-200 group"
                >
                  <motion.div
                    animate={loggingOut ? { rotate: 360 } : { rotate: 0 }}
                    transition={loggingOut ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}
                  >
                    <LogOut size={18} />
                  </motion.div>
                  <span className="text-md font-semibold ">
                    {loggingOut ? 'Logging out...' : 'Logout'}
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            onClick={() => setShowLogout(prev => !prev)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-colors duration-200 cursor-pointer group shadow-sm hover:shadow-md border border-transparent hover:border-teal-100"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center text-white font-semibold shadow-md ring-2 ring-white group-hover:ring-teal-100 transition-all">
                N
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate group-hover:text-teal-700 transition-colors">
                Admin
              </div>
              <div className="text-xs text-gray-500 truncate">
                admin@confero.com
              </div>
            </div>

            <motion.div
              animate={{ rotate: showLogout ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="text-gray-400 group-hover:text-teal-600 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </motion.aside>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogout && (
          <motion.div
            key="logout-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setShowLogout(false)}
          />
        )}
      </AnimatePresence>

      <style jsx global>{`
        nav::-webkit-scrollbar { width: 6px; }
        nav::-webkit-scrollbar-track { background: transparent; }
        nav::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
        nav::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>
    </>
  );
}