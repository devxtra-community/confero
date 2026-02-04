'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Ban,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, href: '/admin' },
    {
      id: 'connection',
      label: 'Connection',
      icon: Users,
      href: '/admin/connection',
    },
    {
      id: 'banned',
      label: 'Banned Users',
      icon: Ban,
      href: '/admin/banned-users',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      href: '/admin/reports',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/admin/settings',
    },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Toggle Button - Enhanced */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 border border-gray-100"
        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
      >
        {sidebarOpen ? (
          <X size={24} className="text-gray-700" />
        ) : (
          <Menu size={24} className="text-gray-700" />
        )}
      </button>

      {/* Sidebar - Enhanced */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-72 bg-white border-r border-gray-200 
          transition-transform duration-300 ease-in-out
          flex flex-col shadow-xl lg:shadow-none
        `}
      >
        {/* Header with Logo - Enhanced */}
        <div className="relative flex items-center gap-3 p-6 border-b border-gray-100 overflow-hidden">
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50/80 via-emerald-50/80 to-teal-50/80 opacity-50"></div>

          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-teal-100 transition-transform hover:scale-105 hover:rotate-3">
            C
          </div>
          <h1 className="relative text-2xl font-bold bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
            Confero
          </h1>
        </div>

        {/* Navigation - Enhanced */}
        <nav
          className="flex-1 p-4 overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#d1d5db transparent',
          }}
        >
          <div className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    // Close sidebar on mobile after clicking
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
                    transition-all duration-200 group relative overflow-hidden
                    ${
                      active
                        ? 'bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 shadow-sm scale-[1.02]'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:scale-[1.01]'
                    }
                  `}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'backwards',
                  }}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-teal-500 to-emerald-600 rounded-r-full shadow-md" />
                  )}

                  {/* Icon with enhanced animation */}
                  <div
                    className={`
                    relative flex items-center justify-center w-5 h-5
                    ${active ? 'scale-110' : ''}
                  `}
                  >
                    <Icon
                      size={20}
                      className={`
                        transition-all duration-200
                        ${
                          active
                            ? 'text-teal-600'
                            : 'text-gray-500 group-hover:text-teal-600 group-hover:scale-110'
                        }
                      `}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  </div>

                  <span
                    className={`
                    flex-1 font-medium transition-all duration-200
                    ${active ? 'font-semibold' : 'group-hover:translate-x-0.5'}
                  `}
                  >
                    {item.label}
                  </span>

                  {/* Arrow indicator on hover */}
                  <ChevronRight
                    size={16}
                    className={`
                      transition-all duration-200
                      ${
                        active
                          ? 'opacity-100 translate-x-0 text-teal-600'
                          : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-gray-400'
                      }
                    `}
                  />

                  {/* Hover effect background */}
                  {!active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10 rounded-xl" />
                  )}

                  {/* Subtle shine effect on active */}
                  {active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile at Bottom - Enhanced */}
        <div className="p-4 border-t border-gray-100 bg-gradient-to-b from-transparent to-gray-50/50">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md border border-transparent hover:border-teal-100">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center text-white font-semibold shadow-md ring-2 ring-white group-hover:ring-teal-100 transition-all">
                N
              </div>
              {/* Online status indicator */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate group-hover:text-teal-700 transition-colors">
                Admin
              </div>
              <div className="text-xs text-gray-500 truncate group-hover:text-gray-600 transition-colors">
                admin@confero.com
              </div>
            </div>

            <div className="text-gray-400 group-hover:text-teal-600 transition-all duration-200 group-hover:rotate-180">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile - Enhanced */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
          style={{
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        />
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Custom scrollbar styles */
        nav::-webkit-scrollbar {
          width: 6px;
        }

        nav::-webkit-scrollbar-track {
          background: transparent;
        }

        nav::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        nav::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </>
  );
}
