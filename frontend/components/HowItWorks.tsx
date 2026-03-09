'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  ArrowRight,
  Star,
  Radio,
  Users,
  Search,
  Video,
  TrendingUp,
} from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Users,
    title: 'Create Your Profile',
    description:
      "Tell us your target role, experience level, and which companies you're aiming for. We tailor everything to you.",
  },
  {
    number: '02',
    icon: Search,
    title: 'Discover Partners',
    description:
      'Browse real professionals by industry, role, and topic. Find someone whose experience complements your goals.',
  },
  {
    number: '03',
    icon: Video,
    title: 'Connect Live',
    description:
      'Jump into a private HD video room directly in your browser. Peer-to-peer, instant, and secure.',
  },
  {
    number: '04',
    icon: TrendingUp,
    title: 'Share & Grow',
    description:
      'Every conversation adds to your professional story. Build trusted partnerships and watch your expertise compound.',
  },
];

export default function HowItWorksSection() {
  return (
    <section
      className="py-16 sm:py-20 lg:py-28 relative overflow-hidden bg-snow"
      id="how-it-works"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <motion.div
          className="text-center mb-10 sm:mb-14 lg:mb-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase text-emerald-700 mb-4">
            <span className="w-6 h-px bg-primary" />
            How It Works
            <span className="w-6 h-px bg-primary" />
          </span>
          <h2 className="text-4xl sm:text-4xl lg:text-5xl xl:text-6xl font-sans text-foreground leading-[1.05] max-w-6xl mx-auto tracking-tight">
            Four steps to your next{' '}
            <span className="text-primary">great connection</span>
          </h2>
          <p className="mt-4 text-foreground/50 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            From sign-up to live conversation — here&apos;s exactly how Conferoo
            works.
          </p>
        </motion.div>

        <div className="lg:hidden -mx-4 px-4 mb-8">
          <div
            className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="snap-start shrink-0 w-[72vw] sm:w-[44vw] bg-white rounded-2xl p-5 border border-[#e8e8e4] shadow-sm flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      <Icon
                        className="w-5 h-5 text-emerald-600"
                        strokeWidth={1.75}
                      />
                    </div>
                    <span className="text-3xl font-black text-emerald-100 select-none leading-none">
                      {step.number}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-foreground mb-1.5 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-foreground/50 text-xs leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="mt-auto h-0.5 w-8 rounded-full bg-emerald-400" />
                </motion.div>
              );
            })}

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.4 }}
              className="snap-start shrink-0 w-[60vw] sm:w-[36vw] bg-emerald-700 rounded-2xl p-5 flex flex-col justify-between"
            >
              <p className="text-white font-bold text-base leading-snug">
                Ready to start your journey?
              </p>
              <a
                href="#"
                className="mt-6 inline-flex items-center gap-2 bg-white text-emerald-700 text-xs font-bold px-4 py-2.5 rounded-full self-start hover:bg-emerald-50 transition-colors"
              >
                Get started
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
              </a>
            </motion.div>
          </div>
        </div>

        <div className="hidden lg:grid grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute left-6.75 top-10 bottom-10 w-px bg-linear-to-b from-emerald-200 via-emerald-300 to-transparent" />

            <div className="space-y-4">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -28 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.55,
                      delay: i * 0.1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="group relative flex gap-5 bg-white rounded-2xl p-5 shadow-sm border border-[#e8e8e4] hover:border-emerald-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="shrink-0 relative z-10">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                        <Icon
                          className="w-4.5 h-4.5 text-favor group-hover:text-white transition-colors duration-300"
                          strokeWidth={1.75}
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-primary block mb-1">
                        {step.number}
                      </span>
                      <h3 className="text-md font-bold text-foreground leading-tight mb-1.5">
                        {step.title}
                      </h3>
                      <p className="text-foreground/50 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300">
                      <ArrowRight
                        className="w-4 h-4 text-emerald-600"
                        strokeWidth={1.5}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.55 }}
            >
              <a
                href="#"
                className="inline-flex items-center gap-2.5 bg-primary text-white text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-emerald-800 active:scale-[0.98] transition-all duration-200 shadow-md shadow-emerald-700/20"
              >
                Get started today
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </a>
            </motion.div>
          </div>

          <motion.div
            className="relative h-150"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute inset-8 rounded-3xl bg-emerald-100/40" />

            <motion.div
              className="absolute left-4 top-6 w-60 h-85 rounded-3xl overflow-hidden shadow-2xl border-3 border-white"
              style={{ rotate: -4 }}
              whileHover={{
                rotate: -1.5,
                scale: 1.02,
                transition: { duration: 0.4 },
              }}
            >
              <Image
                src="/auth/girl.jpg"
                fill
                alt="Professional"
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-foreground/80 via-foreground/30 to-transparent px-4 pt-10 pb-4">
                <p className="text-white text-xs font-semibold">Sarah K.</p>
                <p className="text-white/60 text-[10px]">
                  Product Manager · Google
                </p>
              </div>
            </motion.div>

            <motion.div
              className="absolute left-46 top-18 w-56 h-75 rounded-3xl overflow-hidden shadow-2xl border-3 border-white"
              style={{ rotate: 3.5 }}
              whileHover={{
                rotate: 1.5,
                scale: 1.02,
                transition: { duration: 0.4 },
              }}
            >
              <Image
                src="/auth/young.jpg"
                fill
                alt="Live session"
                className="object-cover object-[50%_20%]"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-emerald-900/80 via-emerald-900/20 to-transparent px-4 pt-10 pb-4">
                <p className="text-white text-xs font-semibold">Alex M.</p>
                <p className="text-white/60 text-[10px]">
                  Software Engineer · Meta
                </p>
              </div>
            </motion.div>

            <motion.div
              className="absolute right-6 top-48 w-48 h-48 rounded-2xl overflow-hidden shadow-xl border-3 border-white"
              style={{ rotate: 8 }}
              whileHover={{
                rotate: -2.5,
                scale: 1.03,
                transition: { duration: 0.4 },
              }}
            >
              <Image
                src="/auth/girl.jpg"
                fill
                alt="Partner"
                className="object-cover object-top"
              />
            </motion.div>

            <motion.div
              className="absolute right-20 bottom-13 w-44 h-44 rounded-2xl overflow-hidden shadow-lg border-3 border-white"
              style={{ rotate: -3 }}
              whileHover={{
                rotate: 2.5,
                scale: 1.03,
                transition: { duration: 0.4 },
              }}
            >
              <Image
                src="/auth/young.jpg"
                fill
                alt="Partner"
                className="object-cover object-center"
              />
            </motion.div>

            <motion.div
              className="absolute top-5 right-6 bg-primary text-white rounded-2xl px-3.5 py-2.5 shadow-xl flex items-center gap-2.5"
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Radio className="w-5 h-5 text-emerald-400" strokeWidth={2} />
              <div>
                <p className="text-[9px] text-white leading-none mb-0.5 uppercase tracking-wide">
                  Session Active
                </p>
                <p className="text-xs font-bold leading-none">Live now</p>
              </div>
            </motion.div>

            <motion.div
              className="absolute bottom-8 left-3 bg-white border border-[#e8e8e4] shadow-lg rounded-2xl px-4 py-3 flex items-center gap-2.5"
              animate={{ y: [0, 5, 0] }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.6,
              }}
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3 h-3 text-amber-400 fill-amber-400"
                    strokeWidth={0}
                  />
                ))}
              </div>
              <div>
                <p className="text-[10px] text-foreground/40 leading-none mb-0.5">
                  Avg. rating
                </p>
                <p className="text-sm font-bold text-foreground leading-none">
                  4.9 / 5
                </p>
              </div>
            </motion.div>

            <motion.div
              className="absolute bottom-36 left-0 bg-primary text-white rounded-full px-4 py-2 flex items-center gap-2 shadow-lg shadow-emerald-600/30"
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[11px] font-bold tracking-wide">
                10,000+ Professionals
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
