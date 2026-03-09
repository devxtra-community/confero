'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import { axiosInstance } from '@/lib/axiosInstance';
import { toast } from 'sonner';
import {
  Shield,
  AlertTriangle,
  MessageSquare,
  Zap,
  DamIcon,
  ArrowLeft,
  Flag,
  Send,
  CheckCircle2,
} from 'lucide-react';
import axios from 'axios';

const REASONS = [
  {
    id: 'Inappropriate Behavior',
    label: 'Inappropriate Behavior',
    icon: AlertTriangle,
  },
  { id: 'Harassment', label: 'Harassment', icon: MessageSquare },
  { id: 'Hate Speech', label: 'Hate Speech', icon: Zap },
  { id: 'Spam', label: 'Spam or Promotion', icon: DamIcon },
  { id: 'Other', label: 'Other', icon: Flag },
];

function ReportInner() {
  const searchParams = useSearchParams();
  const reportedUserId = searchParams.get('userId');
  const router = useRouter();

  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReport = async () => {
    if (!reportedUserId) return toast.error('Invalid user');
    if (!reason) return toast.error('Please select a reason');
    setLoading(true);
    try {
      await axiosInstance.post('/users/report-user', {
        reportedUserId,
        reason,
        description,
      });
      toast.success('Report submitted');
      router.push('/home');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = err.response?.data?.message;
        if (status === 208) {
          toast.error(message ?? 'Already reported');
          router.push('/home');
        } else {
          toast.error('Failed to submit report');
        }
      } else {
        toast.error('Failed to submit report');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f0] flex flex-col items-center justify-center px-4 py-8 sm:py-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 sm:w-96 h-64 sm:h-96 rounded-full blur-3xl opacity-30 pointer-events-none bg-favor" />
      <div className="absolute bottom-0 right-0 w-56 sm:w-80 h-56 sm:h-80 rounded-full blur-3xl opacity-20 pointer-events-none bg-favor" />

      <div className="w-full max-w-2xl mb-4 sm:mb-5 relative z-10">
        <button
          onClick={() => router.push('/home')}
          className="flex items-center gap-1.5 text-foreground/40 hover:text-foreground/70 text-sm font-sans transition-colors group"
        >
          <ArrowLeft
            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
            strokeWidth={1.5}
          />
          Back to home
        </button>
      </div>

      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl border border-[#e8e8e4] shadow-lg overflow-hidden">
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6 border-b border-[#f0f0ec]">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center shrink-0 border border-primary/20">
              <Shield
                className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-background"
                strokeWidth={2}
              />
            </div>
            <div>
              <h1 className="text-foreground text-lg sm:text-xl font-sans leading-tight tracking-tight">
                Report a User
              </h1>
              <p className="text-foreground/50 text-xs sm:text-sm mt-1 leading-relaxed">
                Anonymous · reviewed by our trust & safety team within 24 hours.
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-8 py-5 sm:py-7 flex flex-col gap-5 sm:gap-6">
          <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-foreground/40 font-sans">
            What&apos;s the issue?
          </p>

          <div className="-mx-5 sm:mx-0 px-5 sm:px-0">
            <div
              className="flex sm:hidden gap-2 overflow-x-auto pb-1 snap-x"
              style={{ scrollbarWidth: 'none' }}
            >
              {REASONS.map(r => {
                const Icon = r.icon;
                const sel = reason === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setReason(r.id)}
                    className={`snap-start shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-semibold transition-all duration-150
                      ${
                        sel
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-foreground/50 border-[#e8e8e4]'
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                    {r.label}
                  </button>
                );
              })}
            </div>

            <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {REASONS.map(r => {
                const Icon = r.icon;
                const sel = reason === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setReason(r.id)}
                    className={`text-left rounded-2xl px-4 py-3.5 flex flex-col gap-2 transition-all duration-150 border font-semibold
                      ${
                        sel
                          ? 'bg-primary border-primary/40'
                          : 'bg-[#fafaf8] border-[#e8e8e4] hover:border-primary/20 hover:bg-favor/30'
                      }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${sel ? 'text-background' : 'text-foreground/30'}`}
                      strokeWidth={1.5}
                    />
                    <span
                      className={`text-xs leading-snug ${sel ? 'text-background' : 'text-foreground/50'}`}
                    >
                      {r.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {reason && (
            <div className="flex sm:hidden items-center gap-2 bg-primary px-3 py-2 rounded-xl border border-primary/20">
              <CheckCircle2
                className="w-3.5 h-3.5 text-background shrink-0"
                strokeWidth={2}
              />
              <span className="text-xs text-background font-semibold">
                {reason}
              </span>
            </div>
          )}

          <div className="h-px bg-[#f0f0ec]" />

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/40">
                Details{' '}
                <span className="normal-case font-normal text-foreground/25">
                  (optional)
                </span>
              </p>
              <span className="text-[10px] text-foreground/25 font-sans">
                {description.length}/300
              </span>
            </div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Briefly describe what happened…"
              maxLength={300}
              rows={3}
              className={`w-full resize-none text-sm font-semibold leading-relaxed p-3.5 sm:p-4 outline-none rounded-xl sm:rounded-2xl transition-all duration-200 placeholder:text-foreground/25 text-foreground bg-[#fafaf8]
                ${description ? 'border border-primary/40' : 'border border-[#e8e8e4] focus:border-primary/30'}`}
            />
          </div>

          <button
            onClick={handleReport}
            disabled={loading || !reason}
            className={`w-full py-3 sm:py-3.5 rounded-full text-sm font-sans flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98]
              ${
                reason
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 cursor-pointer hover:opacity-90'
                  : 'bg-[#e8e8e4] text-foreground/30 cursor-not-allowed'
              }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Send className="w-4 h-4" strokeWidth={2} />
                Submit Report
              </>
            )}
          </button>

          <p className="text-center text-foreground/45 text-[10px] font-semibold -mt-3">
            False reports may result in action against your account
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f4f4f0]">
          <p className="text-foreground/40 text-sm font-sans">Loading…</p>
        </div>
      }
    >
      <ReportInner />
    </Suspense>
  );
}
