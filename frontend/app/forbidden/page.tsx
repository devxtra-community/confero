'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TriangleAlert } from 'lucide-react';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center mx-4">
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <TriangleAlert size={50} color="red" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>

        <p className="text-gray-500 text-sm mb-6">Error 403 - Forbidden</p>

        <div className="mb-8 space-y-2">
          <p className="text-gray-700">
            You don&apos;t have permission to access this page.
          </p>
          <p className="text-sm text-gray-600">
            This area requires{' '}
            <span className="font-semibold text-red-600">
              administrator privileges
            </span>
            .
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/home')}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-hoverMain transition-colors"
          >
            Go to Home
          </button>

          <Link
            href="/login"
            className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-block"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
