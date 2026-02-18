'use client';

import { useEffect, useState } from 'react';
import {
  Search,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Phone,
  Video as VideoIcon,
  X,
} from 'lucide-react';
import { axiosInstance } from '@/lib/axiosInstance';

interface CallRecord {
  id: string;
  caller: string;
  receiver: string;
  duration: string;
  status: 'Completed' | 'Canceled';
}

interface SessionResponse {
  sessionId: string;
  userA: {
    fullName: string;
  };
  userB: {
    fullName: string;
  };
  startedAt: string;
  endedAt?: string;
}

export default function ConnectionPageContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);

  const connectedUsers = [
    { id: 1, name: 'User 1', color: 'from-orange-400 to-pink-400' },
    { id: 2, name: 'User 2', color: 'from-yellow-400 to-orange-400' },
    { id: 3, name: 'User 3', color: 'from-blue-400 to-cyan-400' },
    { id: 4, name: 'User 4', color: 'from-purple-400 to-pink-400' },
    { id: 5, name: 'User 5', color: 'from-green-400 to-teal-400' },
  ];

  const totalPages = 3;

  const filteredRecords = callRecords.filter(
    record =>
      record.caller.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.receiver.toLowerCase().includes(searchQuery.toLowerCase())
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
    const fetchSessions = async () => {
      try {
        const res = await axiosInstance.get('/admin/sessions');

        const formatted = res.data.data.map((session: SessionResponse) => {
          const duration = session.endedAt
            ? formatDuration(session.startedAt, session.endedAt)
            : '00:00:00';

          return {
            id: session.sessionId,
            caller: session.userA.fullName,
            receiver: session.userB.fullName,
            duration,
            status: session.endedAt ? 'Completed' : 'Canceled',
          };
        });

        setCallRecords(formatted);
      } catch (err: unknown) {
        console.error(err);
      }
    };

    fetchSessions();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
            <span className="hover:text-teal-600 transition-colors cursor-pointer">
              Connection
            </span>
            <ChevronRight size={14} className="text-gray-400" />
            <span className="text-gray-900 font-medium">Name</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-linear-to-r from-gray-900 via-teal-800 to-emerald-800 bg-clip-text text-transparent">
                Name
              </h1>

              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {connectedUsers.slice(0, 4).map((user, index) => (
                    <div
                      key={user.id}
                      className={`
                        w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white 
                        bg-linear-to-br ${user.color} 
                        flex items-center justify-center text-white text-xs font-semibold 
                        shadow-lg hover:scale-110 hover:z-20 transition-all duration-200 
                        cursor-pointer ring-1 ring-gray-100
                      `}
                      style={{ zIndex: 10 - index }}
                      title={user.name}
                    >
                      {getInitials(user.name)}
                    </div>
                  ))}
                  {connectedUsers.length > 4 && (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white bg-linear-to-br from-pink-100 to-purple-100 flex items-center justify-center text-xs font-semibold text-pink-600 shadow-lg hover:scale-110 transition-all duration-200 cursor-pointer">
                      +2
                    </div>
                  )}
                </div>

                <button className="px-3 sm:px-4 py-2 bg-linear-to-r from-emerald-50 to-teal-50 text-teal-600 rounded-xl text-xs sm:text-sm font-medium hover:from-emerald-100 hover:to-teal-100 transition-all duration-200 border border-teal-100 shadow-sm hover:shadow-md flex items-center gap-2">
                  <Phone size={14} />
                  <span>Connection</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="relative flex-1 sm:min-w-70 lg:min-w-[320px]">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 text-sm bg-white shadow-sm hover:shadow-md"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 hover:border-teal-300 hover:bg-teal-50 transition-all duration-200 shadow-sm hover:shadow-md">
                  <Filter size={16} />
                  <span className="hidden sm:inline">Filter</span>
                </button>

                <button className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-linear-to-r from-teal-500 to-emerald-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:from-teal-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg">
                  <Download size={16} />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record, index) => (
              <div
                key={record.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'backwards',
                }}
              >
                <div className="absolute inset-0 bg-linear-to-br from-teal-50/50 via-transparent to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1 space-y-2 sm:space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-linear-to-br from-teal-100 to-emerald-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <VideoIcon
                          size={18}
                          className="text-teal-600"
                          strokeWidth={2.5}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 group-hover:text-teal-700 transition-colors">
                          Call duration of the video call
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <p className="text-sm sm:text-base text-gray-700">
                            <span className="font-semibold text-gray-900">
                              {record.caller}
                            </span>
                            <span className="text-gray-400 mx-1.5">→</span>
                            <span className="font-semibold text-gray-900">
                              {record.receiver}
                            </span>
                          </p>
                          <span
                            className={`
                              px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold
                              inline-flex items-center gap-1.5 shadow-sm
                              ${
                                record.status === 'Completed'
                                  ? 'bg-linear-to-r from-emerald-50 to-green-50 text-emerald-700 ring-1 ring-emerald-200'
                                  : 'bg-linear-to-r from-red-50 to-pink-50 text-red-700 ring-1 ring-red-200'
                              }
                            `}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                record.status === 'Completed'
                                  ? 'bg-emerald-500'
                                  : 'bg-red-500'
                              }`}
                            ></div>
                            {record.status === 'Completed'
                              ? 'Completed'
                              : 'Canceled'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 justify-end md:justify-start">
                    <div className="flex items-center gap-2 text-gray-700 bg-linear-to-br from-gray-50 to-gray-100 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-gray-200 shadow-sm group-hover:shadow-md transition-all duration-200">
                      <Clock
                        size={18}
                        className="text-teal-500"
                        strokeWidth={2.5}
                      />
                      <span className="font-mono text-base sm:text-lg font-semibold">
                        {record.duration}
                      </span>
                    </div>

                    <div className="relative">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-linear-to-br from-orange-400 via-pink-400 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ring-2 ring-white">
                        {getInitials(record.receiver)}
                      </div>
                      {record.status === 'Completed' && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-teal-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-2xl"></div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-linear-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <Search className="text-gray-400" size={32} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    No results found
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500">
                    We couldn&apos;t find any call records matching&quot;
                    {searchQuery}&quot;
                  </p>
                </div>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-linear-to-r from-teal-500 to-emerald-600 text-white rounded-xl text-sm font-medium hover:from-teal-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Clear search
                </button>
              </div>
            </div>
          )}
        </div>

        {filteredRecords.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 sm:mt-8 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-xs sm:text-sm text-gray-600">
              Showing{' '}
              <span className="font-semibold text-gray-900">
                {filteredRecords.length}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-gray-900">
                {callRecords.length}
              </span>{' '}
              results
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${
                    currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`
                  hidden sm:flex px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {[1, 2, 3].map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`
                      w-9 h-9 sm:w-10 sm:h-10 rounded-lg font-medium text-sm transition-all duration-200
                      ${
                        currentPage === page
                          ? 'bg-linear-to-r from-teal-500 to-emerald-600 text-white shadow-md scale-110'
                          : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className={`
                  hidden sm:flex px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    currentPage === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                Next
              </button>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${
                    currentPage === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
