'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Search,
  AlertTriangle,
  Calendar,
  ShieldBan,
  User,
  Flag,
  FileText,
} from 'lucide-react';
import { axiosInstance } from '@/lib/axiosInstance';
import { toast } from 'sonner';
import axios from 'axios';

// ─── Inline BanUserDialog (same as BannedUsersPage) ───────────────────────────
import { BanUserDialog } from '@/components/admin/BanUserDialog';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Reporter {
  id: string;
  name: string;
}

interface ReportedUser {
  id: string;
  userId: string;
  username: string;
  reportedBy: Reporter;
  reason: string;
  description: string;
  reportedAt: string;
  witnesses: Reporter[];
}

interface BackendReport {
  _id: string;
  reason: string;
  createdAt: string;
  description: string;
  reportedUserId?: { _id: string; fullName: string };
  reportedBy?: { _id: string; fullName: string };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const PAGE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap');

  .ru-wrap {
    font-family: var(--font-sans, sans-serif);
    background: var(--background);
    color: var(--foreground);
    min-height: 100vh;
    padding: 18px 20px 32px;
    --_green:      oklch(0.72 0.19 149);
    --_green-dark: oklch(0.42 0.11 136);
    --_green-bg:   oklch(0.72 0.19 149 / 0.08);
    --_green-bdr:  oklch(0.72 0.19 149 / 0.22);
    --_red:        oklch(0.577 0.245 27.325);
    --_red-bg:     oklch(0.577 0.245 27.325 / 0.08);
    --_red-bdr:    oklch(0.577 0.245 27.325 / 0.20);
    --_surface:    var(--card);
    --_border:     var(--border);
    --_text2:      var(--muted-foreground);
    --_radius:     var(--radius, 0.625rem);
  }
  .dark .ru-wrap {
    --_green-bg:  oklch(0.72 0.19 149 / 0.12);
    --_green-bdr: oklch(0.72 0.19 149 / 0.28);
  }
  .ru-wrap * { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes ru-fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes ru-spin   { to { transform: rotate(360deg); } }
  @keyframes ru-shimmer{ from{background-position:200% 0} to{background-position:-200% 0} }

  .ru-a1 { animation: ru-fadeUp .4s cubic-bezier(0.22,1,0.36,1) both .04s; }
  .ru-a2 { animation: ru-fadeUp .4s cubic-bezier(0.22,1,0.36,1) both .10s; }
  .ru-a3 { animation: ru-fadeUp .4s cubic-bezier(0.22,1,0.36,1) both .16s; }

  /* label */
  .ru-label {
    font-family: 'DM Mono', monospace;
    font-size: 9.5px; letter-spacing: .12em;
    text-transform: uppercase; color: var(--_text2);
  }

  /* card */
  .ru-card {
    background: var(--_surface);
    border: 1.5px solid var(--_border);
    border-radius: calc(var(--_radius) * 2.5);
    overflow: hidden;
    transition: border-color .18s, box-shadow .18s, transform .18s;
    position: relative;
  }
  .ru-card:hover {
    border-color: var(--_green-bdr);
    box-shadow: 0 4px 20px oklch(0.72 0.19 149 / 0.08);
    transform: translateY(-1px);
  }

  /* search */
  .ru-search-wrap { position: relative; }
  .ru-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--_text2); pointer-events: none; }
  .ru-search {
    width: 100%; padding: 9px 12px 9px 36px;
    background: var(--_surface);
    border: 1.5px solid var(--_border);
    border-radius: calc(var(--_radius) * 1.8);
    font-family: 'DM Mono', monospace; font-size: 12px;
    color: var(--foreground); outline: none;
    transition: border-color .15s, box-shadow .15s;
  }
  .ru-search::placeholder { color: var(--_text2); }
  .ru-search:focus {
    border-color: oklch(0.72 0.19 149 / 0.50);
    box-shadow: 0 0 0 3px oklch(0.72 0.19 149 / 0.09);
  }

  /* avatar */
  .ru-avatar {
    border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 700;
    font-family: var(--font-sans, sans-serif);
  }
  .ru-avatar-lg {
    width: 38px; height: 38px; font-size: 13px;
    background: linear-gradient(135deg, oklch(0.577 0.245 27.325 / 0.8), oklch(0.577 0.245 27.325));
    box-shadow: 0 2px 8px oklch(0.577 0.245 27.325 / 0.28);
  }
  .ru-avatar-sm {
    width: 28px; height: 28px; font-size: 10px;
    background: linear-gradient(135deg, oklch(0.42 0.11 136), oklch(0.72 0.19 149));
    box-shadow: 0 1px 5px oklch(0.42 0.11 136 / 0.22);
  }

  /* reported badge */
  .ru-badge-report {
    display: inline-flex; align-items: center; gap: 4px;
    font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 500;
    padding: 2px 8px; border-radius: 99px;
    background: var(--_red-bg); color: var(--_red);
    border: 1px solid var(--_red-bdr);
    letter-spacing: .06em;
  }

  /* divider */
  .ru-hr { height: 1px; background: var(--_border); }

  /* info row */
  .ru-info-row {
    display: flex; align-items: flex-start; gap: 9px;
  }
  .ru-info-icon {
    width: 26px; height: 26px; border-radius: 7px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: oklch(0.72 0.19 149 / 0.07);
    border: 1px solid oklch(0.72 0.19 149 / 0.14);
  }

  /* ban button */
  .ru-ban-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 14px; border: none; border-radius: calc(var(--_radius) * 1.6);
    font-family: var(--font-sans, sans-serif); font-size: 12px; font-weight: 700;
    cursor: pointer;
    background: linear-gradient(105deg, oklch(0.42 0.11 136), oklch(0.60 0.14 149));
    color: #fff;
    box-shadow: 0 2px 10px oklch(0.42 0.11 136 / 0.22);
    transition: opacity .15s, transform .15s, box-shadow .15s;
  }
  .ru-ban-btn:hover { opacity: .9; transform: translateY(-1px); box-shadow: 0 4px 16px oklch(0.42 0.11 136 / 0.30); }
  .ru-ban-btn:active { transform: translateY(0); }

  /* pagination */
  .ru-page-btn {
    min-width: 32px; height: 32px; padding: 0 8px; border-radius: 9px;
    border: 1.5px solid transparent;
    font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500;
    cursor: pointer; background: transparent; color: var(--_text2);
    transition: background .12s, color .12s, border-color .12s;
    display: flex; align-items: center; justify-content: center;
  }
  .ru-page-btn:hover:not(:disabled) { background: var(--_green-bg); color: var(--_green-dark); }
  .ru-page-btn.active {
    background: linear-gradient(105deg, oklch(0.42 0.11 136), oklch(0.60 0.14 149));
    color: #fff;
  }
  .ru-page-btn:disabled { opacity: .35; cursor: not-allowed; }

  /* spinner */
  .ru-spinner {
    width: 26px; height: 26px; border-radius: 50%;
    border: 3px solid oklch(0.72 0.19 149 / 0.15);
    border-top-color: oklch(0.72 0.19 149);
    animation: ru-spin 0.85s linear infinite;
  }

  /* grid */
  .ru-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 12px;
  }
  @media (max-width: 600px) {
    .ru-grid { grid-template-columns: 1fr; }
    .ru-wrap  { padding: 12px 12px 28px; }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportedUsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState<ReportedUser[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 4,
    totalPages: 1,
  });
  const [openBanModal, setOpenBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const pageCache = useRef<Record<number, ReportedUser[]>>({});

  const filteredUsers = reports.filter(
    u =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.reportedBy.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (pageCache.current[currentPage]) {
      setReports(pageCache.current[currentPage]);
      return;
    }
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `/admin/reported-users?page=${currentPage}&limit=4`
        );
        const formatted: ReportedUser[] = (
          res.data.data as BackendReport[]
        ).map(r => ({
          id: r._id,
          userId: r.reportedUserId?._id || '',
          username: r.reportedUserId?.fullName || 'Unknown',
          reportedBy: {
            id: r.reportedBy?._id || '',
            name: r.reportedBy?.fullName || 'Unknown',
          },
          reason: r.reason,
          description: r.description,
          reportedAt: new Date(r.createdAt).toLocaleDateString(),
          witnesses: [],
        }));
        pageCache.current[currentPage] = formatted;
        setReports(formatted);
        setPagination(res.data.pagination);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message ?? 'Failed to fetch reports'
          );
        } else {
          toast.error('Unexpected error');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [currentPage]);

  const getPageNumbers = () => {
    const total = pagination.totalPages,
      current = currentPage;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (current > 3) pages.push('...');
    for (
      let i = Math.max(2, current - 1);
      i <= Math.min(total - 1, current + 1);
      i++
    )
      pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  };

  return (
    <>
      <style>{PAGE_CSS}</style>

      {selectedUser && (
        <BanUserDialog
          open={openBanModal}
          onOpenChange={setOpenBanModal}
          userId={selectedUser}
          reason={reason}
          onBanSuccess={userId => {
            setReports(prev => prev.filter(r => r.userId !== userId));
            pageCache.current = {};
          }}
        />
      )}

      <div className="ru-wrap">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="ru-a1" style={{ marginBottom: 18 }}>
          <div className="ru-label" style={{ marginBottom: 5 }}>
            <span style={{ color: 'oklch(0.72 0.19 149)', marginRight: 6 }}>
              ◆
            </span>
            User Management
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 14,
            }}
          >
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              Reported Users
            </h1>
            {/* total badge */}
            <div
              style={{
                padding: '4px 12px',
                background: 'oklch(0.577 0.245 27.325 / 0.08)',
                border: '1px solid oklch(0.577 0.245 27.325 / 0.18)',
                borderRadius: 99,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Flag
                size={11}
                style={{ color: 'oklch(0.577 0.245 27.325)' }}
                strokeWidth={2}
              />
              <span
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 10,
                  color: 'oklch(0.577 0.245 27.325)',
                  letterSpacing: '0.06em',
                }}
              >
                {pagination.total} reports
              </span>
            </div>
          </div>
          {/* search */}
          <div className="ru-search-wrap">
            <Search size={13} className="ru-search-icon" />
            <input
              className="ru-search"
              type="text"
              placeholder="Search by name or reporter..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ── Loading ─────────────────────────────────────────────────────── */}
        {loading ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '64px 0',
              gap: 12,
            }}
          >
            <div className="ru-spinner" />
            <span className="ru-label">Loading reports…</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          /* ── Empty ──────────────────────────────────────────────────────── */
          <div
            className="ru-a2 ru-card"
            style={{ padding: '48px 24px', textAlign: 'center' }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'oklch(0.577 0.245 27.325 / 0.08)',
                border: '1.5px solid oklch(0.577 0.245 27.325 / 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
              }}
            >
              <AlertTriangle
                size={20}
                style={{ color: 'oklch(0.577 0.245 27.325)' }}
                strokeWidth={1.8}
              />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 5 }}>
              No reports found
            </div>
            <div className="ru-label">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : 'There are no reported users at the moment.'}
            </div>
          </div>
        ) : (
          /* ── Grid ───────────────────────────────────────────────────────── */
          <div className="ru-grid ru-a2">
            {filteredUsers.map((report, i) => (
              <div
                key={report.id}
                className="ru-card"
                style={{ padding: '16px 18px', animationDelay: `${i * 40}ms` }}
              >
                {/* subtle red top accent */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background:
                      'linear-gradient(90deg, oklch(0.577 0.245 27.325 / 0.6), oklch(0.577 0.245 27.325 / 0.2))',
                    borderRadius:
                      'calc(var(--radius, 0.625rem) * 2.5) calc(var(--radius, 0.625rem) * 2.5) 0 0',
                  }}
                />

                {/* ── Reported user row ──────────────────────────────────── */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    paddingBottom: 12,
                    marginBottom: 12,
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <div className="ru-avatar ru-avatar-lg">
                      {getInitials(report.username)}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          lineHeight: 1.2,
                        }}
                      >
                        {report.username}
                      </div>
                      <span
                        className="ru-badge-report"
                        style={{ marginTop: 3 }}
                      >
                        <AlertTriangle size={8} strokeWidth={2.5} /> Reported
                      </span>
                    </div>
                  </div>
                  {/* date */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      flexShrink: 0,
                    }}
                  >
                    <Calendar
                      size={11}
                      style={{ color: 'var(--muted-foreground)' }}
                    />
                    <span
                      style={{
                        fontFamily: "'DM Mono',monospace",
                        fontSize: 10,
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      {report.reportedAt}
                    </span>
                  </div>
                </div>

                {/* ── Report details ─────────────────────────────────────── */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  {/* reporter */}
                  <div className="ru-info-row">
                    <div className="ru-info-icon">
                      <User
                        size={12}
                        style={{ color: 'oklch(0.42 0.11 136)' }}
                        strokeWidth={2}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="ru-label" style={{ marginBottom: 2 }}>
                        Reported by
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <div className="ru-avatar ru-avatar-sm">
                          {getInitials(report.reportedBy.name)}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>
                          {report.reportedBy.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* reason */}
                  <div className="ru-info-row">
                    <div className="ru-info-icon">
                      <Flag
                        size={12}
                        style={{ color: 'oklch(0.42 0.11 136)' }}
                        strokeWidth={2}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="ru-label" style={{ marginBottom: 2 }}>
                        Reason
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--foreground)',
                        }}
                      >
                        {report.reason}
                      </div>
                    </div>
                  </div>

                  {/* description */}
                  {report.description && (
                    <div className="ru-info-row">
                      <div className="ru-info-icon">
                        <FileText
                          size={12}
                          style={{ color: 'oklch(0.42 0.11 136)' }}
                          strokeWidth={2}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="ru-label" style={{ marginBottom: 2 }}>
                          Description
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: 'var(--muted-foreground)',
                            lineHeight: 1.55,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {report.description}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="ru-hr" style={{ marginBottom: 12 }} />

                {/* ── Actions ────────────────────────────────────────────── */}
                <button
                  className="ru-ban-btn"
                  onClick={() => {
                    setSelectedUser(report.userId);
                    setReason(report.reason);
                    setOpenBanModal(true);
                  }}
                >
                  <ShieldBan size={13} strokeWidth={2.2} />
                  Ban User
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {!loading && pagination.totalPages > 1 && (
          <div
            className="ru-a3 ru-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
              padding: '12px 16px',
              marginTop: 12,
            }}
          >
            <div className="ru-label">
              Page{' '}
              <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                {currentPage}
              </span>{' '}
              of{' '}
              <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                {pagination.totalPages}
              </span>{' '}
              · {pagination.total} reports
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                className="ru-page-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ← Prev
              </button>
              {getPageNumbers().map((page, idx) =>
                page === '...' ? (
                  <span
                    key={`e-${idx}`}
                    style={{
                      width: 28,
                      textAlign: 'center',
                      fontFamily: "'DM Mono',monospace",
                      fontSize: 11,
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`ru-page-btn${currentPage === page ? ' active' : ''}`}
                    onClick={() => setCurrentPage(page as number)}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="ru-page-btn"
                onClick={() =>
                  setCurrentPage(p => Math.min(pagination.totalPages, p + 1))
                }
                disabled={currentPage === pagination.totalPages}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
