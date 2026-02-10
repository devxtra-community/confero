'use client';

import { useEffect, useState } from 'react';
import {
  Search,
  AlertTriangle,
  Calendar,
  MoreVertical,
  Ban,
  Eye,
  Mail,
} from 'lucide-react';
import { axiosInstance } from '@/lib/axiosInstance';
import { toast } from 'sonner';
import axios from 'axios';

interface Reporter {
  id: string;
  name: string;
  avatar?: string;
}

interface ReportedUser {
  id: string;
  username: string;
  reportedBy: Reporter;
  reason: string;
  reportedAt: string;
  witnesses: Reporter[];
}

interface BackendReport {
  _id: string;
  reason: string;
  createdAt: string;

  reportedUserId?: {
    _id: string;
    fullName: string;
  };

  reportedBy?: {
    _id: string;
    fullName: string;
  };
}

export default function ReportedUsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState<ReportedUser[]>([]);

  const totalPages = 3;

  const filteredUsers = reports.filter(
    user =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.reportedBy.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (id: string) => {
    const colors = [
      'from-blue-400 to-cyan-500',
      'from-purple-400 to-pink-500',
      'from-orange-400 to-red-500',
      'from-green-400 to-teal-500',
      'from-yellow-400 to-orange-500',
      'from-pink-400 to-rose-500',
    ];
    const index = parseInt(id.replace(/\D/g, '')) % colors.length;
    return colors[index];
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axiosInstance.get(
          `/admin/reported-users?page=${currentPage}&limit=5`
        );

        const formatted = res.data.data.map((r: BackendReport) => ({
          id: r._id,
          username: r.reportedUserId?.fullName || 'Unknown',
          reportedBy: {
            id: r.reportedBy?._id || '',
            name: r.reportedBy?.fullName || 'Unknown',
          },
          reason: r.reason,
          reportedAt: new Date(r.createdAt).toLocaleDateString(),
          witnesses: [],
        }));

        setReports(formatted);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message ?? 'Failed to fetch reports'
          );
        } else {
          toast.error('Unexpected error');
        }
      }
    };

    fetchReports();
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-linear-to-r from-gray-900 via-red-800 to-orange-800 bg-clip-text text-transparent mb-2">
                Reported Users
              </h1>
              <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" />
                Review and manage reported user accounts
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-96">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search for anything..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-sm bg-white shadow-sm hover:shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredUsers.map((report, index) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'backwards',
              }}
            >
              {/* Decorative linear on hover */}
              <div className="absolute inset-0 bg-linear-to-br from-red-50/50 via-transparent to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative space-y-4">
                {/* Header with username and menu */}
                <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-red-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-md">
                      {getInitials(report.username)}
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                        {report.username}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-red-600 mt-0.5">
                        <AlertTriangle size={12} />
                        <span className="font-medium">Reported User</span>
                      </div>
                    </div>
                  </div>

                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical size={18} className="text-gray-400" />
                  </button>
                </div>

                {/* Reported by section */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-full bg-linear-to-br ${getAvatarColor(report.reportedBy.id)} flex items-center justify-center text-white text-sm font-semibold shadow-sm`}
                    >
                      {getInitials(report.reportedBy.name)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        Reported by,
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {report.reason}
                      </p>
                    </div>
                  </div>

                  {/* Reported date */}
                  <div className="flex items-center gap-2 pt-2">
                    <Calendar size={14} className="text-red-500" />
                    <span className="text-sm font-semibold text-red-600">
                      Reported At: {report.reportedAt}
                    </span>
                  </div>

                  {/* Witnesses */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex -space-x-2">
                      {report.witnesses.map((witness, idx) => (
                        <div
                          key={witness.id}
                          className={`w-8 h-8 rounded-full bg-linear-to-br ${getAvatarColor(witness.id)} flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-pointer`}
                          style={{ zIndex: report.witnesses.length - idx }}
                          title={witness.name}
                        >
                          {getInitials(witness.name)}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {report.witnesses.length} witness
                      {report.witnesses.length > 1 ? 'es' : ''}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-red-500 to-orange-600 text-white rounded-xl text-sm font-medium hover:from-red-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg">
                    <Ban size={16} />
                    <span>Ban User</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md">
                    <Eye size={16} />
                    <span className="hidden sm:inline">View</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md">
                    <Mail size={16} />
                    <span className="hidden sm:inline">Contact</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredUsers.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-20 h-20 mx-auto bg-linear-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-gray-400" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No reported users found
                </h3>
                <p className="text-base text-gray-500">
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : 'There are no reported users at the moment.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Previous
            </button>

            {[1, 2, 3].map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                  currentPage === page
                    ? 'bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
