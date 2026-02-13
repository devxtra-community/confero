'use client';

import { useEffect, useState } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Filter,
  Download,
  Calendar,
  Mail,
  User,
  AlertCircle,
} from 'lucide-react';
import { axiosInstance } from '@/lib/axiosInstance';
import { toast } from 'sonner';
import axios from 'axios';

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
  userId?: {
    _id: string;
    fullName: string;
    email: string;
  };
  bannedAt: string;
  expiresAt?: string | null;
  active: boolean;
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
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
        : 'Permanent';

    const fetchBannedUsers = async () => {
      try {
        const res = await axiosInstance.get('/admin/banned-users', {
          params: {
            page: currentPage,
            limit: rowsPerPage,
          },
        });

        const formatted = res.data.data.map((ban: BackendBan) => ({
          id: ban._id,
          userId: ban.userId?._id,
          fullName: ban.userId?.fullName ?? 'Unknown',
          email: ban.userId?.email ?? 'Unknown',
          active: ban.active,
          bannedOn: formatDateTime(ban.bannedAt),
          expires: formatDateTime(ban.expiresAt),
        }));

        setBannedUsers(formatted);
        setTotalRows(res.data.total);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          toast.error(
            err.response?.data?.message ?? 'Failed to fetch banned users'
          );
        } else {
          toast.error('Failed to fetch banned users');
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

  const handleUnban = async (userId: string) => {
    const user = bannedUsers.find(u => u.userId === userId);

    if (!user?.active) {
      toast.info('User already unbanned');
      return;
    }

    try {
      await axiosInstance.patch(`/admin/unban/`, { userId: userId });
      toast.success('User unbanned');
      setBannedUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data?.message ?? 'Failed to fetch unban the user'
        );
      } else {
        toast.error('Failed to fetch Unban the users');
      }
    }
  };

  // const toggleSelectAll = () => {
  //   setSelectedUsers(
  //     selectedUsers.length === filteredUsers.length
  //       ? []
  //       : filteredUsers.map(u => u.id)
  //   );
  // };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-linear-to-r from-gray-800 via-gray-900 to-gray-800 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Manage banned user accounts
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm font-medium text-gray-700">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
              </button>
              <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-linear-to-r from-teal-500 to-cyan-500 text-white rounded-lg sm:rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm font-medium">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          <div className="relative mt-4 sm:mt-6">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-sm bg-white shadow-sm hover:shadow-md"
            />
          </div>
        </div>

        <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="text-left p-4 sm:p-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="text-left p-4 sm:p-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left p-4 sm:p-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Banned On
                  </th>
                  <th className="text-left p-4 sm:p-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="text-left p-4 sm:p-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ban Status
                  </th>
                  <th className="text-left p-4 sm:p-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(user => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="p-4 sm:p-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full bg-linear-to-br ${getAvatarColor(
                            user.id
                          )} flex items-center justify-center text-white font-semibold text-sm shadow-md`}
                        >
                          {getInitials(user.fullName)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.fullName}
                          </div>
                          {user.reason && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {user.reason}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 sm:p-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{user.bannedOn}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-6">
                      <span className="text-sm text-gray-600">
                        {user.expires}
                      </span>
                    </td>
                    <td className="p-4 sm:p-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${user.active
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                          }`}
                      >
                        {user.active ? 'Banned' : 'Unbanned'}
                      </span>
                    </td>
                    <td className="p-4 sm:p-6">
                      <button
                        onClick={() => handleUnban(user.userId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all group/btn"
                        title="Unban user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="hidden md:grid lg:hidden grid-cols-1 gap-4">
          {filteredUsers.map(user => (
            <div
              key={user.id}
              className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {user.fullName}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnban(user.userId)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Banned On</p>
                  <p className="text-gray-900 font-medium">{user.bannedOn}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Expires</p>
                  <p className="text-gray-900 font-medium">{user.expires}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                {user.reason && (
                  <p className="text-xs text-gray-600 italic flex-1">
                    {user.reason}
                  </p>
                )}
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${user.active
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                    }`}
                >
                  {user.active ? 'Banned' : 'Unbanned'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="md:hidden space-y-3">
          {filteredUsers.map(user => (
            <div
              key={user.id}
              className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-4 bg-linear-to-r from-gray-50 to-white border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer shrink-0"
                    />
                    <div
                      className={`w-10 h-10 rounded-full bg-linear-to-br ${getAvatarColor(
                        user.id
                      )} flex items-center justify-center text-white font-semibold text-sm shadow-md shrink-0`}
                    >
                      {getInitials(user.fullName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {user.fullName}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${user.active
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                          }`}
                      >
                        {user.active ? 'Banned' : 'Unbanned'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnban(user.userId)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-gray-600 truncate">{user.email}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Banned On
                    </p>
                    <p className="text-xs text-gray-900 font-medium">
                      {user.bannedOn}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Expires
                    </p>
                    <p className="text-xs text-gray-900 font-medium">
                      {user.expires}
                    </p>
                  </div>
                </div>

                {user.reason && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Reason</p>
                    <p className="text-xs text-gray-700 italic line-clamp-2">
                      {user.reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              No banned users found
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : 'There are no banned users at the moment.'}
            </p>
          </div>
        )}

        {filteredUsers.length > 0 && (
          <div className="mt-6 bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-start">
                <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                  Rows per page
                </span>
                <select
                  value={rowsPerPage}
                  onChange={e => setRowsPerPage(Number(e.target.value))}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-700 cursor-pointer text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                  <span className="hidden sm:inline">Showing </span>
                  <span className="font-medium text-gray-900">
                    {Math.min((currentPage - 1) * rowsPerPage + 1, totalRows)}
                  </span>
                  -
                  <span className="font-medium text-gray-900">
                    {Math.min(currentPage * rowsPerPage, totalRows)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium text-gray-900">{totalRows}</span>
                </span>
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
                  <ChevronLeft className="w-4 h-4" />
                  <ChevronLeft className="w-4 h-4 -ml-3" />
                </button>

                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-all ${currentPage === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="hidden sm:flex items-center gap-1">
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
                  {totalPages > 4 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                  {totalPages > 3 && (
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`w-9 h-9 rounded-lg font-medium text-sm transition-all ${currentPage === totalPages
                        ? 'bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      {totalPages}
                    </button>
                  )}
                </div>

                <div className="sm:hidden px-3 py-1.5 bg-gray-100 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    {currentPage} / {totalPages}
                  </span>
                </div>

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
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-all ${currentPage === totalPages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <ChevronRight className="w-4 h-4" />
                  <ChevronRight className="w-4 h-4 -ml-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
