'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Search,
  Trash2,
  Calendar,
  Mail,
  User,
  ShieldBan,
  ShieldCheck,
} from 'lucide-react';
import { axiosInstance } from '@/lib/axiosInstance';
import { toast } from 'sonner';
import axios from 'axios';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BannedUser {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  bannedOn: string;
  expires: string;
  reason: string;
  active: boolean;
}

interface BackendBan {
  _id: string;
  userId?: { _id: string; fullName: string; email: string };
  bannedAt: string;
  expiresAt?: string | null;
  active: boolean;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const LIMIT = 10;

const formatDateTime = (date?: string | null) =>
  date
    ? new Date(date).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Permanent';

// ─── CSS ──────────────────────────────────────────────────────────────────────

const PAGE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap');

  .bu-wrap {
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
  .dark .bu-wrap {
    --_green-bg:  oklch(0.72 0.19 149 / 0.12);
    --_green-bdr: oklch(0.72 0.19 149 / 0.28);
  }
  .bu-wrap * { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes bu-fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes bu-spin   { to { transform: rotate(360deg); } }
  @keyframes bu-shimmer{ from{background-position:200% 0} to{background-position:-200% 0} }

  .bu-a1 { animation: bu-fadeUp .4s cubic-bezier(0.22,1,0.36,1) both .04s; }
  .bu-a2 { animation: bu-fadeUp .4s cubic-bezier(0.22,1,0.36,1) both .10s; }
  .bu-a3 { animation: bu-fadeUp .4s cubic-bezier(0.22,1,0.36,1) both .16s; }

  .bu-label {
    font-family: 'DM Mono', monospace;
    font-size: 9.5px; letter-spacing: .12em;
    text-transform: uppercase; color: var(--_text2);
  }
  .bu-card {
    background: var(--_surface);
    border: 1.5px solid var(--_border);
    border-radius: calc(var(--_radius) * 2.5);
    overflow: hidden;
    transition: border-color .18s, box-shadow .18s;
  }
  .bu-search-wrap { position: relative; }
  .bu-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--_text2); pointer-events: none; }
  .bu-search {
    width: 100%; padding: 9px 12px 9px 36px;
    background: var(--_surface);
    border: 1.5px solid var(--_border);
    border-radius: calc(var(--_radius) * 1.8);
    font-family: 'DM Mono', monospace; font-size: 12px;
    color: var(--foreground); outline: none;
    transition: border-color .15s, box-shadow .15s;
  }
  .bu-search::placeholder { color: var(--_text2); }
  .bu-search:focus {
    border-color: oklch(0.72 0.19 149 / 0.50);
    box-shadow: 0 0 0 3px oklch(0.72 0.19 149 / 0.09);
  }
  .bu-table { width: 100%; border-collapse: collapse; }
  .bu-th {
    text-align: left; padding: 11px 16px;
    font-family: 'DM Mono', monospace; font-size: 9px;
    letter-spacing: .14em; text-transform: uppercase;
    color: var(--_text2);
    background: oklch(0.72 0.19 149 / 0.04);
    border-bottom: 1.5px solid var(--_border);
  }
  .bu-td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--_border);
    font-size: 13px; color: var(--foreground);
    vertical-align: middle;
  }
  .bu-tr { transition: background .12s; }
  .bu-tr:hover .bu-td { background: oklch(0.72 0.19 149 / 0.03); }
  .bu-tr:last-child .bu-td { border-bottom: none; }
  .bu-avatar {
    width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 12px; font-weight: 700;
    font-family: var(--font-sans, sans-serif);
    background: linear-gradient(135deg, oklch(0.42 0.11 136), oklch(0.72 0.19 149));
    box-shadow: 0 2px 6px oklch(0.42 0.11 136 / 0.25);
  }
  .bu-badge-ban {
    display: inline-flex; align-items: center; gap: 4px;
    font-family: 'DM Mono', monospace; font-size: 9.5px; font-weight: 500;
    padding: 3px 9px; border-radius: 99px;
    background: var(--_red-bg); color: var(--_red);
    border: 1px solid var(--_red-bdr);
  }
  .bu-badge-ok {
    display: inline-flex; align-items: center; gap: 4px;
    font-family: 'DM Mono', monospace; font-size: 9.5px; font-weight: 500;
    padding: 3px 9px; border-radius: 99px;
    background: var(--_green-bg); color: var(--_green-dark);
    border: 1px solid var(--_green-bdr);
  }
  .dark .bu-badge-ok { color: var(--_green); }
  .bu-unban {
    display: inline-flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 8px; border: none;
    cursor: pointer; background: transparent;
    color: var(--_red);
    transition: background .12s, color .12s;
  }
  .bu-unban:hover { background: var(--_red-bg); }
  .bu-unban:disabled { opacity: 0.4; cursor: not-allowed; }
  .bu-page-btn {
    min-width: 32px; height: 32px; padding: 0 8px; border-radius: 9px;
    border: 1.5px solid transparent;
    font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500;
    cursor: pointer; background: transparent; color: var(--_text2);
    transition: background .12s, color .12s, border-color .12s;
    display: flex; align-items: center; justify-content: center;
  }
  .bu-page-btn:hover:not(:disabled) { background: var(--_green-bg); color: var(--_green-dark); }
  .bu-page-btn.active {
    background: linear-gradient(105deg, oklch(0.42 0.11 136), oklch(0.60 0.14 149));
    color: #fff; border-color: transparent;
  }
  .bu-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .bu-spinner {
    width: 28px; height: 28px; border-radius: 50%;
    border: 3px solid oklch(0.72 0.19 149 / 0.15);
    border-top-color: oklch(0.72 0.19 149);
    animation: bu-spin 0.85s linear infinite;
  }
`;

// ─── BannedUsersPage ──────────────────────────────────────────────────────────

export default function BannedUsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: LIMIT,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);

  const pageCache = useRef<Record<number, BannedUser[]>>({});

  const filteredUsers = bannedUsers.filter(
    u =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (pageCache.current[currentPage]) {
      setBannedUsers(pageCache.current[currentPage]);
      return;
    }
    const fetchBannedUsers = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/admin/banned-users', {
          params: { page: currentPage, limit: LIMIT },
        });
        const formatted: BannedUser[] = res.data.data.map(
          (ban: BackendBan) => ({
            id: ban._id,
            userId: ban.userId?._id ?? '',
            fullName: ban.userId?.fullName ?? 'Unknown',
            email: ban.userId?.email ?? 'Unknown',
            active: ban.active,
            bannedOn: formatDateTime(ban.bannedAt),
            expires: formatDateTime(ban.expiresAt),
            reason: '',
          })
        );
        const totalPages = Math.ceil(res.data.total / LIMIT);
        pageCache.current[currentPage] = formatted;
        setBannedUsers(formatted);
        setPagination({
          total: res.data.total,
          page: res.data.page,
          limit: LIMIT,
          totalPages,
        });
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          toast.error(err.response?.data?.message ?? 'Failed to fetch banned users');
        } else {
          toast.error('Failed to fetch banned users');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBannedUsers();
  }, [currentPage]);

  const getPageNumbers = () => {
    const total = pagination.totalPages, current = currentPage;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++)
      pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleUnban = async (userId: string) => {
    const user = bannedUsers.find(u => u.userId === userId);
    if (!user?.active) {
      toast.info('User already unbanned');
      return;
    }
    try {
      await axiosInstance.patch(`/admin/unban/`, { userId });
      toast.success('User unbanned');
      setBannedUsers(prev => prev.filter(u => u.userId !== userId));
      pageCache.current = {};
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message ?? 'Failed to unban the user');
      } else {
        toast.error('Failed to unban the user');
      }
    }
  };

  return (
    <>
      <style>{PAGE_CSS}</style>

      <div className="bu-wrap">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="bu-a1" style={{ marginBottom: 18 }}>
          <div style={{ marginBottom: 5 }}>
            <div className="bu-label">
              <span style={{ color: 'oklch(0.72 0.19 149)', marginRight: 6 }}>◆</span>
              User Management
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.15, margin: 0 }}>
              Banned Users
            </h1>
            <div style={{ padding: '4px 12px', background: 'oklch(0.577 0.245 27.325 / 0.08)', border: '1px solid oklch(0.577 0.245 27.325 / 0.18)', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 5 }}>
              <ShieldBan size={11} style={{ color: 'oklch(0.577 0.245 27.325)' }} strokeWidth={2} />
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: 'oklch(0.577 0.245 27.325)', letterSpacing: '0.06em' }}>
                {pagination.total} banned
              </span>
            </div>
          </div>

          <div className="bu-search-wrap" style={{ marginTop: 14 }}>
            <Search size={13} className="bu-search-icon" />
            <input
              className="bu-search"
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ── Loading ─────────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: 12 }}>
            <div className="bu-spinner" />
            <span className="bu-label">Loading banned users…</span>
          </div>

        ) : filteredUsers.length === 0 ? (
          /* ── Empty ──────────────────────────────────────────────────────── */
          <div className="bu-a2 bu-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'oklch(0.72 0.19 149 / 0.08)', border: '1.5px solid oklch(0.72 0.19 149 / 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <User size={20} style={{ color: 'oklch(0.42 0.11 136)' }} strokeWidth={1.8} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 5 }}>No banned users found</div>
            <div className="bu-label">
              {searchQuery ? `No results for "${searchQuery}"` : 'There are currently no banned users.'}
            </div>
          </div>

        ) : (
          /* ── Table ──────────────────────────────────────────────────────── */
          <div className="bu-a2 bu-card">
            <div style={{ overflowX: 'auto' }}>
              <table className="bu-table">
                <thead>
                  <tr>
                    <th className="bu-th">User</th>
                    <th className="bu-th">Email</th>
                    <th className="bu-th">Banned On</th>
                    <th className="bu-th">Expires</th>
                    <th className="bu-th">Status</th>
                    <th className="bu-th">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="bu-tr">
                      <td className="bu-td">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="bu-avatar">{getInitials(user.fullName)}</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{user.fullName}</div>
                            {user.reason && (
                              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9.5, color: 'var(--muted-foreground)', marginTop: 1 }}>
                                {user.reason}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="bu-td">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Mail size={12} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11 }}>{user.email}</span>
                        </div>
                      </td>
                      <td className="bu-td">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={11} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11 }}>{user.bannedOn}</span>
                        </div>
                      </td>
                      <td className="bu-td">
                        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11 }}>{user.expires}</span>
                      </td>
                      <td className="bu-td">
                        {user.active
                          ? <span className="bu-badge-ban"><ShieldBan size={9} strokeWidth={2} /> Banned</span>
                          : <span className="bu-badge-ok"><ShieldCheck size={9} strokeWidth={2} /> Unbanned</span>
                        }
                      </td>
                      <td className="bu-td">
                        <button className="bu-unban" onClick={() => handleUnban(user.userId)} title="Unban user">
                          <Trash2 size={14} strokeWidth={2} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {!loading && pagination.totalPages > 1 && (
          <div className="bu-a3 bu-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, padding: '12px 16px', marginTop: 12 }}>
            <div className="bu-label">
              Showing{' '}
              <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                {(currentPage - 1) * LIMIT + 1}–{Math.min(currentPage * LIMIT, pagination.total)}
              </span>{' '}
              of{' '}
              <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{pagination.total}</span>{' '}
              users
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button className="bu-page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                ← Prev
              </button>
              {getPageNumbers().map((page, idx) =>
                page === '...' ? (
                  <span key={`e-${idx}`} style={{ width: 28, textAlign: 'center', fontFamily: "'DM Mono',monospace", fontSize: 11, color: 'var(--muted-foreground)' }}>…</span>
                ) : (
                  <button key={page} className={`bu-page-btn${currentPage === page ? ' active' : ''}`} onClick={() => setCurrentPage(page as number)}>
                    {page}
                  </button>
                )
              )}
              <button className="bu-page-btn" onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))} disabled={currentPage === pagination.totalPages}>
                Next →
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}