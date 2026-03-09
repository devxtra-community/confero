'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Home,
  Users,
  Ban,
  BarChart3,
  LogOut,
  ChevronUp,
  Activity,
} from 'lucide-react';
import { axiosInstance } from '@/lib/axiosInstance';
import { toast } from 'sonner';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const MENU_ITEMS = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    href: '/admin',
    desc: 'Overview & stats',
  },
  {
    id: 'connection',
    label: 'Connection',
    icon: Users,
    href: '/admin/connection',
    desc: 'Manage users',
  },
  {
    id: 'banned',
    label: 'Banned Users',
    icon: Ban,
    href: '/admin/banned-users',
    desc: 'Restricted accounts',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    href: '/admin/reports',
    desc: 'Analytics & logs',
  },
];

export default function Sidebar() {
  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const logoutRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (logoutRef.current && !logoutRef.current.contains(e.target as Node))
        setShowLogout(false);
    };
    if (showLogout) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showLogout]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
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
      <style>{`
        .sb-link { transition: background 0.15s, color 0.15s, border-color 0.15s; }
        .sb-link:hover { background: oklch(0.72 0.19 149 / 0.07) !important; color: oklch(0.42 0.11 136) !important; }
        .sb-link:hover .sb-link-desc { color: oklch(0.42 0.11 136 / 0.7) !important; }
        .sb-link:hover .sb-link-icon { color: oklch(0.72 0.19 149) !important; }
        .sb-logout-btn:hover { background: oklch(0.577 0.245 27.325 / 0.06) !important; }
        .sb-user-btn:hover { border-color: oklch(0.72 0.19 149 / 0.35) !important; box-shadow: 0 2px 14px oklch(0.72 0.19 149 / 0.09) !important; }
        .sb-nav::-webkit-scrollbar { width: 3px; }
        .sb-nav::-webkit-scrollbar-track { background: transparent; }
        .sb-nav::-webkit-scrollbar-thumb { background: oklch(0.72 0.19 149 / 0.2); border-radius: 99px; }
      `}</style>

      <aside
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: 268,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--sidebar)',
          borderRight: '1px solid var(--sidebar-border)',
        }}
      >
        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <div
          style={{
            padding: '20px 18px 16px',
            borderBottom: '1px solid var(--sidebar-border)',
            background:
              'linear-gradient(160deg, oklch(0.72 0.19 149 / 0.05) 0%, transparent 70%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <motion.div
              whileHover={{ scale: 1.07, rotate: 3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                overflow: 'hidden',
                position: 'relative',
                flexShrink: 0,
                border: '1.5px solid oklch(0.72 0.19 149 / 0.25)',
              }}
            >
              <Image
                src="/Logo C.svg"
                alt="Confero"
                fill
                className="object-cover"
                priority
              />
            </motion.div>

            <div>
              <div
                style={{
                  fontSize: 21,
                  fontWeight: 800,
                  fontFamily: 'var(--font-sans)',
                  background:
                    'linear-gradient(100deg, oklch(0.42 0.11 136), oklch(0.72 0.19 149))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1,
                }}
              >
                Confero
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--muted-foreground)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginTop: 1,
                }}
              >
                Admin Console
              </div>
            </div>
          </div>
        </div>

        {/* ── Nav ──────────────────────────────────────────────────────── */}
        <nav
          className="sb-nav"
          style={{
            flex: 1,
            padding: '14px 10px',
            overflowY: 'auto',
          }}
        >
          <p
            style={{
              fontSize: 10,
              letterSpacing: '0.13em',
              textTransform: 'uppercase',
              color: 'var(--muted-foreground)',
              fontFamily: 'var(--font-mono)',
              padding: '0 10px',
              margin: '0 0 8px',
            }}
          >
            Navigation
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {MENU_ITEMS.map((item, i) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: i * 0.055,
                    duration: 0.22,
                    ease: 'easeOut',
                  }}
                >
                  <Link
                    href={item.href}
                    className="sb-link"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: 11,
                      textDecoration: 'none',
                      fontFamily: 'var(--font-sans)',
                      color: active
                        ? 'oklch(0.42 0.11 136)'
                        : 'var(--sidebar-foreground)',
                      background: active
                        ? 'oklch(0.42 0.11 136 / 0.07)'
                        : 'transparent',
                      borderLeft: `3px solid ${active ? 'oklch(0.72 0.19 149)' : 'transparent'}`,
                    }}
                  >
                    {/* icon */}
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 9,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        background: active
                          ? 'oklch(0.72 0.19 149 / 0.12)'
                          : 'oklch(0.145 0 0 / 0.04)',
                        border: active
                          ? '1px solid oklch(0.72 0.19 149 / 0.22)'
                          : '1px solid oklch(0.145 0 0 / 0.06)',
                      }}
                    >
                      <Icon
                        size={16}
                        strokeWidth={active ? 2.4 : 2}
                        className="sb-link-icon"
                        style={{
                          color: active
                            ? 'oklch(0.72 0.19 149)'
                            : 'var(--muted-foreground)',
                        }}
                      />
                    </div>

                    {/* text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: active ? 700 : 500,
                          lineHeight: 1.2,
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        className="sb-link-desc"
                        style={{
                          fontSize: 11,
                          color: active
                            ? 'oklch(0.42 0.11 136 / 0.65)'
                            : 'var(--muted-foreground)',
                          fontFamily: 'var(--font-mono)',
                          marginTop: 1,
                        }}
                      >
                        {item.desc}
                      </div>
                    </div>

                    {/* active dot */}
                    {active && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: 'oklch(0.72 0.19 149)',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* ── Divider ──────────────────────────────────────────────────── */}
          <div
            style={{
              margin: '18px 10px 14px',
              height: 1,
              background: 'var(--sidebar-border)',
            }}
          />

          {/* ── Status pill ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              margin: '0 2px',
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid var(--sidebar-border)',
              background: 'var(--card)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: 'oklch(0.72 0.19 149 / 0.10)',
                border: '1px solid oklch(0.72 0.19 149 / 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Activity
                size={14}
                style={{ color: 'oklch(0.72 0.19 149)' }}
                strokeWidth={2}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--sidebar-foreground)',
                }}
              >
                All systems normal
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  marginTop: 2,
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: 'oklch(0.72 0.19 149)',
                    display: 'inline-block',
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--muted-foreground)',
                    letterSpacing: '0.05em',
                  }}
                >
                  Platform operational
                </span>
              </div>
            </div>
          </motion.div>
        </nav>

        {/* ── User / Logout ─────────────────────────────────────────────── */}
        <div
          ref={logoutRef}
          style={{
            padding: '10px 10px 14px',
            borderTop: '1px solid var(--sidebar-border)',
            position: 'relative',
            background:
              'linear-gradient(0deg, oklch(0.72 0.19 149 / 0.03) 0%, transparent 100%)',
          }}
        >
          {/* logout popup */}
          <AnimatePresence>
            {showLogout && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 6px)',
                  left: 10,
                  right: 10,
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 4px 24px oklch(0 0 0 / 0.09)',
                }}
              >
                <button
                  className="sb-logout-btn"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 16px',
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--destructive)',
                    background: 'transparent',
                    border: 'none',
                    cursor: loggingOut ? 'not-allowed' : 'pointer',
                    opacity: loggingOut ? 0.6 : 1,
                    textAlign: 'left',
                  }}
                >
                  <motion.span
                    animate={loggingOut ? { rotate: 360 } : { rotate: 0 }}
                    transition={
                      loggingOut
                        ? { repeat: Infinity, duration: 0.9, ease: 'linear' }
                        : {}
                    }
                    style={{ display: 'flex' }}
                  >
                    <LogOut size={15} />
                  </motion.span>
                  {loggingOut ? 'Logging out…' : 'Logout'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* user row */}
          <motion.button
            className="sb-user-btn"
            onClick={() => setShowLogout(p => !p)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid var(--sidebar-border)',
              background: 'var(--card)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              transition: 'border-color 0.18s, box-shadow 0.18s',
            }}
          >
            {/* avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, oklch(0.42 0.11 136), oklch(0.72 0.19 149))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: 'var(--font-sans)',
                  boxShadow: '0 2px 8px oklch(0.42 0.11 136 / 0.30)',
                }}
              >
                N
              </div>
              <span
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'oklch(0.72 0.19 149)',
                  border: '2px solid var(--card)',
                  boxShadow: '0 0 4px oklch(0.72 0.19 149 / 0.5)',
                }}
              />
            </div>

            {/* info */}
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--sidebar-foreground)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                }}
              >
                Admin
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--muted-foreground)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-mono)',
                  marginTop: 1,
                }}
              >
                admin@confero.com
              </div>
            </div>

            {/* chevron */}
            <motion.span
              animate={{ rotate: showLogout ? 0 : 180 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              style={{
                color: 'var(--muted-foreground)',
                flexShrink: 0,
                display: 'flex',
              }}
            >
              <ChevronUp size={14} strokeWidth={2} />
            </motion.span>
          </motion.button>
        </div>
      </aside>
    </>
  );
}
