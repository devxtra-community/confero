'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Video,
  CheckCircle,
  Users,
  Activity,
  TrendingUp,
  ChevronDown,
  Wifi,
  PhoneCall,
  Clock,
} from 'lucide-react';
import { axiosInstance } from '@/lib/axiosInstance';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Reason config ────────────────────────────────────────────────────────────

const REASON_CONFIG: Record<
  string,
  { label: string; color: string; light: string }
> = {
  USER_ENDED: {
    label: 'Completed',
    color: 'oklch(0.42 0.11 136)',
    light: 'oklch(0.42 0.11 136 / 0.15)',
  },
  ICE_FAILED: {
    label: 'ICE Failed',
    color: 'oklch(0.60 0.14 149)',
    light: 'oklch(0.60 0.14 149 / 0.12)',
  },
  TIME_LIMIT: {
    label: 'Time Limit',
    color: 'oklch(0.72 0.19 149)',
    light: 'oklch(0.72 0.19 149 / 0.12)',
  },
  null: {
    label: 'Canceled',
    color: 'oklch(0.75 0.05 149)',
    light: 'oklch(0.75 0.05 149 / 0.10)',
  },
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

function computeMetrics(sessions: SessionAnalytic[]): DashboardMetrics {
  const totalCalls = sessions.length;
  const completedCalls = sessions.filter(
    s => s.endReason === 'USER_ENDED'
  ).length;
  const matchRate =
    totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;
  const secondsByReason: Record<string, number> = {};
  for (const s of sessions) {
    const key = s.endReason ?? 'null';
    secondsByReason[key] = (secondsByReason[key] ?? 0) + s.durationSeconds;
  }
  const segments: Segment[] = Object.entries(REASON_CONFIG)
    .map(([key, cfg]) => ({
      label: cfg.label,
      value: Math.round(secondsByReason[key] ?? 0),
      color: cfg.color,
    }))
    .filter(seg => seg.value > 0);
  const totalSeconds = segments.reduce((s, x) => s + x.value, 0);
  const totalMinutes = Math.round(totalSeconds / 60);
  return { segments, totalMinutes, totalCalls, completedCalls, matchRate };
}

function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap');

  .dh-wrap {
    font-family: var(--font-sans, sans-serif);
    background: var(--background);
    color: var(--foreground);
    min-height: 100vh;
    padding: 18px 20px 28px;
    --_green:      oklch(0.72 0.19 149);
    --_green-dark: oklch(0.42 0.11 136);
    --_green-mid:  oklch(0.60 0.147 149);
    --_green-bg:   oklch(0.72 0.19 149 / 0.08);
    --_green-bdr:  oklch(0.72 0.19 149 / 0.22);
    --_text2:      var(--muted-foreground);
    --_surface:    var(--card);
    --_border:     var(--border);
    --_radius:     var(--radius, 0.625rem);
  }
  .dark .dh-wrap {
    --_green-bg:  oklch(0.72 0.19 149 / 0.12);
    --_green-bdr: oklch(0.72 0.19 149 / 0.28);
  }
  .dh-wrap * { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes dh-shimmer { from{background-position:200% 0} to{background-position:-200% 0} }
  @keyframes dh-fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes dh-pulse   { 0%,100%{box-shadow:0 0 0 0 oklch(0.72 0.19 149 / 0.5)} 50%{box-shadow:0 0 0 4px oklch(0.72 0.19 149 / 0)} }
  @keyframes dh-colon   { 0%,49%{opacity:1} 50%,100%{opacity:0.2} }
  @keyframes dh-bar     { from{width:0} }

  .dh-a1{animation:dh-fadeUp .45s cubic-bezier(0.22,1,0.36,1) both .04s}
  .dh-a2{animation:dh-fadeUp .45s cubic-bezier(0.22,1,0.36,1) both .10s}
  .dh-a3{animation:dh-fadeUp .45s cubic-bezier(0.22,1,0.36,1) both .16s}
  .dh-a4{animation:dh-fadeUp .45s cubic-bezier(0.22,1,0.36,1) both .22s}
  .dh-a5{animation:dh-fadeUp .45s cubic-bezier(0.22,1,0.36,1) both .28s}

  .dh-card {
    background: var(--_surface);
    border: 1.5px solid var(--_border);
    border-radius: calc(var(--_radius) * 2.5);
    position: relative; overflow: hidden;
    transition: border-color .2s, box-shadow .2s, transform .2s;
  }
  .dh-card:hover {
    border-color: var(--_green-bdr);
    box-shadow: 0 4px 20px oklch(0.72 0.19 149 / 0.09);
    transform: translateY(-1px);
  }
  .dh-card-accent {
    background: linear-gradient(135deg, oklch(0.42 0.11 136 / 0.06) 0%, var(--_surface) 60%);
    border-color: var(--_green-bdr);
  }
  .dark .dh-card-accent {
    background: linear-gradient(135deg, oklch(0.72 0.19 149 / 0.10) 0%, var(--_surface) 60%);
  }

  .dh-label {
    font-family: 'DM Mono', monospace;
    font-size: 9.5px; letter-spacing: .12em;
    text-transform: uppercase; color: var(--_text2);
  }
  .dh-badge {
    display: inline-flex; align-items: center; gap: 3px;
    font-family: 'DM Mono', monospace;
    font-size: 9px; font-weight: 500; letter-spacing: .06em;
    color: var(--_green-dark); background: var(--_green-bg);
    border: 1px solid var(--_green-bdr);
    border-radius: 99px; padding: 2px 8px; white-space: nowrap;
  }
  .dark .dh-badge { color: var(--_green); }

  .dh-live {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: 'DM Mono', monospace;
    font-size: 9px; letter-spacing: .10em;
    color: var(--_green-dark); background: var(--_green-bg);
    border: 1px solid var(--_green-bdr);
    border-radius: 99px; padding: 3px 9px;
  }
  .dark .dh-live { color: var(--_green); }
  .dh-live-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--_green);
    animation: dh-pulse 1.8s ease-in-out infinite; flex-shrink: 0;
  }

  .dh-track { height: 4px; background: oklch(0.72 0.19 149 / 0.10); border-radius: 99px; overflow: hidden; }
  .dh-fill  { height: 100%; border-radius: 99px; background: linear-gradient(90deg,var(--_green-dark),var(--_green)); animation: dh-bar .8s cubic-bezier(0.22,1,0.36,1) both; }
  .dh-hr    { height: 1px; background: var(--_border); }

  .dh-pdrop-btn {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: 'DM Mono', monospace; font-size: 10px;
    letter-spacing: .06em; font-weight: 500;
    color: var(--_green-dark); background: var(--_green-bg);
    border: 1.5px solid var(--_green-bdr);
    border-radius: calc(var(--_radius) * 1.5);
    padding: 5px 10px; cursor: pointer; white-space: nowrap; transition: background .15s;
  }
  .dark .dh-pdrop-btn { color: var(--_green); }
  .dh-pdrop-btn:hover { background: oklch(0.72 0.19 149 / 0.14); }

  .dh-pdrop-menu {
    position: absolute; top: calc(100% + 5px); right: 0;
    background: var(--_surface); border: 1.5px solid var(--_border);
    border-radius: calc(var(--_radius) * 1.8);
    box-shadow: 0 10px 36px oklch(0 0 0 / .11);
    z-index: 100; overflow: hidden; min-width: 138px;
  }
  .dark .dh-pdrop-menu { box-shadow: 0 10px 36px oklch(0 0 0 / .42); }
  .dh-pdrop-opt {
    display: block; width: 100%; text-align: left; padding: 8px 14px;
    font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: .06em;
    border: none; cursor: pointer; transition: background .1s;
    background: transparent; color: var(--_text2);
  }
  .dh-pdrop-opt:hover { background: var(--_green-bg); }
  .dh-pdrop-opt.active { background: var(--_green-bg); color: var(--_green-dark); font-weight: 600; }
  .dark .dh-pdrop-opt.active { color: var(--_green); }

  .dh-range {
    display: flex; background: oklch(0.72 0.19 149 / 0.06);
    border: 1.5px solid var(--_green-bdr);
    border-radius: calc(var(--_radius) * 1.5); overflow: hidden;
  }
  .dh-range-btn {
    padding: 5px 12px;
    font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: .06em;
    border: none; cursor: pointer; transition: background .15s, color .15s;
    background: transparent; color: var(--_text2);
  }
  .dh-range-btn.active { background: var(--_green); color: #fff; }

  .dh-skeleton {
    background: linear-gradient(90deg,
      oklch(0.72 0.19 149 / 0.05) 25%, oklch(0.72 0.19 149 / 0.12) 50%, oklch(0.72 0.19 149 / 0.05) 75%);
    background-size: 200% 100%; animation: dh-shimmer 1.6s infinite;
    border-radius: calc(var(--_radius) * 2);
  }
  .dh-colon { animation: dh-colon 1s step-end infinite; display: inline-block; }

  @media (max-width: 960px) {
    .dh-main-grid { flex-direction: column !important; }
    .dh-right-col { flex-direction: row !important; width: 100% !important; }
    .dh-btm-row   { flex-direction: column !important; }
  }
  @media (max-width: 560px) {
    .dh-right-col { flex-direction: column !important; }
    .dh-wrap      { padding: 12px 12px 24px !important; }
  }
`;

// ─── Live Clock ───────────────────────────────────────────────────────────────

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = now.toLocaleDateString('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'oklch(0.72 0.19 149 / 0.08)',
        border: '1.5px solid oklch(0.72 0.19 149 / 0.22)',
        borderRadius: 'calc(var(--radius, 0.625rem) * 1.8)',
        padding: '6px 13px',
      }}
    >
      <Clock
        size={12}
        style={{ color: 'oklch(0.42 0.11 136)', flexShrink: 0 }}
        strokeWidth={2}
      />
      <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1 }}>
        <span
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: 18,
            fontWeight: 500,
            color: 'var(--foreground)',
            letterSpacing: '0.04em',
          }}
        >
          {pad(now.getHours())}
        </span>
        <span
          className="dh-colon"
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: 18,
            fontWeight: 300,
            color: 'oklch(0.72 0.19 149)',
            padding: '0 1px',
          }}
        >
          :
        </span>
        <span
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: 18,
            fontWeight: 500,
            color: 'var(--foreground)',
            letterSpacing: '0.04em',
          }}
        >
          {pad(now.getMinutes())}
        </span>
        <span
          className="dh-colon"
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: 18,
            fontWeight: 300,
            color: 'oklch(0.72 0.19 149 / 0.5)',
            padding: '0 1px',
          }}
        >
          :
        </span>
        <span
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: 12,
            fontWeight: 400,
            color: 'oklch(0.72 0.19 149)',
            letterSpacing: '0.04em',
            alignSelf: 'flex-end',
            paddingBottom: '1px',
          }}
        >
          {pad(now.getSeconds())}
        </span>
      </div>
      <div
        style={{
          width: 1,
          height: 16,
          background: 'oklch(0.72 0.19 149 / 0.2)',
        }}
      />
      <span className="dh-label" style={{ fontSize: 8.5 }}>
        {date}
      </span>
    </div>
  );
}

// ─── Counter ──────────────────────────────────────────────────────────────────

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
      const p = Math.min((ts - startTime) / duration, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);
  return <>{val.toLocaleString()}</>;
}

// ─── Donut ────────────────────────────────────────────────────────────────────

function buildSlices(segments: Segment[], C: number) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  let cum = 0;
  return segments.map(seg => {
    const arcLen = total > 0 ? (seg.value / total) * C : 0;
    const draw = Math.max(arcLen - 2, 0);
    const dashOffset = C * 0.25 - cum;
    cum += arcLen;
    return { ...seg, dashArray: `${draw} ${C - draw}`, dashOffset };
  });
}

function DonutChart({
  segments,
  size = 160,
  thickness = 22,
}: {
  segments: Segment[];
  size?: number;
  thickness?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const cx = size / 2,
    cy = size / 2,
    R = (size - thickness) / 2,
    C = 2 * Math.PI * R;
  if (total === 0)
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke="oklch(0.72 0.19 149 / 0.10)"
          strokeWidth={thickness}
        />
      </svg>
    );
  const slices = buildSlices(segments, C);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ overflow: 'visible', transform: 'rotate(-90deg)' }}
    >
      <defs>
        <filter id="dh-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        stroke="oklch(0.72 0.19 149 / 0.08)"
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
          filter={i === 0 ? 'url(#dh-glow)' : undefined}
        />
      ))}
      <circle cx={cx} cy={cy} r={R - thickness / 2 - 2} fill="var(--card)" />
    </svg>
  );
}

// ─── Period Dropdown ──────────────────────────────────────────────────────────

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
        className="dh-pdrop-btn"
        onClick={() => setOpen(o => !o)}
      >
        {PERIOD_LABELS[selected]}
        <ChevronDown
          size={10}
          strokeWidth={2.5}
          style={{
            transition: 'transform .15s',
            transform: open ? 'rotate(180deg)' : 'none',
          }}
        />
      </button>
      {open && (
        <div className="dh-pdrop-menu">
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button
              key={p}
              type="button"
              className={`dh-pdrop-opt${selected === p ? ' active' : ''}`}
              onClick={() => {
                onSelect(p);
                setOpen(false);
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

// ─── Trend Chart ──────────────────────────────────────────────────────────────

function TrendChart({
  data,
  range,
  onRangeChange,
}: {
  data: AnalyticsResponse['dailyMinutes'];
  range: 7 | 30;
  onRangeChange: (r: 7 | 30) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const filled = useMemo(() => {
    const points = range === 7 ? data.last7 : data.last30;
    const map = new Map(points.map(p => [p.date.slice(0, 10), p]));
    const result: { date: string; minutes: number; callCount: number }[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push(map.get(key) ?? { date: key, minutes: 0, callCount: 0 });
    }
    return result;
  }, [data, range]);

  const W = 520,
    H = 110;
  const PAD = { top: 12, right: 12, bottom: 28, left: 36 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const maxMinutes = Math.max(...filled.map(p => p.minutes), 1);
  const xScale = (i: number) => PAD.left + (i / (filled.length - 1)) * innerW;
  const yScale = (v: number) => PAD.top + innerH - (v / maxMinutes) * innerH;
  const pathD = filled
    .map(
      (p, i) =>
        `${i === 0 ? 'M' : 'L'} ${xScale(i).toFixed(1)} ${yScale(p.minutes).toFixed(1)}`
    )
    .join(' ');
  const areaD =
    pathD +
    ` L ${xScale(filled.length - 1).toFixed(1)} ${(PAD.top + innerH).toFixed(1)} L ${PAD.left.toFixed(1)} ${(PAD.top + innerH).toFixed(1)} Z`;
  const yTicks = [0, Math.round(maxMinutes / 2), Math.round(maxMinutes)];
  const xLabelStep = range === 30 ? 5 : 1;
  const totalMins = filled.reduce((s, p) => s + p.minutes, 0);
  const totalCalls = filled.reduce((s, p) => s + p.callCount, 0);
  const avgMinDay = (
    totalMins / Math.max(filled.filter(p => p.callCount > 0).length, 1)
  ).toFixed(1);

  return (
    <div className="dh-card" style={{ padding: '16px 20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div>
          <div className="dh-label" style={{ marginBottom: 3 }}>
            Call Minutes Trend
          </div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>
            Last {range} days overview
          </div>
        </div>
        <div className="dh-range">
          {([7, 30] as const).map(r => (
            <button
              key={r}
              type="button"
              className={`dh-range-btn${range === r ? ' active' : ''}`}
              onClick={() => onRangeChange(r)}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
        {[
          { label: 'Total Minutes', value: totalMins.toFixed(1) },
          { label: 'Total Calls', value: String(totalCalls) },
          { label: 'Avg Min / Day', value: avgMinDay },
        ].map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>
              {s.value}
            </div>
            <div className="dh-label" style={{ marginTop: 3 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          style={{ display: 'block', minWidth: 260 }}
        >
          <defs>
            <linearGradient id="dh-cg" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="oklch(0.72 0.19 149)"
                stopOpacity={0.22}
              />
              <stop
                offset="100%"
                stopColor="oklch(0.72 0.19 149)"
                stopOpacity={0}
              />
            </linearGradient>
            <filter id="dh-lglow">
              <feGaussianBlur stdDeviation="1.5" result="b" />
              <feComposite in="SourceGraphic" in2="b" operator="over" />
            </filter>
          </defs>
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={PAD.left}
                y1={yScale(tick)}
                x2={W - PAD.right}
                y2={yScale(tick)}
                stroke="oklch(0.72 0.19 149 / 0.10)"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 6}
                y={yScale(tick) + 4}
                textAnchor="end"
                fontSize={8}
                fill="var(--muted-foreground)"
                fontFamily="'DM Mono',monospace"
              >
                {tick}
              </text>
            </g>
          ))}
          <path d={areaD} fill="url(#dh-cg)" />
          <path
            d={pathD}
            fill="none"
            stroke="oklch(0.72 0.19 149)"
            strokeWidth={1.8}
            strokeLinejoin="round"
            strokeLinecap="round"
            filter="url(#dh-lglow)"
          />
          {filled.map((p, i) => (
            <g key={i}>
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
              {(hovered === i || p.minutes > 0) && (
                <circle
                  cx={xScale(i)}
                  cy={yScale(p.minutes)}
                  r={hovered === i ? 4 : 2.5}
                  fill={
                    hovered === i
                      ? 'oklch(0.42 0.11 136)'
                      : 'oklch(0.72 0.19 149)'
                  }
                  stroke="var(--card)"
                  strokeWidth={1.5}
                />
              )}
              {hovered === i && (
                <g>
                  <rect
                    x={Math.min(xScale(i) - 42, W - PAD.right - 84)}
                    y={yScale(p.minutes) - 42}
                    width={84}
                    height={32}
                    rx={6}
                    fill="var(--card)"
                    stroke="oklch(0.72 0.19 149 / 0.25)"
                    strokeWidth={1}
                  />
                  <text
                    x={Math.min(xScale(i), W - PAD.right - 42)}
                    y={yScale(p.minutes) - 25}
                    textAnchor="middle"
                    fontSize={9.5}
                    fill="oklch(0.42 0.11 136)"
                    fontWeight="700"
                    fontFamily="'DM Mono',monospace"
                  >
                    {p.minutes.toFixed(1)} min
                  </text>
                  <text
                    x={Math.min(xScale(i), W - PAD.right - 42)}
                    y={yScale(p.minutes) - 14}
                    textAnchor="middle"
                    fontSize={8.5}
                    fill="var(--muted-foreground)"
                    fontFamily="'DM Mono',monospace"
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
          {filled.map((p, i) => {
            if (i % xLabelStep !== 0 && i !== filled.length - 1) return null;
            return (
              <text
                key={i}
                x={xScale(i)}
                y={H - 3}
                textAnchor="middle"
                fontSize={8}
                fill="var(--muted-foreground)"
                fontFamily="'DM Mono',monospace"
              >
                {new Date(p.date).toLocaleDateString('en', {
                  month: 'short',
                  day: 'numeric',
                })}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard({ height = 100 }: { height?: number }) {
  return <div className="dh-skeleton" style={{ height, flex: 1 }} />;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  accent = false,
  icon: Icon,
  label,
  sublabel,
  value,
  badge,
  barPct,
  note,
}: {
  accent?: boolean;
  icon: React.ElementType;
  label: string;
  sublabel: string;
  value: number;
  badge: string;
  barPct: number;
  note: string;
}) {
  return (
    <div
      className={`dh-card${accent ? ' dh-card-accent' : ''}`}
      style={{ flex: 1, padding: '14px 16px' }}
    >
      {accent && (
        <div
          style={{
            position: 'absolute',
            top: -28,
            right: -28,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, oklch(0.72 0.19 149 / 0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 'calc(var(--radius, 0.625rem) * 1.3)',
            background: 'oklch(0.72 0.19 149 / 0.10)',
            border: '1.5px solid oklch(0.72 0.19 149 / 0.20)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            size={14}
            style={{ color: 'oklch(0.42 0.11 136)' }}
            strokeWidth={2.2}
          />
        </div>
        <span className="dh-badge">
          <TrendingUp size={8} strokeWidth={3} /> {badge}
        </span>
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          lineHeight: 1,
          marginBottom: 3,
          color: accent ? 'oklch(0.42 0.11 136)' : 'var(--foreground)',
        }}
      >
        <Counter target={value} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 1 }}>
        {label}
      </div>
      <div className="dh-label" style={{ marginBottom: 10 }}>
        {sublabel}
      </div>
      <div className="dh-track">
        <div className="dh-fill" style={{ width: `${barPct}%` }} />
      </div>
      <div className="dh-label" style={{ marginTop: 5 }}>
        {note}
      </div>
    </div>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  sublabel,
  value,
  live,
  barPct,
  barNote,
  barPct2,
}: {
  icon: React.ElementType;
  label: string;
  sublabel: string;
  value: number;
  live?: boolean;
  barPct: number;
  barNote: string;
  barPct2: number;
}) {
  return (
    <div className="dh-card" style={{ flex: 1, padding: '14px 18px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 10,
        }}
      >
        <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 'calc(var(--radius, 0.625rem) * 1.6)',
              background: 'oklch(0.72 0.19 149 / 0.08)',
              border: '1.5px solid oklch(0.72 0.19 149 / 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon
              size={15}
              style={{ color: 'oklch(0.42 0.11 136)' }}
              strokeWidth={2}
            />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
            <div className="dh-label" style={{ marginTop: 1 }}>
              {sublabel}
            </div>
          </div>
        </div>
        {live ? (
          <span className="dh-live">
            <span className="dh-live-dot" /> LIVE
          </span>
        ) : (
          <span className="dh-badge">
            <TrendingUp size={8} strokeWidth={3} /> All time
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: 36,
          fontWeight: 800,
          lineHeight: 1,
          marginBottom: 12,
        }}
      >
        <Counter target={value} />
      </div>
      <div className="dh-track" style={{ height: 5 }}>
        <div className="dh-fill" style={{ width: `${barPct}%` }} />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 5,
        }}
      >
        <span className="dh-label">{barNote}</span>
        <span
          style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: 10,
            fontWeight: 600,
            color: 'oklch(0.42 0.11 136)',
          }}
        >
          {barPct2}%
        </span>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardHome() {
  const [raw, setRaw] = useState<AnalyticsResponse | null>(null);
  const [presence, setPresence] = useState<PresenceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callPeriod, setCallPeriod] = useState<Period>('this_week');
  const [chartRange, setChartRange] = useState<7 | 30>(7);
  const [periodChanging, setPeriodChanging] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [analyticsRes, presenceRes] = await Promise.allSettled([
          axiosInstance.get('/admin/analytics'),
          axiosInstance.get('/live/admin/presence'),
        ]);
        if (analyticsRes.status === 'fulfilled')
          setRaw(analyticsRes.value.data.data);
        else setError('Failed to load analytics');
        if (presenceRes.status === 'fulfilled')
          setPresence(presenceRes.value.data.data);
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

  if (loading)
    return (
      <div className="dh-wrap">
        <style>{GLOBAL_CSS}</style>
        <div style={{ height: 48, marginBottom: 16 }} className="dh-skeleton" />
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <SkeletonCard height={240} />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              width: 220,
            }}
          >
            <SkeletonCard height={112} />
            <SkeletonCard height={112} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <SkeletonCard height={120} />
          <SkeletonCard height={120} />
        </div>
        <SkeletonCard height={190} />
      </div>
    );

  if (error)
    return (
      <div
        className="dh-wrap"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <style>{GLOBAL_CSS}</style>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 36,
              marginBottom: 8,
              color: 'oklch(0.72 0.19 149)',
              opacity: 0.5,
            }}
          >
            ⚠
          </div>
          <div className="dh-label">{error}</div>
        </div>
      </div>
    );

  const onlineBarPct =
    raw && raw.totalUsers > 0
      ? Math.min(
          Math.round(((presence?.onlineCount ?? 0) / raw.totalUsers) * 100),
          100
        )
      : 0;
  const inCallBarPct =
    presence && presence.onlineCount > 0
      ? Math.min(
          Math.round((presence.inCallCount / presence.onlineCount) * 100),
          100
        )
      : 0;
  const usersBarPct =
    raw && raw.totalUsers > 0
      ? Math.min(
          Math.round((raw.newUsersThisWeek / raw.totalUsers) * 100) + 70,
          100
        )
      : 0;

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="dh-wrap">
        {/* Header */}
        <div
          className="dh-a1"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 18,
          }}
        >
          <div>
            <div className="dh-label" style={{ marginBottom: 5 }}>
              <span style={{ color: 'oklch(0.72 0.19 149)', marginRight: 6 }}>
                ◆
              </span>
              Platform Intelligence
            </div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              Admin Dashboard
            </h1>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <LiveClock />
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Activity
                size={11}
                style={{ color: 'oklch(0.72 0.19 149)' }}
                strokeWidth={2.5}
              />
              <span className="dh-label">Real-time analytics</span>
            </div>
          </div>
        </div>

        {/* Main row */}
        <div
          className="dh-main-grid dh-a2"
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 12,
            alignItems: 'stretch',
          }}
        >
          {/* Donut card */}
          <div className="dh-card" style={{ flex: 1, padding: '18px 22px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 16,
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div>
                <div className="dh-label" style={{ marginBottom: 3 }}>
                  Call Time Distribution
                </div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>
                  Total Call Time
                </div>
              </div>
              <PeriodDropdown
                selected={callPeriod}
                onSelect={p => {
                  setPeriodChanging(true);
                  setTimeout(() => {
                    setCallPeriod(p);
                    setPeriodChanging(false);
                  }, 150);
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                gap: 24,
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'center',
                opacity: periodChanging ? 0 : 1,
                transition: 'opacity .15s',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: 160,
                  height: 160,
                  flexShrink: 0,
                }}
              >
                <DonutChart
                  segments={metrics.segments}
                  size={160}
                  thickness={22}
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
                  <div
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: metrics.totalMinutes < 60 ? 15 : 17,
                      fontWeight: 600,
                      color: 'oklch(0.42 0.11 136)',
                      lineHeight: 1,
                    }}
                  >
                    {formatDuration(
                      metrics.segments.reduce((s, x) => s + x.value, 0)
                    )}
                  </div>
                  <div
                    className="dh-label"
                    style={{ marginTop: 3, fontSize: 8 }}
                  >
                    total time
                  </div>
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  minWidth: 160,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 9,
                }}
              >
                {metrics.segments.map((s, i) => {
                  const totalSecs = metrics.segments.reduce(
                    (a, x) => a + x.value,
                    0
                  );
                  const pct =
                    totalSecs > 0 ? Math.round((s.value / totalSecs) * 100) : 0;
                  return (
                    <div
                      key={i}
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 2,
                          background: s.color,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>
                        {s.label}
                      </span>
                      <span
                        style={{
                          fontFamily: "'DM Mono',monospace",
                          fontSize: 9.5,
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        {formatDuration(s.value)}
                      </span>
                      <div
                        style={{
                          width: 44,
                          height: 3,
                          background: 'oklch(0.72 0.19 149 / 0.10)',
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
                          fontFamily: "'DM Mono',monospace",
                          fontSize: 10,
                          fontWeight: 700,
                          color: 'var(--foreground)',
                          width: 28,
                          textAlign: 'right',
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                  );
                })}
                <div className="dh-hr" style={{ marginTop: 3 }} />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span className="dh-label">
                    Total calls · {PERIOD_LABELS[callPeriod]}
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: 20,
                      fontWeight: 700,
                      color: 'oklch(0.42 0.11 136)',
                    }}
                  >
                    {metrics.totalCalls}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right mini cards */}
          <div
            className="dh-right-col"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              width: 220,
              flexShrink: 0,
              opacity: periodChanging ? 0 : 1,
              transition: 'opacity .15s',
            }}
          >
            <StatCard
              accent
              icon={Video}
              label="Total Video Calls"
              sublabel={`${PERIOD_LABELS[callPeriod]}'s activity`}
              value={metrics.totalCalls}
              badge={weekGrowth}
              barPct={Math.min(metrics.totalCalls, 100)}
              note={`calls · ${PERIOD_LABELS[callPeriod]}`}
            />
            <StatCard
              icon={CheckCircle}
              label="Successful Matches"
              sublabel="Completed connections"
              value={metrics.completedCalls}
              badge={`${metrics.matchRate}%`}
              barPct={metrics.matchRate}
              note={`${metrics.matchRate}% match rate`}
            />
          </div>
        </div>

        {/* Presence row */}
        <div
          className="dh-btm-row dh-a3"
          style={{ display: 'flex', gap: 12, marginBottom: 12 }}
        >
          <MetricCard
            icon={Wifi}
            label="Online Now"
            sublabel="Active socket connections"
            value={presence?.onlineCount ?? 0}
            live
            barPct={onlineBarPct}
            barNote="of total registered users"
            barPct2={onlineBarPct}
          />
          <MetricCard
            icon={PhoneCall}
            label="Currently In Call"
            sublabel="Active video sessions"
            value={presence?.inCallCount ?? 0}
            live
            barPct={inCallBarPct}
            barNote="of online users in a call"
            barPct2={inCallBarPct}
          />
        </div>

        {/* Users row */}
        <div
          className="dh-a4"
          style={{ display: 'flex', gap: 12, marginBottom: 12 }}
        >
          <MetricCard
            icon={Users}
            label="Total Registered Users"
            sublabel="All time members"
            value={raw?.totalUsers ?? 0}
            barPct={usersBarPct}
            barNote={`+${raw?.newUsersThisWeek ?? 0} new users this week`}
            barPct2={Math.min(
              raw && raw.totalUsers > 0
                ? Math.round((raw.newUsersThisWeek / raw.totalUsers) * 100)
                : 0,
              100
            )}
          />
        </div>

        {/* Trend chart */}
        {raw?.dailyMinutes && (
          <div className="dh-a5">
            <TrendChart
              data={raw.dailyMinutes}
              range={chartRange}
              onRangeChange={setChartRange}
            />
          </div>
        )}

        {/* Footer */}
        <div
          className="dh-a5"
          style={{
            marginTop: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: 'oklch(0.72 0.19 149)',
              display: 'inline-block',
              animation: 'dh-pulse 2s ease-in-out infinite',
            }}
          />
          <span className="dh-label">
            Data refreshes every 5 minutes · Last updated just now
          </span>
        </div>
      </div>
    </>
  );
}
