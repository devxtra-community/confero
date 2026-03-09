'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { axiosInstance } from '@/lib/axiosInstance';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface CallRecord {
  id: string;
  userA: string;
  userB: string;
  duration: string;
  status: 'Completed' | 'Canceled';
}

interface SessionResponse {
  sessionId: string;
  userA: { fullName: string };
  userB: { fullName: string };
  startedAt: string;
  endedAt?: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const LIMIT = 10;

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap');

  .cp-wrap {
    font-family: var(--font-sans, sans-serif);
    background: var(--background);
    color: var(--foreground);
    min-height: 100vh;
    padding: 18px 20px 36px;
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
  .dark .cp-wrap {
    --_green-bg:  oklch(0.72 0.19 149 / 0.12);
    --_green-bdr: oklch(0.72 0.19 149 / 0.28);
  }
  .cp-wrap * { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes cp-fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes cp-shimmer { from { background-position:200% 0; } to { background-position:-200% 0; } }
  @keyframes cp-pulse   { 0%,100%{box-shadow:0 0 0 0 oklch(0.72 0.19 149 / 0.5)} 50%{box-shadow:0 0 0 4px oklch(0.72 0.19 149 / 0)} }

  .cp-a1 { animation: cp-fadeUp .4s cubic-bezier(0.22,1,0.36,1) both .03s; }
  .cp-a2 { animation: cp-fadeUp .4s cubic-bezier(0.22,1,0.36,1) both .09s; }
  .cp-a3 { animation: cp-fadeUp .4s cubic-bezier(0.22,1,0.36,1) both .15s; }

  /* ── Card ── */
  .cp-card {
    background: var(--_surface);
    border: 1.5px solid var(--_border);
    border-radius: calc(var(--_radius) * 2.5);
    position: relative; overflow: hidden;
  }

  /* ── Session row ── */
  .cp-row {
    background: var(--_surface);
    border: 1.5px solid var(--_border);
    border-radius: calc(var(--_radius) * 2);
    position: relative; overflow: hidden;
    transition: border-color .18s, box-shadow .18s, transform .18s;
    animation: cp-fadeUp .38s cubic-bezier(0.22,1,0.36,1) both;
  }
  .cp-row:hover {
    border-color: var(--_green-bdr);
    box-shadow: 0 6px 24px oklch(0.72 0.19 149 / 0.08);
    transform: translateY(-1px);
  }
  .cp-row::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
    background: linear-gradient(180deg, var(--_green-dark), var(--_green));
    border-radius: 99px 0 0 99px;
    transform: scaleY(0); transform-origin: center;
    transition: transform .2s cubic-bezier(0.22,1,0.36,1);
  }
  .cp-row:hover::before { transform: scaleY(1); }

  /* ── Label ── */
  .cp-label {
    font-family: 'DM Mono', monospace;
    font-size: 9.5px; letter-spacing: .12em;
    text-transform: uppercase; color: var(--_text2);
  }

  /* ── Status pill ── */
  .cp-status {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: 'DM Mono', monospace;
    font-size: 9px; letter-spacing: .08em;
    border-radius: 99px; padding: 3px 9px;
  }
  .cp-status-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
  .cp-status-ok  { background: oklch(0.72 0.19 149 / 0.10); border: 1px solid oklch(0.72 0.19 149 / 0.25); color: var(--_green-dark); }
  .cp-status-err { background: oklch(0.65 0.22 25  / 0.10); border: 1px solid oklch(0.65 0.22 25  / 0.25); color: oklch(0.55 0.20 25); }
  .dark .cp-status-ok  { color: var(--_green); }
  .dark .cp-status-err { color: oklch(0.72 0.19 25); }

  /* ── Live dot ── */
  .cp-live-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--_green);
    animation: cp-pulse 1.8s ease-in-out infinite; flex-shrink: 0;
  }

  /* ── Avatar (initials only) ── */
  .cp-avatar {
    width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
    border: 1.5px solid var(--_green-bdr);
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500; color: #fff;
  }

  /* ── Duration chip ── */
  .cp-duration {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: 'DM Mono', monospace; font-size: 12px; font-weight: 500; letter-spacing: .04em;
    padding: 5px 10px; border-radius: calc(var(--_radius) * 1.5);
    background: oklch(0.72 0.19 149 / 0.07);
    border: 1.5px solid oklch(0.72 0.19 149 / 0.15);
    color: var(--foreground); white-space: nowrap;
  }

  /* ── Input ── */
  .cp-input {
    width: 100%; padding: 8px 12px 8px 34px;
    font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: .04em;
    background: var(--_surface); color: var(--foreground);
    border: 1.5px solid var(--_border);
    border-radius: calc(var(--_radius) * 1.8);
    outline: none; transition: border-color .15s, box-shadow .15s;
  }
  .cp-input:focus {
    border-color: var(--_green-bdr);
    box-shadow: 0 0 0 3px oklch(0.72 0.19 149 / 0.10);
  }
  .cp-input::placeholder { color: var(--_text2); opacity: 0.6; }

  /* ── Pagination button ── */
  .cp-pg {
    display: inline-flex; align-items: center; justify-content: center;
    width: 32px; height: 32px;
    border-radius: calc(var(--_radius) * 1.2);
    font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: .04em;
    border: 1.5px solid var(--_border); background: var(--_surface);
    color: var(--_text2); cursor: pointer;
    transition: border-color .15s, color .15s, background .15s;
  }
  .cp-pg:hover:not(:disabled) {
    border-color: var(--_green-bdr); color: var(--_green-dark); background: var(--_green-bg);
  }
  .dark .cp-pg:hover:not(:disabled) { color: var(--_green); }
  .cp-pg.active {
    background: linear-gradient(135deg, var(--_green-dark), var(--_green-mid));
    color: #fff; border-color: transparent;
  }
  .cp-pg:disabled { opacity: 0.3; cursor: not-allowed; }

  /* ── Skeleton ── */
  .cp-skel {
    background: linear-gradient(90deg,
      oklch(0.72 0.19 149 / 0.05) 25%,
      oklch(0.72 0.19 149 / 0.11) 50%,
      oklch(0.72 0.19 149 / 0.05) 75%);
    background-size: 200% 100%;
    animation: cp-shimmer 1.6s infinite;
    border-radius: calc(var(--_radius) * 2);
  }

  /* ── Connector between avatars ── */
  .cp-connector {
    display: flex; align-items: center; gap: 4px;
    flex-shrink: 0;
  }
  .cp-connector-line {
    width: 18px; height: 1px;
    background: linear-gradient(90deg,
      oklch(0.72 0.19 149 / 0.3),
      oklch(0.72 0.19 149 / 0.7));
  }
  .cp-connector-icon {
    font-size: 9px;
    color: oklch(0.72 0.19 149);
    line-height: 1;
  }

  @media (max-width: 600px) {
    .cp-wrap { padding: 12px 12px 24px; }
    .cp-row-grid { grid-template-columns: 1fr auto auto !important; }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  name,
  variant = 'a',
}: {
  name: string;
  variant?: 'a' | 'b';
}) {
  const gradA =
    'linear-gradient(135deg, oklch(0.42 0.11 136), oklch(0.60 0.147 149))';
  const gradB =
    'linear-gradient(135deg, oklch(0.55 0.14 149), oklch(0.72 0.19 149))';
  return (
    <div
      className="cp-avatar"
      style={{ background: variant === 'b' ? gradB : gradA }}
    >
      {getInitials(name)}
    </div>
  );
}

// ─── Participants cell ────────────────────────────────────────────────────────

function Participants({ userA, userB }: { userA: string; userB: string }) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}
    >
      <Avatar name={userA} variant="a" />

      <div className="cp-connector">
        <div className="cp-connector-line" />
        <span className="cp-connector-icon">↔</span>
        <div
          className="cp-connector-line"
          style={{
            background:
              'linear-gradient(90deg, oklch(0.72 0.19 149 / 0.7), oklch(0.72 0.19 149 / 0.3))',
          }}
        />
      </div>

      <Avatar name={userB} variant="b" />

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 240,
          }}
        >
          {userA}
          <span
            style={{
              color: 'oklch(0.72 0.19 149)',
              fontWeight: 400,
              margin: '0 5px',
              fontSize: 11,
            }}
          >
            &amp;
          </span>
          {userB}
        </div>
        <div className="cp-label" style={{ marginTop: 2 }}>
          Matched session
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}) {
  return (
    <div
      className="cp-card"
      style={{ padding: '52px 24px', textAlign: 'center' }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          margin: '0 auto 14px',
          background: 'oklch(0.72 0.19 149 / 0.08)',
          border: '1.5px solid oklch(0.72 0.19 149 / 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Search
          size={18}
          style={{ color: 'var(--muted-foreground)' }}
          strokeWidth={1.8}
        />
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
        {query ? `No results for "${query}"` : 'No sessions yet'}
      </div>
      <div className="cp-label" style={{ marginBottom: query ? 16 : 0 }}>
        {query
          ? 'Try a different name or clear the search'
          : 'Sessions will appear here once calls are made'}
      </div>
      {query && (
        <button
          onClick={onClear}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: '.06em',
            padding: '7px 12px',
            borderRadius: 'calc(var(--_radius, 0.625rem) * 1.8)',
            border: '1.5px solid var(--border)',
            background: 'var(--card)',
            color: 'var(--muted-foreground)',
            cursor: 'pointer',
            margin: '0 auto',
          }}
        >
          <X size={12} /> Clear search
        </button>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ConnectionPageContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: LIMIT,
    totalPages: 1,
  });
  const pageCache = useRef<Record<number, CallRecord[]>>({});
  const [loading, setLoading] = useState(false);

  const filteredRecords = callRecords.filter(
    record =>
      (record.userA ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (record.userB ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const seconds = Math.floor(diff / 1000);
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  useEffect(() => {
    if (pageCache.current[currentPage]) {
      setCallRecords(pageCache.current[currentPage]);
      return;
    }
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `/admin/sessions?page=${currentPage}&limit=${LIMIT}`
        );
        const formatted: CallRecord[] = res.data.data.map(
          (session: SessionResponse) => ({
            id: session.sessionId,
            userA: session.userA.fullName,
            userB: session.userB.fullName,
            duration: session.endedAt
              ? formatDuration(session.startedAt, session.endedAt)
              : '00:00:00',
            status: session.endedAt ? 'Completed' : 'Canceled',
          })
        );
        const totalPages = Math.ceil(res.data.total / LIMIT);
        pageCache.current[currentPage] = formatted;
        setCallRecords(formatted);
        setPagination({
          total: res.data.total,
          page: res.data.page,
          limit: LIMIT,
          totalPages,
        });
      } catch (err: unknown) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [currentPage]);

  const getPageNumbers = () => {
    const total = pagination.totalPages;
    const current = currentPage;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (current > 3) pages.push('...');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  };

  const rangeStart = (currentPage - 1) * LIMIT + 1;
  const rangeEnd = Math.min(currentPage * LIMIT, pagination.total);

  return (
    <>
      <style>{CSS}</style>
      <div className="cp-wrap">
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="cp-a1" style={{ marginBottom: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 10,
            }}
          >
            <span className="cp-label">
              <span style={{ color: 'oklch(0.72 0.19 149)', marginRight: 5 }}>
                ◆
              </span>
              Platform Intelligence
            </span>
            <span className="cp-label" style={{ opacity: 0.35 }}>
              /
            </span>
            <span
              className="cp-label"
              style={{ color: 'var(--foreground)', opacity: 0.65 }}
            >
              Call Sessions
            </span>
          </div>

          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              Call Sessions
            </h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 7,
              }}
            >
              <span className="cp-live-dot" />
              <span className="cp-label">Live</span>
              {pagination.total > 0 && (
                <>
                  <span className="cp-label" style={{ opacity: 0.25 }}>
                    ·
                  </span>
                  <span className="cp-label" style={{ opacity: 0.45 }}>
                    {pagination.total} matched sessions
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Search ───────────────────────────────────────────────── */}
        <div
          className="cp-a2"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            marginBottom: 14,
          }}
        >
          <div
            style={{
              position: 'relative',
              flex: 1,
              minWidth: 200,
              maxWidth: 340,
            }}
          >
            <Search
              size={12}
              strokeWidth={2}
              style={{
                position: 'absolute',
                left: 11,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--muted-foreground)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              className="cp-input"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 9,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--muted-foreground)',
                  display: 'flex',
                  padding: 2,
                }}
              >
                <X size={11} />
              </button>
            )}
          </div>
          {!loading && pagination.total > 0 && (
            <span className="cp-label" style={{ whiteSpace: 'nowrap' }}>
              {rangeStart}–{rangeEnd} of {pagination.total}
            </span>
          )}
        </div>

        {/* ── Column headers ────────────────────────────────────────── */}
        {!loading && filteredRecords.length > 0 && (
          <div
            className="cp-a2"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto',
              gap: '0 16px',
              padding: '0 16px 8px 22px',
            }}
          >
            <span className="cp-label">Participants</span>
            <span className="cp-label">Duration</span>
            <span className="cp-label">Status</span>
          </div>
        )}

        {/* ── Rows ─────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="cp-skel" style={{ height: 68 }} />
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="cp-a3">
            <EmptyState
              query={searchQuery}
              onClear={() => setSearchQuery('')}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredRecords.map((record, index) => (
              <div
                key={record.id}
                className="cp-row cp-row-grid"
                style={{
                  padding: '13px 18px 13px 22px',
                  animationDelay: `${index * 38}ms`,
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  gap: '0 16px',
                  alignItems: 'center',
                }}
              >
                <Participants userA={record.userA} userB={record.userB} />

                <div className="cp-duration">
                  <Clock
                    size={11}
                    style={{ color: 'oklch(0.72 0.19 149)', flexShrink: 0 }}
                    strokeWidth={2}
                  />
                  {record.duration}
                </div>

                <div>
                  {record.status === 'Completed' ? (
                    <span className="cp-status cp-status-ok">
                      <span
                        className="cp-status-dot"
                        style={{ background: 'oklch(0.72 0.19 149)' }}
                      />
                      Completed
                    </span>
                  ) : (
                    <span className="cp-status cp-status-err">
                      <span
                        className="cp-status-dot"
                        style={{ background: 'oklch(0.65 0.22 25)' }}
                      />
                      Canceled
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────── */}
        {!loading && pagination.totalPages > 1 && (
          <div
            className="cp-a3"
            style={{
              marginTop: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
              padding: '11px 16px',
              background: 'var(--_surface)',
              border: '1.5px solid var(--_border)',
              borderRadius: 'calc(var(--_radius) * 2)',
            }}
          >
            <span className="cp-label">
              Showing {rangeStart}–{rangeEnd} of {pagination.total} sessions
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                className="cp-pg"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={13} />
              </button>
              {getPageNumbers().map((page, idx) =>
                page === '...' ? (
                  <span
                    key={`e-${idx}`}
                    className="cp-label"
                    style={{ width: 32, textAlign: 'center' }}
                  >
                    ···
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`cp-pg${currentPage === page ? ' active' : ''}`}
                    onClick={() => setCurrentPage(page as number)}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="cp-pg"
                disabled={currentPage === pagination.totalPages}
                onClick={() =>
                  setCurrentPage(p => Math.min(pagination.totalPages, p + 1))
                }
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div
          style={{
            marginTop: 20,
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
              animation: 'cp-pulse 2s ease-in-out infinite',
            }}
          />
          <span className="cp-label">
            Session history · page {currentPage} of {pagination.totalPages || 1}
          </span>
        </div>
      </div>
    </>
  );
}
