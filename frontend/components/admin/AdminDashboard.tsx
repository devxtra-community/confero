'use client';

import {
  Video,
  CheckCircle,
  TrendingUp,
  Clock,
  Users,
  Activity,
  ArrowUpRight,
} from 'lucide-react';

interface CallDurationData {
  completed: number;
  onHold: number;
  declined: number;
  pending: number;
}


export default function DashboardPage() {
  const callDurationData: CallDurationData = {
    completed: 32,
    onHold: 25,
    declined: 25,
    pending: 18,
  };

  const total = Object.values(callDurationData).reduce((a, b) => a + b, 0);

  const getSegmentPath = (startAngle: number, endAngle: number) => {
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const pieSegments = [
    {
      label: 'Completed',
      value: callDurationData.completed,
      color: '#14B8A6',
      percentage: callDurationData.completed,
    },
    {
      label: 'On Hold',
      value: callDurationData.onHold,
      color: '#8B5CF6',
      percentage: callDurationData.onHold,
    },
    {
      label: 'Declined',
      value: callDurationData.declined,
      color: '#60A5FA',
      percentage: callDurationData.declined,
    },
    {
      label: 'Pending',
      value: callDurationData.pending,
      color: '#EF4444',
      percentage: callDurationData.pending,
    },
  ];

  let currentAngle = 0;
  const segments = pieSegments.map(segment => {
    const angle = (segment.value / total) * 360;
    const path = {
      ...segment,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      path: getSegmentPath(currentAngle, currentAngle + angle),
    };
    currentAngle += angle;
    return path;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header with enhanced styling */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-teal-800 to-emerald-800 bg-clip-text text-transparent mb-2">
                Admin Dashboard
              </h2>
              <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2">
                <Activity size={16} className="text-teal-500" />
                Real-time analytics and insights
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-teal-300 hover:bg-teal-50 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md">
                <Clock size={16} />
                <span className="hidden sm:inline">Last 7 days</span>
                <span className="sm:hidden">7d</span>
              </button>
              <button className="px-3 sm:px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl text-sm font-medium hover:from-teal-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2">
                <ArrowUpRight size={16} />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Grid - Enhanced Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Average Call Duration - Pie Chart - Enhanced */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
            {/* Decorative background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 via-transparent to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                    Average Call Duration
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Distribution by status
                  </p>
                </div>
                <button className="self-start sm:self-auto px-3 sm:px-4 py-2 bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-600 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 hover:from-teal-100 hover:to-emerald-100 transition-all duration-200 border border-teal-100 shadow-sm hover:shadow-md">
                  <span>This Week</span>
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-12">
                {/* Pie Chart SVG - Enhanced */}
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64">
                  <svg
                    viewBox="0 0 200 200"
                    className="w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                  >
                    {segments.map((segment, index) => (
                      <g key={index}>
                        <path
                          d={segment.path}
                          fill={segment.color}
                          className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                          style={{
                            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))',
                          }}
                        />
                      </g>
                    ))}
                    {/* Enhanced center circle with gradient */}
                    <defs>
                      <radialGradient id="centerGradient">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#f9fafb" />
                      </radialGradient>
                    </defs>
                    <circle
                      cx="100"
                      cy="100"
                      r="45"
                      fill="url(#centerGradient)"
                    />

                    {/* Center text with animation */}
                    <text
                      x="100"
                      y="92"
                      textAnchor="middle"
                      className="text-2xl sm:text-3xl font-bold fill-teal-600"
                    >
                      {callDurationData.completed}%
                    </text>
                    <text
                      x="100"
                      y="112"
                      textAnchor="middle"
                      className="text-xs fill-gray-500 font-medium"
                    >
                      Completed
                    </text>
                  </svg>

                  {/* Decorative ring */}
                  <div className="absolute inset-0 border-4 border-teal-100 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                </div>

                {/* Legend - Enhanced */}
                <div className="w-full md:w-auto space-y-3 sm:space-y-4">
                  {pieSegments.map((segment, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 group/item cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      <div
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-md transition-all duration-200 group-hover/item:scale-125 shadow-sm"
                        style={{ backgroundColor: segment.color }}
                      ></div>
                      <span className="text-sm sm:text-base text-gray-700 font-medium group-hover/item:text-gray-900 transition-colors flex-1">
                        {segment.label}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500 font-semibold group-hover/item:text-teal-600 transition-colors">
                        {segment.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Cards - Enhanced */}
          <div className="space-y-4 sm:space-y-6">
            {/* Total Video Calls - Enhanced */}
            <div className="relative bg-gradient-to-br from-white via-teal-50/30 to-emerald-50/50 rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 group overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-100/20 to-emerald-100/20"></div>
              </div>

              <div className="relative">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                      Total Video Calls
                    </h3>
                    <p className="text-xs text-gray-500">
                      This week&apos;s activity
                    </p>
                  </div>
                  <div className="p-2 sm:p-2.5 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <Video
                      className="text-teal-600"
                      size={18}
                      strokeWidth={2.5}
                    />
                  </div>
                </div>

                <div className="flex items-end justify-between mb-2">
                  <div className="text-3xl sm:text-4xl font-bold bg-clip-text ">
                    52
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-lg text-xs sm:text-sm font-semibold shadow-sm">
                    <TrendingUp size={14} strokeWidth={2.5} />
                    <span>+12%</span>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                  <span>calls this week</span>
                </div>

                {/* Progress indicator */}
                <div className="mt-3 sm:mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-1000 group-hover:w-full"
                    style={{ width: '65%' }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Successful Matches - Enhanced */}
            <div className="relative bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 group overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-pink-100/20"></div>
              </div>

              <div className="relative">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                      Successful Matches
                    </h3>
                    <p className="text-xs text-gray-500">
                      Completed connections
                    </p>
                  </div>
                  <div className="p-2 sm:p-2.5 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <CheckCircle
                      className="text-purple-600"
                      size={18}
                      strokeWidth={2.5}
                    />
                  </div>
                </div>

                <div className="flex items-end justify-between mb-2">
                  <div className="text-3xl sm:text-4xl font-bold  bg-clip-text">
                    38
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-lg text-xs sm:text-sm font-semibold shadow-sm">
                    <TrendingUp size={14} strokeWidth={2.5} />
                    <span>+8%</span>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  <span>matches completed</span>
                </div>

                {/* Progress indicator */}
                <div className="mt-3 sm:mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 group-hover:w-full"
                    style={{ width: '76%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats Cards - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
          {/* Active Users - Enhanced */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl">
                    <Users
                      className="text-teal-600"
                      size={20}
                      strokeWidth={2.5}
                    />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Active Users
                    </h3>
                    <p className="text-xs text-gray-500">Currently online</p>
                  </div>
                </div>
                <button className="self-start sm:self-auto px-3 py-1.5 bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-600 rounded-lg text-xs font-medium flex items-center gap-2 hover:from-teal-100 hover:to-emerald-100 transition-all duration-200 border border-teal-100 shadow-sm">
                  <span>Today</span>
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-end justify-between">
                  <div className="text-3xl sm:text-4xl font-bold  bg-clip-text ">
                    1,234
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-lg text-xs sm:text-sm font-semibold shadow-sm">
                    <TrendingUp size={14} strokeWidth={2.5} />
                    <span>+5.2%</span>
                  </div>
                </div>

                {/* Enhanced progress bar */}
                <div className="space-y-2">
                  <div className="h-2.5 sm:h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 rounded-full transition-all duration-1000 relative group-hover:animate-pulse"
                      style={{ width: '73%' }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">
                      73% of total users active today
                    </span>
                    <span className="font-semibold text-teal-600">73%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Registered Users - Enhanced */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                    <Users
                      className="text-blue-600"
                      size={20}
                      strokeWidth={2.5}
                    />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Total Registered Users
                    </h3>
                    <p className="text-xs text-gray-500">All time members</p>
                  </div>
                </div>
                <button className="self-start sm:self-auto px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 rounded-lg text-xs font-medium flex items-center gap-2 hover:from-blue-100 hover:to-purple-100 transition-all duration-200 border border-blue-100 shadow-sm">
                  <span>Today</span>
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-end justify-between">
                  <div className="text-3xl sm:text-4xl font-bold bg-clip-text ">
                    1,689
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-lg text-xs sm:text-sm font-semibold shadow-sm">
                    <TrendingUp size={14} strokeWidth={2.5} />
                    <span>+15.3%</span>
                  </div>
                </div>

                {/* Enhanced progress bar */}
                <div className="space-y-2">
                  <div className="h-2.5 sm:h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-blue-800 via-purple-500 to-blue-400 rounded-full transition-all duration-1000 relative group-hover:animate-pulse"
                      style={{ width: '85%' }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">
                      +127 new users this week
                    </span>
                    <span className="font-semibold text-blue-600">85%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
