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
        <div className="w-screen h-screen bg-[#0d0d0e] flex flex-col overflow-hidden relative">
            {/* Soft background glow */}
            <div
                className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-10 blur-[100px] pointer-events-none"
                style={{ background: 'oklch(0.42 0.11 136)' }}
            />
            <div
                className="absolute bottom-0 right-0 w-56 h-56 rounded-full opacity-[0.06] blur-[80px] pointer-events-none"
                style={{ background: 'oklch(0.72 0.19 149)' }}
            />

            {/* ── Header ── */}
            <header
                className="relative z-10 shrink-0 flex items-center justify-between px-6 py-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
                <button
                    onClick={() => router.push('/home')}
                    className="flex items-center gap-2 text-white/40 hover:text-white/70 text-xs font-mono transition-colors group"
                >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    skip
                </button>

                <div className="flex items-center gap-2">
                    <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{
                            background: 'oklch(0.42 0.11 136 / 0.15)',
                            border: '1px solid oklch(0.42 0.11 136 / 0.3)',
                        }}
                    >
                        <Shield
                            className="w-3.5 h-3.5"
                            style={{ color: 'oklch(0.72 0.19 149)' }}
                            strokeWidth={1.5}
                        />
                    </div>
                    <div>
                        <p className="text-white/80 text-sm font-medium leading-none">
                            Report User
                        </p>
                        <p className="text-white/30 text-[10px] font-mono mt-0.5">
                            anonymous · reviewed within 24h
                        </p>
                    </div>
                </div>

                <div className="w-16" />
            </header>

            {/* ── Body ── */}
            <main className="relative z-10 flex-1 flex flex-col sm:flex-row gap-0 overflow-hidden min-h-0">
                {/* Left — reasons */}
                <div
                    className="shrink-0 sm:w-52 flex flex-col px-4 py-4 gap-2 overflow-y-auto"
                    style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <p className="text-white/35 text-[10px] font-mono uppercase tracking-widest mb-1">
                        Select reason
                    </p>
                    {REASONS.map(r => {
                        const Icon = r.icon;
                        const sel = reason === r.id;
                        return (
                            <button
                                key={r.id}
                                onClick={() => setReason(r.id)}
                                className="w-full text-left rounded-xl px-3 py-2.5 flex items-center gap-2.5 transition-all duration-150 relative overflow-hidden"
                                style={{
                                    background: sel
                                        ? 'oklch(0.42 0.11 136 / 0.12)'
                                        : 'rgba(255,255,255,0.03)',
                                    border: sel
                                        ? '1px solid oklch(0.42 0.11 136 / 0.4)'
                                        : '1px solid rgba(255,255,255,0.07)',
                                }}
                            >
                                {sel && (
                                    <div
                                        className="absolute left-0 top-0 bottom-0 w-0.75 rounded-r-full"
                                        style={{ background: 'oklch(0.72 0.19 149)' }}
                                    />
                                )}
                                <Icon
                                    className="w-3.5 h-3.5 shrink-0 transition-colors"
                                    style={{
                                        color: sel
                                            ? 'oklch(0.72 0.19 149)'
                                            : 'rgba(255,255,255,0.35)',
                                    }}
                                    strokeWidth={1.5}
                                />
                                <span
                                    className="text-xs transition-colors font-light"
                                    style={{
                                        color: sel
                                            ? 'rgba(255,255,255,0.85)'
                                            : 'rgba(255,255,255,0.45)',
                                    }}
                                >
                                    {r.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Right — textarea + submit */}
                <div className="flex-1 flex flex-col px-5 py-4 gap-3 min-h-0 min-w-0">
                    <div className="flex items-center justify-between shrink-0">
                        <p className="text-white/35 text-[10px] font-mono uppercase tracking-widest">
                            Details
                            <span className="text-white/20 normal-case ml-1">(optional)</span>
                        </p>
                        <span className="text-white/20 text-[10px] font-mono">
                            {description.length}/500
                        </span>
                    </div>

                    {/* Textarea — fixed height, no resize */}
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Describe what happened. Your account is protected — this report is fully anonymous."
                        maxLength={500}
                        className="w-full resize-none text-sm font-light leading-relaxed p-4 outline-none rounded-xl transition-all duration-200"
                        style={{
                            height: '160px',
                            background: 'rgba(255,255,255,0.04)',
                            border: description
                                ? '1px solid oklch(0.42 0.11 136 / 0.4)'
                                : '1px solid rgba(255,255,255,0.09)',
                            color: 'rgba(255,255,255,0.7)',
                            caretColor: 'oklch(0.72 0.19 149)',
                        }}
                    />

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Reason reminder if not selected */}
                    {!reason && (
                        <p className="text-white/25 text-xs text-center font-mono">
                            ← pick a reason to continue
                        </p>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleReport}
                        disabled={loading || !reason}
                        className="shrink-0 w-full py-3 rounded-xl text-sm font-light tracking-wide transition-all duration-200"
                        style={{
                            background: reason
                                ? 'linear-gradient(135deg, oklch(0.42 0.11 136), oklch(0.58 0.16 142))'
                                : 'rgba(255,255,255,0.05)',
                            border: reason
                                ? '1px solid oklch(0.42 0.11 136 / 0.5)'
                                : '1px solid rgba(255,255,255,0.07)',
                            color: reason
                                ? 'rgba(255,255,255,0.95)'
                                : 'rgba(255,255,255,0.2)',
                            cursor: reason ? 'pointer' : 'not-allowed',
                        }}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                                Submitting…
                            </span>
                        ) : (
                            'Submit Report'
                        )}
                    </button>

                    <p className="text-center text-white/15 text-[10px] font-mono shrink-0">
                        False reports may result in action against your account
                    </p>
                </div>
            </main>
        </div>
    );
}

export default function ReportPage() {
    return (
        <Suspense
            fallback={
                <div className="w-screen h-screen flex items-center justify-center bg-[#0d0d0e]">
                    <p className="text-white/40 text-sm font-mono">Loading…</p>
                </div>
            }
        >
            <ReportInner />
        </Suspense>
    );
}
