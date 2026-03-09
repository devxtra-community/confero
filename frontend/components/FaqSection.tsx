'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: 'What exactly is Conferoo?',
    answer:
      "Conferoo is a real-time platform where professionals connect face-to-face via HD video and voice to share knowledge, experiences, and insights. Think of it as finding a professional partner who's been exactly where you want to go — and having a real conversation with them, not just reading their LinkedIn post.",
  },
  {
    question: 'Who is Conferoo for?',
    answer:
      "Conferoo is for professionals at any stage — whether you're a senior engineer wanting to share hard-won lessons, an early-career designer looking for industry guidance, or a founder who wants to exchange experiences with someone who's built before. If you have knowledge to share or gaps you want to fill, Conferoo is for you.",
  },
  {
    question: 'Do I need to download anything to use Conferoo?',
    answer:
      'Not at all. Conferoo runs entirely in your browser using WebRTC technology. Just sign up, find a partner, and click to connect — HD video and voice starts instantly with no plugins, no apps, and no installs required.',
  },
  {
    question: 'How does Conferoo match me with the right professional partner?',
    answer:
      "You can filter professionals by industry, role, skills, and the topics they want to discuss. Every profile shows what someone offers to share and what they're looking to learn — making it easy to find someone whose experience genuinely aligns with your goals.",
  },
  {
    question: 'Is my conversation private?',
    answer:
      'Yes. Conferoo uses peer-to-peer WebRTC media streaming, which means your video and voice data travels directly between you and your partner — not through our servers. Your conversations are private by default, with no recording unless both parties explicitly choose it.',
  },
  {
    question: 'Is Conferoo free to use?',
    answer:
      'Conferoo offers a free tier that lets you create your profile, browse partners, and join sessions. Premium plans unlock unlimited session history, advanced discovery filters, and priority visibility in the partner feed. No credit card required to get started.',
  },
  {
    question: 'What makes Conferoo different from LinkedIn or Zoom?',
    answer:
      'LinkedIn is a broadcast platform — you post content and hope someone reads it. Zoom is a meeting tool — you still have to find your own participants. Conferoo is specifically designed for meaningful, structured knowledge exchange between professionals. The discovery, the context, and the conversation all happen in one place.',
  },
];

function FAQItem({
  faq,
  index,
  isOpen,
  onToggle,
}: {
  faq: (typeof faqs)[0];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
        isOpen
          ? 'border-emerald-200 bg-emerald-50/50 shadow-sm'
          : 'border-gray-100 bg-white hover:border-emerald-100'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left gap-4"
      >
        <span
          className={`font-semibold text-sm sm:text-base leading-snug ${isOpen ? 'text-emerald-700' : 'text-gray-900'}`}
        >
          {faq.question}
        </span>
        <div
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${isOpen ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'}`}
        >
          {isOpen ? <Minus size={14} /> : <Plus size={14} />}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <p className="px-5 sm:px-6 pb-5 text-gray-600 text-sm leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      className="py-15 bg-white relative overflow-hidden bg-snow"
      id="faq"
    >
      <div className="absolute top-0 right-0 w-125 h-125 bg-emerald-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-teal-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/3" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 tracking-wide uppercase">
            FAQ
          </span>
          <h2 className="text-4xl sm:text-5xl font-sans text-gray-900 mb-4">
            Got Questions?{' '}
            <span className="text-primary">We&apos;ve Got Answers.</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Everything you need to know about Conferoo before your first
            connection.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-gray-500 text-sm">
            Still have questions?{' '}
            <a
              href="mailto:hello@conferoo.com"
              className="text-emerald-600 font-semibold hover:underline"
            >
              Reach out to our team →
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
