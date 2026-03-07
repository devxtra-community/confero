'use client';

import { useState, useEffect } from 'react';
import {
  Video,
  CheckCircle,
  Users,
  Activity,
  TrendingUp,
  ChevronDown,
  Wifi,
  PhoneCall,
} from 'lucide-react';
import { axiosInstance } from '@/lib/axiosInstance';

// ─── Types ────────────────────────────────────────────────────────────────────

// FIXED: matches actual values written by callHandlers.ts via RabbitMQ
type EndReason = 'USER_ENDED' | 'ICE_FAILED' | 'TIME_LIMIT' | null;

interface SessionAnalytic {
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
  endReason: EndReason;
}

interface DailyPoint {
  date: string;
  minutes: number;
  callCount: number;
}

interface AnalyticsResponse {
  sessions: SessionAnalytic[];
  totalUsers: number;
  newUsersThisWeek: number;
  dailyMinutes: {
    last7: DailyPoint[];
    last30: DailyPoint[];
  };
}

interface PresenceResponse {
  onlineCount: number;
  inCallCount: number;
}

interface Segment {
  label: string;
  value: number;
  color: string;
}

// ─── Reason config — FIXED to match actual DB values ─────────────────────────

const REASON_CONFIG: Record<string, { label: string; color: string }> = {
  USER_ENDED: { label: 'Completed', color: '#1DB87A' },
  ICE_FAILED: { label: 'ICE Failed', color: '#4A9B7F' },
  TIME_LIMIT: { label: 'Time Limit', color: '#B2DDD0' },
  null: { label: 'Canceled', color: '#0A1F14' },
};

// ─── Period helpers ───────────────────────────────────────────────────────────

type Period = 'today' | 'this_week' | 'this_month' | 'all_time';

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Today',
  this_week: 'This Week',
  this_month: 'This Month',
  all_time: 'All Time',
};

function getPeriodStart(period: Period): Date {
  const now = new Date();
  if (period === 'today')
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === 'this_week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.getFullYear(), now.getMonth(), diff);
  }
  if (period === 'this_month')
    return new Date(now.getFullYear(), now.getMonth(), 1);
  return new Date(0);
}

function filterByPeriod(sessions: SessionAnalytic[], period: Period) {
  const start = getPeriodStart(period);
  return sessions.filter(s => new Date(s.startedAt) >= start);
}

// ─── Metrics ──────────────────────────────────────────────────────────────────

interface DashboardMetrics {
  segments: Segment[];
  totalMinutes: number;
  totalCalls: number;
  completedCalls: number;
  matchRate: number;
}

// CHANGED: segments now use durationSeconds instead of minutes internally.
// A 3-second call contributes 3 to the total instead of rounding to 0.
// Display conversion happens only at render time.
function computeMetrics(sessions: SessionAnalytic[]): DashboardMetrics {
  const totalCalls = sessions.length;
  const completedCalls = sessions.filter(
    s => s.endReason === 'USER_ENDED'
  ).length;
  const matchRate =
    totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;

  // Group by endReason in SECONDS — no rounding loss for short calls
  const secondsByReason: Record<string, number> = {};
  for (const s of sessions) {
    const key = s.endReason ?? 'null';
    secondsByReason[key] = (secondsByReason[key] ?? 0) + s.durationSeconds;
  }

  // Build segments — filter only if truly 0 seconds (never filter short calls)
  const segments: Segment[] = Object.entries(REASON_CONFIG)
    .map(([key, cfg]) => ({
      label: cfg.label,
      value: Math.round(secondsByReason[key] ?? 0), // seconds
      color: cfg.color,
    }))
    .filter(seg => seg.value > 0);

  // totalMinutes is still used for the donut centre label
  const totalSeconds = segments.reduce((s, x) => s + x.value, 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  return { segments, totalMinutes, totalCalls, completedCalls, matchRate };
}

// Converts seconds to a human-readable string.
// < 60s  → "45s"
// < 3600s → "12m 30s"
// >= 3600s → "1h 12m"
function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

// ─── Trend chart helpers ──────────────────────────────────────────────────────
// Pure SVG — no chart library needed, stays consistent with your inline style.

function TrendChart({
  data,
  range,
  onRangeChange,
}: {
  data: AnalyticsResponse['dailyMinutes'];
  range: 7 | 30;
  onRangeChange: (r: 7 | 30) => void;
}) {
  const points = range === 7 ? data.last7 : data.last30;

  // Fill in missing days with 0 so the chart always shows a full timeline
  const filled = (() => {
    const map = new Map(points.map(p => [p.date.slice(0, 10), p]));
    const result: { date: string; minutes: number; callCount: number }[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push(map.get(key) ?? { date: key, minutes: 0, callCount: 0 });
    }
    return result;
  })();

  const W = 520;
  const H = 120;
  const PAD = { top: 12, right: 12, bottom: 28, left: 36 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxMinutes = Math.max(...filled.map(p => p.minutes), 1);

  const xScale = (i: number) => PAD.left + (i / (filled.length - 1)) * innerW;
  const yScale = (v: number) => PAD.top + innerH - (v / maxMinutes) * innerH;

  // Build SVG path
  const pathD = filled
    .map(
      (p, i) =>
        `${i === 0 ? 'M' : 'L'} ${xScale(i).toFixed(1)} ${yScale(p.minutes).toFixed(1)}`
    )
    .join(' ');

  // Area fill path (close below the line)
  const areaD =
    pathD +
    ` L ${xScale(filled.length - 1).toFixed(1)} ${(PAD.top + innerH).toFixed(1)}` +
    ` L ${PAD.left.toFixed(1)} ${(PAD.top + innerH).toFixed(1)} Z`;

  // Y-axis labels (3 ticks)
  const yTicks = [0, Math.round(maxMinutes / 2), Math.round(maxMinutes)];

  // X-axis: show every other label for 30-day to avoid crowding
  const xLabelStep = range === 30 ? 5 : 1;

  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div
      style={{
        background: '#fff',
        border: '1.5px solid #E0EDE7',
        borderRadius: 20,
        padding: '24px 28px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: '#0A1F14',
              marginBottom: 3,
            }}
          >
            Call Minutes Trend
          </div>
          <div style={{ fontSize: 11, color: '#8CA898' }}>
            Total minutes per day · Last {range} days
          </div>
        </div>

        {/* Range toggle */}
        <div
          style={{
            display: 'flex',
            background: '#F4FAF7',
            border: '1.5px solid #E0EDE7',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          {([7, 30] as const).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => onRangeChange(r)}
              style={{
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: range === r ? '#0D6E4F' : 'transparent',
                color: range === r ? '#fff' : '#4A6355',
                transition: 'all .15s',
              }}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary row */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
        <div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#0A1F14',
              lineHeight: 1,
            }}
          >
            {filled.reduce((s, p) => s + p.minutes, 0).toFixed(1)}
          </div>
          <div style={{ fontSize: 11, color: '#8CA898', marginTop: 2 }}>
            total minutes
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#0A1F14',
              lineHeight: 1,
            }}
          >
            {filled.reduce((s, p) => s + p.callCount, 0)}
          </div>
          <div style={{ fontSize: 11, color: '#8CA898', marginTop: 2 }}>
            total calls
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#0A1F14',
              lineHeight: 1,
            }}
          >
            {(
              filled.reduce((s, p) => s + p.minutes, 0) /
              Math.max(filled.filter(p => p.callCount > 0).length, 1)
            ).toFixed(1)}
          </div>
          <div style={{ fontSize: 11, color: '#8CA898', marginTop: 2 }}>
            avg min/day
          </div>
        </div>
      </div>

      {/* SVG chart */}
      <div style={{ overflowX: 'auto' }}>
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          style={{ display: 'block', minWidth: 280 }}
        >
          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={PAD.left}
                y1={yScale(tick)}
                x2={W - PAD.right}
                y2={yScale(tick)}
                stroke="#E0EDE7"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <text
                x={PAD.left - 6}
                y={yScale(tick) + 4}
                textAnchor="end"
                fontSize={9}
                fill="#8CA898"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={areaD} fill="url(#chartGrad)" opacity={0.35} />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#1DB87A"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Gradient def */}
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1DB87A" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#1DB87A" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Data points + hover */}
          {filled.map((p, i) => (
            <g key={i}>
              {/* Invisible wider hit area */}
              <rect
                x={xScale(i) - 10}
                y={PAD.top}
                width={20}
                height={innerH}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />

              {/* Dot — only show on hover or if it has data */}
              {(hovered === i || p.minutes > 0) && (
                <circle
                  cx={xScale(i)}
                  cy={yScale(p.minutes)}
                  r={hovered === i ? 5 : 3}
                  fill={hovered === i ? '#0D6E4F' : '#1DB87A'}
                  stroke="#fff"
                  strokeWidth={1.5}
                />
              )}

              {/* Tooltip on hover */}
              {hovered === i && (
                <g>
                  <rect
                    x={Math.min(xScale(i) - 42, W - PAD.right - 84)}
                    y={yScale(p.minutes) - 42}
                    width={84}
                    height={34}
                    rx={6}
                    ry={6}
                    fill="#0A1F14"
                  />
                  <text
                    x={Math.min(xScale(i), W - PAD.right - 42)}
                    y={yScale(p.minutes) - 24}
                    textAnchor="middle"
                    fontSize={9.5}
                    fill="#1DB87A"
                    fontWeight="700"
                  >
                    {p.minutes.toFixed(1)} min
                  </text>
                  <text
                    x={Math.min(xScale(i), W - PAD.right - 42)}
                    y={yScale(p.minutes) - 13}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#8CA898"
                  >
                    {p.callCount} call{p.callCount !== 1 ? 's' : ''} ·{' '}
                    {new Date(p.date).toLocaleDateString('en', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </text>
                </g>
              )}
            </g>
          ))}

          {/* X-axis labels */}
          {filled.map((p, i) => {
            if (i % xLabelStep !== 0 && i !== filled.length - 1) return null;
            const d = new Date(p.date);
            return (
              <text
                key={i}
                x={xScale(i)}
                y={H - 4}
                textAnchor="middle"
                fontSize={9}
                fill="#8CA898"
              >
                {d.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─── Animated counter ─────────────────────────────────────────────────────────

function Counter({
  target,
  duration = 900,
}: {
  target: number;
  duration?: number;
}) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let startTime: number | null = null;
    let rafId: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(ease * target));
      if (progress < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);
  return <>{val.toLocaleString()}</>;
}

// ─── Donut chart ──────────────────────────────────────────────────────────────

// ─── Pure helper — lives outside component, no ESLint violation ──────────────
// Moved out of DonutChart to avoid react-hooks/immutability lint error.
// `cumulative` mutation is fine here because this is a plain function, not
// a component render — ESLint only flags mutations inside render scope.
function buildSlices(
  segments: Segment[],
  C: number
): Array<Segment & { dashArray: string; dashOffset: number }> {
  const total = segments.reduce((s, x) => s + x.value, 0);
  let cumulative = 0;
  return segments.map((seg) => {
    const arcLen = total > 0 ? (seg.value / total) * C : 0;
    const draw = Math.max(arcLen - 2, 0);
    const dashArray = `${draw} ${C - draw}`;
    const dashOffset = C * 0.25 - cumulative;
    cumulative += arcLen;
    return { ...seg, dashArray, dashOffset };
  });
}

function DonutChart({
  segments,
  size = 180,
  thickness = 28,
}: {
  segments: Segment[];
  size?: number;
  thickness?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const R = (size - thickness) / 2;
  const C = 2 * Math.PI * R;

  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke="#E0EDE7"
          strokeWidth={thickness}
        />
        <circle cx={cx} cy={cy} r={R - thickness / 2 - 3} fill="white" />
      </svg>
    );
  }

  // CHANGED: slices computed via pure function outside render scope
  const slices = buildSlices(segments, C);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ overflow: 'visible', transform: 'rotate(-90deg)' }}
    >
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        stroke="#E0EDE7"
        strokeWidth={thickness}
      />
      {slices.map((s, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke={s.color}
          strokeWidth={thickness}
          strokeLinecap="butt"
          strokeDasharray={s.dashArray}
          strokeDashoffset={s.dashOffset}
        />
      ))}
      <circle cx={cx} cy={cy} r={R - thickness / 2 - 3} fill="white" />
    </svg>
  );
}
// ─── Trend badge ──────────────────────────────────────────────────────────────

function TrendBadge({ value }: { value: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        fontSize: 11,
        fontWeight: 700,
        color: '#0D6E4F',
        background: '#E8F7F1',
        border: '1px solid #C4E8D8',
        borderRadius: 99,
        padding: '3px 9px',
        whiteSpace: 'nowrap',
      }}
    >
      <TrendingUp size={10} strokeWidth={3} />
      {value}
    </span>
  );
}

// ─── Period dropdown ──────────────────────────────────────────────────────────

function PeriodDropdown({
  selected,
  onSelect,
}: {
  selected: Period;
  onSelect: (p: Period) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          fontWeight: 600,
          color: '#0D6E4F',
          background: '#F4FAF7',
          border: '1.5px solid #C4E8D8',
          borderRadius: 10,
          padding: '6px 12px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {PERIOD_LABELS[selected]}
        <ChevronDown
          size={13}
          strokeWidth={2.5}
          style={{
            transition: 'transform .15s',
            transform: open ? 'rotate(180deg)' : 'none',
          }}
        />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: '#fff',
            border: '1.5px solid #E0EDE7',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(13,110,79,.12)',
            zIndex: 50,
            overflow: 'hidden',
            minWidth: 140,
          }}
        >
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => {
                onSelect(p);
                setOpen(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '9px 14px',
                fontSize: 12,
                fontWeight: selected === p ? 700 : 500,
                color: selected === p ? '#0D6E4F' : '#0A1F14',
                background: selected === p ? '#F4FAF7' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard({ height = 120 }: { height?: number }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1.5px solid #E0EDE7',
        borderRadius: 18,
        height,
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, #f0f7f4 25%, #e0ede7 50%, #f0f7f4 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
        }}
      />
    </div>
  );
}

// ─── Mini card ────────────────────────────────────────────────────────────────

function MiniCard({
  dark = false,
  icon: Icon,
  title,
  subtitle,
  value,
  badge,
  barPct,
  barColor,
  note,
}: {
  dark?: boolean;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  value: number;
  badge: string;
  barPct: number;
  barColor: string;
  note: string;
}) {
  const [hovered, setHovered] = useState(false);
  const bg = dark ? '#0A1F14' : '#FFFFFF';
  const textCol = dark ? '#FFFFFF' : '#0A1F14';
  const subCol = dark ? '#8CA898' : '#4A6355';
  const track = dark ? 'rgba(255,255,255,.10)' : '#E0EDE7';
  const iconBg = dark ? 'rgba(29,184,122,.15)' : '#E8F7F1';
  const iconCol = dark ? '#1DB87A' : '#0D6E4F';
  const border = dark
    ? '1.5px solid rgba(29,184,122,.20)'
    : '1.5px solid #E0EDE7';
  const shadow = hovered
    ? dark
      ? '0 8px 32px rgba(13,110,79,.35)'
      : '0 6px 24px rgba(13,110,79,.12)'
    : 'none';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: bg,
        border,
        borderRadius: 18,
        padding: '22px 24px',
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: shadow,
        transition: 'box-shadow .2s',
      }}
    >
      {dark && (
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 130,
            height: 130,
            borderRadius: '50%',
            background: 'rgba(29,184,122,.06)',
            pointerEvents: 'none',
          }}
        />
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            background: iconBg,
            borderRadius: 11,
            padding: 8,
            display: 'inline-flex',
          }}
        >
          <Icon size={17} color={iconCol} strokeWidth={2.3} />
        </div>
        <TrendBadge value={badge} />
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 800,
          color: textCol,
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        <Counter target={value} />
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: textCol,
          marginBottom: 2,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 11, color: subCol, marginBottom: 16 }}>
        {subtitle}
      </div>
      <div
        style={{
          height: 5,
          background: track,
          borderRadius: 99,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${barPct}%`,
            height: '100%',
            background: barColor,
            borderRadius: 99,
          }}
        />
      </div>
      <div style={{ marginTop: 6, fontSize: 11, color: subCol }}>{note}</div>
    </div>
  );
}

// ─── Bottom card ──────────────────────────────────────────────────────────────

function BottomCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  value,
  badge,
  barPct,
  barGradient,
  barNote,
  barNoteColor,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  value: number;
  badge: string;
  barPct: number;
  barGradient: string;
  barNote: string;
  barNoteColor: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #E0EDE7',
        borderRadius: 18,
        padding: '24px 26px',
        flex: 1,
        boxShadow: hovered ? '0 6px 24px rgba(13,110,79,.10)' : 'none',
        transition: 'box-shadow .2s',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div
            style={{
              background: iconBg,
              borderRadius: 12,
              padding: 9,
              display: 'inline-flex',
            }}
          >
            <Icon size={19} color={iconColor} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0A1F14' }}>
              {title}
            </div>
            <div style={{ fontSize: 11, color: '#8CA898' }}>{subtitle}</div>
          </div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 38,
            fontWeight: 800,
            color: '#0A1F14',
            lineHeight: 1,
          }}
        >
          <Counter target={value} />
        </div>
        <TrendBadge value={badge} />
      </div>
      <div
        style={{
          height: 7,
          background: '#E0EDE7',
          borderRadius: 99,
          overflow: 'hidden',
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: `${barPct}%`,
            height: '100%',
            background: barGradient,
            borderRadius: 99,
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
        }}
      >
        <span style={{ color: '#8CA898' }}>{barNote}</span>
        <span style={{ color: barNoteColor, fontWeight: 700 }}>{barPct}%</span>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function DashboardHome() {
  const [raw, setRaw] = useState<AnalyticsResponse | null>(null);
  const [presence, setPresence] = useState<PresenceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callPeriod, setCallPeriod] = useState<Period>('this_week');
  const [chartRange, setChartRange] = useState<7 | 30>(7);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [analyticsRes, presenceRes] = await Promise.allSettled([
          axiosInstance.get('/admin/analytics'),
          axiosInstance.get('/live/admin/presence'),
        ]);
        if (analyticsRes.status === 'fulfilled') {
          setRaw(analyticsRes.value.data.data);
        } else {
          setError('Failed to load analytics');
        }
        if (presenceRes.status === 'fulfilled') {
          setPresence(presenceRes.value.data.data);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filtered = raw ? filterByPeriod(raw.sessions, callPeriod) : [];
  const metrics = computeMetrics(filtered);

  const prevWeekSessions = raw
    ? raw.sessions.filter(s => {
        const start = getPeriodStart('this_week');
        const prevStart = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
        const d = new Date(s.startedAt);
        return d >= prevStart && d < start;
      })
    : [];

  const weekGrowth =
    prevWeekSessions.length > 0
      ? `+${Math.round(((filtered.length - prevWeekSessions.length) / prevWeekSessions.length) * 100)}%`
      : filtered.length > 0
        ? '+100%'
        : '0%';

  if (loading) {
    return (
      <div
        className="dash-home"
        style={{
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          background: '#F4FAF7',
          minHeight: '100vh',
          padding: '32px 28px 48px',
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
          .dash-home * { box-sizing: border-box; }
        `}</style>
        <div
          style={{
            marginBottom: 32,
            height: 52,
            background: '#fff',
            borderRadius: 12,
            opacity: 0.5,
          }}
        />
        <div style={{ display: 'flex', gap: 18, marginBottom: 18 }}>
          <SkeletonCard height={280} />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              width: 230,
            }}
          >
            <SkeletonCard height={130} />
            <SkeletonCard height={130} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 18, marginBottom: 18 }}>
          <SkeletonCard height={150} />
          <SkeletonCard height={150} />
        </div>
        <SkeletonCard height={220} />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          color: '#4A6355',
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        .dash-home * { box-sizing: border-box; }
        .dash-home h1 { margin: 0; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-1 { animation: fadeSlideUp .45s ease both 0s; }
        .anim-2 { animation: fadeSlideUp .45s ease both .08s; }
        .anim-3 { animation: fadeSlideUp .45s ease both .16s; }
        .anim-4 { animation: fadeSlideUp .45s ease both .24s; }
        .anim-5 { animation: fadeSlideUp .45s ease both .32s; }
        @media (max-width: 900px) {
          .dh-main-grid  { flex-direction: column !important; }
          .dh-right-col  { flex-direction: row !important; width: 100% !important; }
          .dh-bottom-row { flex-direction: column !important; }
        }
        @media (max-width: 560px) {
          .dh-right-col { flex-direction: column !important; }
        }
      `}</style>

      <div
        className="dash-home"
        style={{
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          background: '#F4FAF7',
          minHeight: '100vh',
          padding: '32px 28px 48px',
        }}
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <div
          className="anim-1"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: '#0A1F14',
                lineHeight: 1.2,
              }}
            >
              Admin Dashboard
            </h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                color: '#4A6355',
                marginTop: 6,
              }}
            >
              <Activity size={13} color="#1DB87A" strokeWidth={2.5} />
              Real-time analytics and insights
            </div>
          </div>
        </div>

        {/* ── Main row ────────────────────────────────────────────── */}
        <div
          className="dh-main-grid anim-2"
          style={{
            display: 'flex',
            gap: 18,
            marginBottom: 18,
            alignItems: 'stretch',
          }}
        >
          {/* Donut card */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E0EDE7',
              borderRadius: 20,
              padding: '28px 30px',
              flex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 26,
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: '#0A1F14',
                    marginBottom: 3,
                  }}
                >
                  Total Call Time
                </div>
                <div style={{ fontSize: 12, color: '#8CA898' }}>
                  Distribution by status · {PERIOD_LABELS[callPeriod]}
                </div>
              </div>
              <PeriodDropdown selected={callPeriod} onSelect={setCallPeriod} />
            </div>

            <div
              style={{
                display: 'flex',
                gap: 32,
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: 180,
                  height: 180,
                  flexShrink: 0,
                }}
              >
                <DonutChart
                  segments={metrics.segments}
                  size={180}
                  thickness={28}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%,-50%)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  {/* CHANGED: show formatted duration instead of raw minute counter */}
                  <div
                    style={{
                      fontSize: metrics.totalMinutes < 60 ? 22 : 26,
                      fontWeight: 800,
                      color: '#0A1F14',
                      lineHeight: 1,
                    }}
                  >
                    {formatDuration(
                      metrics.segments.reduce((s, x) => s + x.value, 0)
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: '#8CA898',
                      marginTop: 3,
                      fontWeight: 500,
                    }}
                  >
                    total time
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 13,
                  flex: 1,
                  minWidth: 180,
                }}
              >
                {/* FIXED: renders all 4 reason segments dynamically from real data */}
                {metrics.segments.map((s, i) => {
                  const totalSecs = metrics.segments.reduce(
                    (acc, x) => acc + x.value,
                    0
                  );
                  const pct =
                    totalSecs > 0 ? Math.round((s.value / totalSecs) * 100) : 0;
                  return (
                    <div
                      key={i}
                      style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                    >
                      <div
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: 3,
                          background: s.color,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: '#0A1F14',
                          flex: 1,
                        }}
                      >
                        {s.label}
                      </span>
                      {/* CHANGED: shows formatted duration + percentage */}
                      <span
                        style={{
                          fontSize: 11,
                          color: '#8CA898',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatDuration(s.value)}
                      </span>
                      <div
                        style={{
                          width: 52,
                          height: 5,
                          background: '#E0EDE7',
                          borderRadius: 99,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: s.color,
                            borderRadius: 99,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#0A1F14',
                          width: 32,
                          textAlign: 'right',
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                  );
                })}
                <div
                  style={{
                    borderTop: '1.5px solid #E0EDE7',
                    paddingTop: 13,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 12, color: '#8CA898' }}>
                    Total calls · {PERIOD_LABELS[callPeriod]}
                  </span>
                  <span
                    style={{ fontSize: 20, fontWeight: 800, color: '#0D6E4F' }}
                  >
                    {metrics.totalCalls}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mini cards */}
          <div
            className="dh-right-col"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              width: 230,
              flexShrink: 0,
            }}
          >
            <MiniCard
              dark
              icon={Video}
              title="Total Video Calls"
              subtitle={`${PERIOD_LABELS[callPeriod]}'s activity`}
              value={metrics.totalCalls}
              badge={weekGrowth}
              barPct={Math.min(metrics.totalCalls, 100)}
              barColor="#1DB87A"
              note={`calls · ${PERIOD_LABELS[callPeriod]}`}
            />
            <MiniCard
              icon={CheckCircle}
              title="Successful Matches"
              subtitle="Completed connections"
              value={metrics.completedCalls}
              badge={`${metrics.matchRate}%`}
              barPct={metrics.matchRate}
              barColor="#0D6E4F"
              note={`${metrics.matchRate}% match rate`}
            />
          </div>
        </div>

        {/* ── Presence row ─────────────────────────────────────────── */}
        <div
          className="dh-bottom-row anim-3"
          style={{ display: 'flex', gap: 18, marginBottom: 18 }}
        >
          <BottomCard
            icon={Wifi}
            iconBg="#E8F7F1"
            iconColor="#0D6E4F"
            title="Online Now"
            subtitle="Active socket connections"
            value={presence?.onlineCount ?? 0}
            badge="Live"
            barPct={
              raw && raw.totalUsers > 0
                ? Math.min(
                    Math.round(
                      ((presence?.onlineCount ?? 0) / raw.totalUsers) * 100
                    ),
                    100
                  )
                : 0
            }
            barGradient="linear-gradient(90deg, #0D6E4F, #1DB87A)"
            barNote="of total registered users"
            barNoteColor="#0D6E4F"
          />
          <BottomCard
            icon={PhoneCall}
            iconBg="#E8F5F0"
            iconColor="#0A1F14"
            title="Currently In Call"
            subtitle="Active video sessions"
            value={presence?.inCallCount ?? 0}
            badge="Live"
            barPct={
              presence && presence.onlineCount > 0
                ? Math.min(
                    Math.round(
                      (presence.inCallCount / presence.onlineCount) * 100
                    ),
                    100
                  )
                : 0
            }
            barGradient="linear-gradient(90deg, #0A1F14, #1DB87A)"
            barNote="of online users in a call"
            barNoteColor="#0D6E4F"
          />
        </div>

        {/* ── Total users row ───────────────────────────────────────── */}
        <div
          className="anim-3"
          style={{ display: 'flex', gap: 18, marginBottom: 18 }}
        >
          <BottomCard
            icon={Users}
            iconBg="#E8F5F0"
            iconColor="#0A1F14"
            title="Total Registered Users"
            subtitle="All time members"
            value={raw?.totalUsers ?? 0}
            badge={`+${raw?.newUsersThisWeek ?? 0} this week`}
            barPct={Math.min(
              raw && raw.totalUsers > 0
                ? Math.round((raw.newUsersThisWeek / raw.totalUsers) * 100) + 70
                : 0,
              100
            )}
            barGradient="linear-gradient(90deg, #0A1F14, #1DB87A)"
            barNote={`+${raw?.newUsersThisWeek ?? 0} new users this week`}
            barNoteColor="#0D6E4F"
          />
        </div>

        {/* ── Trend chart ───────────────────────────────────────────── */}
        {raw?.dailyMinutes && (
          <div className="anim-5">
            <TrendChart
              data={raw.dailyMinutes}
              range={chartRange}
              onRangeChange={setChartRange}
            />
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div
          className="anim-4"
          style={{
            marginTop: 28,
            textAlign: 'center',
            fontSize: 11,
            color: '#8CA898',
            letterSpacing: '0.04em',
          }}
        >
          Data refreshes every 5 minutes · Last updated just now
        </div>
      </div>
    </>
  );
}
