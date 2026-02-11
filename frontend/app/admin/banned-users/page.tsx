'use client';

import { useEffect, useState } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  UserX,
  Filter,
  Download,
  Calendar,
  Mail,
} from 'lucide-react';
import { axiosInstance } from '@/lib/axiosInstance';
import { toast } from 'sonner';
import axios from 'axios';

interface BannedUser {
  id: string;
  fullName: string;
  email: string;
  bannedOn: string;
  expires: string;
  reason: string;
}

interface BackendBan {
  _id: string;

  userId?: {
    _id: string;
    fullName: string;
    email: string;
  };

  bannedAt: string;
  expiresAt?: string | null;
}

export default function BannedUsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    const formatDateTime = (date?: string | null) =>
      date
        ? new Date(date).toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
        : "Permanent";

    const fetchBannedUsers = async () => {
      try {
        const res = await axiosInstance.get("/admin/banned-users", {
          params: {
            page: currentPage,
            limit: rowsPerPage,
          },
        });

        const formatted = res.data.data.map((ban: BackendBan) => ({
          id: ban.userId?._id ?? ban._id,
          fullName: ban.userId?.fullName ?? "Unknown",
          email: ban.userId?.email ?? "Unknown",
          bannedOn: formatDateTime(ban.bannedAt),
          expires: formatDateTime(ban.expiresAt),
        }));

        setBannedUsers(formatted);
        setTotalRows(res.data.total);

      } catch (err: unknown) {

        if (axios.isAxiosError(err)) {
          toast.error(err.response?.data?.message ?? "Failed to fetch banned users");
        } else {
          toast.error("Failed to fetch banned users");
        }

      }
    };

    fetchBannedUsers();

  }, [currentPage, rowsPerPage]);

  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const filteredUsers = bannedUsers;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getAvatarColor = (id: string) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-orange-400 to-orange-600',
      'from-green-400 to-green-600',
      'from-teal-400 to-teal-600',
      'from-red-400 to-red-600',
      'from-indigo-400 to-indigo-600',
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length
        ? []
        : filteredUsers.map(u => u.id)
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-linear-to-r from-gray-900 via-red-800 to-orange-800 bg-clip-text text-transparent mb-2">
                User Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2">
                <UserX size={16} className="text-red-500" />
                Manage banned user accounts
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="relative flex-1 sm:min-w-70">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search for Users..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-sm bg-white shadow-sm hover:shadow-md"
                />
              </div>

              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md">
                  <Filter size={16} />
                  <span className="hidden sm:inline">Filter</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-teal-500 to-emerald-600 text-white rounded-xl text-sm font-medium hover:from-teal-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg">
                  <Download size={16} />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-linear-to-r from-gray-700 to-gray-800 text-white">
                  <th className="px-4 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedUsers.length === filteredUsers.length &&
                        filteredUsers.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      Full Name
                      <ChevronDown size={16} className="text-gray-300" />
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      Email
                      <ChevronDown size={16} className="text-gray-300" />
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      Banned On
                      <ChevronDown size={16} className="text-gray-300" />
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      Expires
                      <ChevronDown size={16} className="text-gray-300" />
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      Actions
                      <ChevronDown size={16} className="text-gray-300" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(user => (
                  <tr
                    key={user.id}
                    className="hover:bg-linear-to-r hover:from-teal-50/30 hover:to-emerald-50/30 transition-all duration-200 group"
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full bg-linear-to-br ${getAvatarColor(user.id)} flex items-center justify-center text-white text-sm font-semibold shadow-sm group-hover:scale-110 transition-transform`}
                        >
                          {getInitials(user.fullName)}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">
                          {user.reason}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {user.bannedOn}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {user.expires}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-all group/btn">
                          <Edit2
                            size={16}
                            className="group-hover/btn:scale-110 transition-transform"
                          />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all group/btn">
                          <Trash2
                            size={16}
                            className="group-hover/btn:scale-110 transition-transform"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 px-4 sm:px-6 py-4 bg-gray-50/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-600">Rows per page</span>
                <select
                  value={rowsPerPage}
                  onChange={e => setRowsPerPage(Number(e.target.value))}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-700 cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-gray-500">of {totalRows} rows</span>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-all ${currentPage === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <ChevronLeft size={18} />
                  <ChevronLeft size={18} className="-ml-3" />
                </button>

                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-all ${currentPage === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <ChevronLeft size={18} />
                </button>

                {[1, 2, 3].map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg font-medium text-sm transition-all ${currentPage === page
                      ? 'bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button className="px-2 py-1.5 text-gray-600">...</button>

                <button
                  onClick={() => setCurrentPage(10)}
                  className={`w-9 h-9 rounded-lg font-medium text-sm transition-all ${currentPage === 10
                    ? 'bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  10
                </button>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-all ${currentPage === totalPages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <ChevronRight size={18} />
                </button>

                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-all ${currentPage === totalPages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <ChevronRight size={18} />
                  <ChevronRight size={18} className="-ml-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-20 h-20 mx-auto bg-linear-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <UserX className="text-gray-400" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No banned users found
                </h3>
                <p className="text-base text-gray-500">
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : 'There are no banned users at the moment.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
