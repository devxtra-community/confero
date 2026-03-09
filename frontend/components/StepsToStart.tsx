'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircle,
  Search,
  Video,
  Star,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

const steps = [
  {
    id: 1,
    label: 'Step 01',
    title: 'Create Your Profile',
    subtitle: 'Show the world who you are',
    description:
      "Set up your professional profile in minutes. Highlight your skills, industry experience, and what you're looking to share or learn.",
    icon: UserCircle,
    image:
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=900&q=85',
    imageAlt: 'Professional setting up their profile',
    highlights: [
      'Add your skills & expertise',
      'Set your availability',
      'Write what you want to share',
    ],
    tag: 'Takes 2 min',
  },
  {
    id: 2,
    label: 'Step 02',
    title: 'Discover Partners',
    subtitle: 'Find the right professional',
    description:
      'Browse real professionals by industry, role, and topic. Find someone whose experience complements your goals.',
    icon: Search,
    image:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&q=85',
    imageAlt: 'Browsing professional profiles',
    highlights: [
      'Filter by industry & skill',
      'See real profiles & ratings',
      'Send a connection request',
    ],
    tag: '1000s of pros',
  },
  {
    id: 3,
    label: 'Step 03',
    title: 'Connect Live',
    subtitle: 'Real-time video & voice',
    description:
      'Jump into a private HD video room directly in your browser — no downloads needed. Peer-to-peer, instant, and secure.',
    icon: Video,
    image:
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&q=85',
    imageAlt: 'Two professionals on a live video call',
    highlights: [
      'HD video & voice, zero lag',
      'Private peer-to-peer stream',
      'In-session chat & sharing',
    ],
    tag: 'No install needed',
  },
  {
    id: 4,
    label: 'Step 04',
    title: 'Share & Grow',
    subtitle: 'Knowledge compounds over time',
    description:
      'Every conversation adds to your professional story. Build trusted partnerships and watch your expertise compound with every exchange.',
    icon: Star,
    image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&q=85',
    imageAlt: 'Professionals growing their network',
    highlights: [
      'Build lasting professional bonds',
      'Track your conversations',
      'Grow your reputation',
    ],
    tag: 'Knowledge = power',
  },
];

export default function StepsToStart() {
  const [active, setActive] = useState(0);
  const step = steps[active];
  const Icon = step.icon;

  return (
    <section
      className="bg-white py-15 relative overflow-hidden bg-snow"
      id="how-it-works"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-125 bg-emerald-50 rounded-full blur-[120px] opacity-70" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-emerald-600 text-sm font-semibold tracking-widest uppercase mb-3">
            How It Works
          </p>
          <h2 className="text-4xl sm:text-5xl font-sans text-gray-900">
            Simple Steps to Start{' '}
            <span className="text-primary">Connecting</span>
          </h2>
          <p className="text-gray-400 mt-4 text-base max-w-lg mx-auto">
            From profile to live conversation in minutes.
          </p>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          {/* LEFT: Step list */}
          <div className="lg:col-span-2 flex flex-col gap-2">
            {steps.map((s, i) => {
              const SIcon = s.icon;
              const isActive = active === i;
              return (
                <motion.button
                  key={s.id}
                  onClick={() => setActive(i)}
                  whileHover={{ x: isActive ? 0 : 3 }}
                  transition={{ duration: 0.15 }}
                  className={`w-full text-left rounded-xl px-5 py-4 transition-all duration-250 flex items-center gap-4 ${
                    isActive
                      ? 'bg-primary shadow-lg shadow-emerald-100'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-white/20'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <SIcon
                      className={`w-5 h-5 ${isActive ? 'text-white' : 'text-primary'}`}
                      strokeWidth={1.8}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-bold tracking-widest uppercase mb-0.5 ${
                        isActive ? 'text-white/60' : 'text-primary'
                      }`}
                    >
                      {s.label}
                    </p>
                    <p
                      className={`font-semibold text-sm truncate ${
                        isActive ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {s.title}
                    </p>
                  </div>
                  <motion.div
                    animate={{
                      opacity: isActive ? 1 : 0,
                      scale: isActive ? 1 : 0.5,
                    }}
                    transition={{ duration: 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-white shrink-0"
                  />
                </motion.button>
              );
            })}

            {/* Progress bar */}
            <div className="flex gap-1.5 mt-3 px-1">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i <= active ? 'bg-primary' : 'bg-gray-200'
                  } ${i === active ? 'flex-2' : 'flex-1'}`}
                />
              ))}
            </div>
          </div>

          {/* RIGHT: Detail card */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <motion.img
                    key={step.image}
                    src={step.image}
                    alt={step.imageAlt}
                    className="w-full h-full object-cover"
                    initial={{ scale: 1.06, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      {step.label}
                    </div>
                    <div className="bg-black/40 backdrop-blur-sm text-white/90 text-xs font-medium px-3 py-1.5 rounded-full border border-white/10">
                      {step.tag}
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-md">
                      <Icon className="w-4 h-4 text-white" strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs">{step.subtitle}</p>
                      <p className="text-white font-bold text-sm leading-tight">
                        {step.title}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">
                    {step.description}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6">
                    {step.highlights.map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="flex items-center gap-2 bg-emerald-50 rounded-lg px-3 py-2"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="text-gray-700 text-xs font-medium">
                          {h}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {steps.map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-full transition-all duration-300 ${
                            i === active
                              ? 'w-5 h-1.5 bg-primary'
                              : 'w-1.5 h-1.5 bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    {active < steps.length - 1 ? (
                      <button
                        onClick={() => setActive(active + 1)}
                        className="flex items-center gap-2 bg-primary hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                      >
                        Next <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button className="flex items-center gap-2 bg-primary hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                        Get Started <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
