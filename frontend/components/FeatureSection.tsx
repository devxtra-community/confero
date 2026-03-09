'use client';

import { motion } from 'framer-motion';
import {
  Video,
  Users,
  Zap,
  Globe,
  MessageSquare,
  Shield,
  Search,
  BarChart3,
} from 'lucide-react';

const features = [
  {
    icon: Video,
    title: 'HD Video & Voice Rooms',
    description:
      'Crystal-clear, low-latency video and audio powered by WebRTC. No installs — open a browser and start a real conversation instantly.',
    gradient: 'from-emerald-400 to-teal-500',
    delay: 0,
  },
  {
    icon: Users,
    title: 'Find Your Professional Match',
    description:
      'Browse professionals in your field. Filter by industry, expertise, and availability to find someone genuinely worth talking to.',
    gradient: 'from-green-400 to-emerald-600',
    delay: 0.08,
  },
  {
    icon: Zap,
    title: 'Real-Time, Zero Lag',
    description:
      'WebSocket signaling and peer-to-peer media streaming keep conversations instant. No buffering, no dropped frames, no dead air.',
    gradient: 'from-teal-400 to-cyan-500',
    delay: 0.16,
  },
  {
    icon: Globe,
    title: 'Multi-User Knowledge Rooms',
    description:
      'Host group sessions for mentorship circles, team knowledge transfers, or open community discussions — all in one live room.',
    gradient: 'from-emerald-500 to-green-400',
    delay: 0.24,
  },
  {
    icon: Search,
    title: 'Smart Partner Discovery',
    description:
      "Search by skill, role, or topic. Find someone who has walked the path you're on and is genuinely ready to share what they know.",
    gradient: 'from-cyan-400 to-teal-500',
    delay: 0.32,
  },
  {
    icon: MessageSquare,
    title: 'In-Session Chat',
    description:
      'Share links, resources, and ideas alongside your video call. Keep the knowledge flowing without ever switching tabs.',
    gradient: 'from-green-500 to-emerald-400',
    delay: 0.4,
  },
  {
    icon: Shield,
    title: 'Private by Default',
    description:
      'Peer-to-peer streaming means your sessions stay between you and your partner. No third-party servers touching your media.',
    gradient: 'from-teal-500 to-green-400',
    delay: 0.48,
  },
  {
    icon: BarChart3,
    title: 'Connection History',
    description:
      "See who you've connected with, what topics you covered, and how your professional network is expanding with every session.",
    gradient: 'from-emerald-400 to-cyan-400',
    delay: 0.56,
  },
];

export default function FeaturesSection() {
  return (
    <section
      className="py-15 bg-white relative overflow-hidden bg-snow"
      id="features"
    >
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-50 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide uppercase">
            Platform Features
          </span>
          <h2 className="text-4xl sm:text-5xl font-sans text-gray-900 mb-4 leading-tight">
            Everything You Need to{' '}
            <span className="text-primary">Connect & Grow</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Conferoo is built for professionals who believe real growth happens
            in real conversations — not in passive content consumption.
          </p>
        </motion.div>

        <div
          className="-mx-4 px-4 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: feature.delay }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="snap-start shrink-0 w-[78vw] sm:w-[42vw] lg:w-72 group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-linear-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon size={22} className="text-white" strokeWidth={2} />
                </div>
                <h3 className="text-gray-900 font-bold text-base mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
                <div className="absolute inset-0 rounded-2xl group-hover:bg-emerald-50/20 transition-all duration-300 pointer-events-none" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
