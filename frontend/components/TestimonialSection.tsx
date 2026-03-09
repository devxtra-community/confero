'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Riya Mehta',
    role: 'Product Manager @ Razorpay',
    avatar: '👩‍💼',
    quote:
      "I connected with a senior PM from Stripe on Conferoo. In 45 minutes she shared more useful context about product thinking than I'd gathered in months of reading articles.",
    rating: 5,
    tag: 'Knowledge Exchange',
  },
  {
    name: 'David Park',
    role: 'Senior Engineer @ Shopify',
    avatar: '👨‍💻',
    quote:
      "Conferoo gave me a way to pay forward everything I've learned. I now do bi-weekly sessions with early-career engineers. The video quality is flawless — feels like we're in the same room.",
    rating: 5,
    tag: 'Mentorship',
  },
  {
    name: 'Ananya Krishnan',
    role: 'UX Designer @ Figma',
    avatar: '🎨',
    quote:
      'Found a design lead who had navigated exactly the career transition I was trying to make. One real conversation beat six months of LinkedIn lurking.',
    rating: 5,
    tag: 'Career Growth',
  },
  {
    name: 'Marcus Webb',
    role: 'Founder @ Buildfast',
    avatar: '🚀',
    quote:
      "As a founder, talking to other founders who've been through the same fires is invaluable. Conferoo makes it effortless to find them and just... talk.",
    rating: 5,
    tag: 'Founder Network',
  },
  {
    name: 'Priya Nair',
    role: 'Data Scientist @ Swiggy',
    avatar: '📊',
    quote:
      "The platform is incredibly smooth — no lags, no dropped calls. I use it every week to exchange insights with peers across different companies. It's become part of my professional routine.",
    rating: 5,
    tag: 'Peer Learning',
  },
  {
    name: 'James Okafor',
    role: 'Backend Engineer @ Paystack',
    avatar: '⚙️',
    quote:
      'I was skeptical at first. But after my first session with a systems architect from Europe, I was hooked. The quality of conversation you get on Conferoo is just different.',
    rating: 5,
    tag: 'Real Connection',
  },
];

const stats = [
  { value: '10,000+', label: 'Professionals Connected' },
  { value: '50ms', label: 'Avg. Latency' },
  { value: '4.9/5', label: 'Session Rating' },
  { value: '120+', label: 'Industries Represented' },
];

export default function TestimonialsSection() {
  return (
    <section className="py-15 bg-gray-50 overflow-hidden relative bg-snow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide uppercase">
            Community Stories
          </span>
          <h2 className="text-4xl sm:text-5xl font-sans text-gray-900 mb-4">
            Real People.{' '}
            <span className="text-primary">Real Conversations.</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Thousands of professionals are already exchanging knowledge on
            Conferoo every week.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 text-center border border-gray-100 shadow-sm"
            >
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-emerald-100 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} className="text-amber-400 text-sm">
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-600 font-semibold px-2.5 py-1 rounded-full border border-emerald-100">
                  {t.tag}
                </span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-gray-900 font-semibold text-sm">
                    {t.name}
                  </div>
                  <div className="text-xs text-emerald-600 font-medium">
                    {t.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
