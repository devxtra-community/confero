'use client';

import { motion } from 'framer-motion';
import { VideoOff } from 'lucide-react';

import { useRouter } from 'next/navigation';
const MotionVideoOff = motion.create(VideoOff);

export default function ErrorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-linear-to-br from-favor/5 via-background to-primary/5" />

      <div className="relative z-10 max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center space-y-8"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block"
          >
            <div className="relative flex justify-center">
              <MotionVideoOff
                className="w-24 h-24 text-primary"
                strokeWidth={1.5}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h1 className="text-8xl md:text-9xl font-mono  text-foreground tracking-tight">
              404
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-3"
          >
            <h2 className="text-3xl md:text-4xl font-mono text-foreground">
              Page Not Found
            </h2>
            <p className="text-lg text-foreground/60 font-mono max-w-xl mx-auto">
              This meeting room doesn&apos;t exist or may have ended.
            </p>
          </motion.div>
          

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              onClick={() => router.push('/')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-favor text-background font-mono rounded-lg hover:bg-primary transition-colors"
            >
              Return Home
            </motion.button>

            <motion.button
              onClick={() => router.back()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-transparent text-foreground font-mono rounded-lg border-2 border-foreground/10 hover:border-primary/30 transition-colors"
            >
              Go Back
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
