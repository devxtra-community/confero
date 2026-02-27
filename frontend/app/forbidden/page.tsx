'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TriangleAlert } from 'lucide-react';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 40%, #f0fdf4 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&display=swap');

        /* Soft background blobs like the app */
        .forbidden-bg-blob-1 {
          position: absolute;
          top: -120px;
          right: -100px;
          width: 500px;
          height: 500px;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(134,239,172,0.25) 0%, transparent 70%);
          pointer-events: none;
        }
        .forbidden-bg-blob-2 {
          position: absolute;
          bottom: -150px;
          left: -120px;
          width: 450px;
          height: 450px;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(74,222,128,0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        /* The giant gradient 403 hero number */
        .hero-403 {
          font-size: clamp(120px, 22vw, 200px);
          font-weight: 800;
          font-family: 'DM Sans', sans-serif;
          background: linear-gradient(135deg, #16a34a 0%, #22c55e 40%, #4ade80 70%, #86efac 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          letter-spacing: -0.05em;
          margin: 0;
          display: block;
          /* Subtle drop shadow for depth */
          filter: drop-shadow(0 8px 32px rgba(34,197,94,0.25));
          animation: fadeSlideUp 0.6s ease both;
        }

        .forbidden-content {
          animation: fadeSlideUp 0.6s ease 0.1s both;
          opacity: 0;
        }

        .forbidden-actions {
          animation: fadeSlideUp 0.6s ease 0.2s both;
          opacity: 0;
        }

        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 32px;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          border: none;
          border-radius: 9999px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 220ms ease;
          letter-spacing: -0.01em;
          box-shadow: 0 4px 20px rgba(34,197,94,0.35);
          text-decoration: none;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(34,197,94,0.45);
          background: linear-gradient(135deg, #15803d, #16a34a);
        }
        .btn-primary:active {
          transform: translateY(0) scale(0.97);
        }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 32px;
          background: rgba(255,255,255,0.7);
          border: 1.5px solid rgba(34,197,94,0.25);
          border-radius: 9999px;
          color: #16a34a;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 220ms ease;
          letter-spacing: -0.01em;
          text-decoration: none;
          backdrop-filter: blur(8px);
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.95);
          border-color: rgba(34,197,94,0.45);
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(34,197,94,0.12);
        }
        .btn-ghost:active {
          transform: translateY(0) scale(0.97);
        }

        /* Small badge — like "Ready to Connect" pill in the app */
        .error-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(34,197,94,0.3);
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 500;
          color: #16a34a;
          letter-spacing: 0.02em;
          backdrop-filter: blur(8px);
          margin-bottom: 12px;
        }

        .dot-pulse {
          width: 7px;
          height: 7px;
          border-radius: 9999px;
          background: #22c55e;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>

      {/* Background blobs */}
      <div className="forbidden-bg-blob-1" />
      <div className="forbidden-bg-blob-2" />

      <div style={{
        textAlign: 'center',
        maxWidth: '520px',
        width: '100%',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Hero 403 */}
        <span className="hero-403">403</span>

        {/* Content block */}
        <div className="forbidden-content" style={{ marginTop: '8px', marginBottom: '36px' }}>
          {/* Badge */}
          <div style={{ marginBottom: '20px' }}>
            <span className="error-badge">
              <span className="dot-pulse" />
              Access Restricted
            </span>
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize: 'clamp(26px, 5vw, 34px)',
            fontWeight: 700,
            color: '#111827',
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            margin: '0 0 14px 0',
          }}>
            You don&apos;t have permission<br />for this page
          </h1>

          {/* Subtext */}
          <p style={{
            fontSize: '15px',
            color: '#6b7280',
            lineHeight: 1.65,
            margin: 0,
            maxWidth: '380px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            This area is restricted. If you believe this is a mistake, contact your administrator or head back to safety.
          </p>
        </div>

        {/* Action buttons */}
        <div className="forbidden-actions" style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <button className="btn-primary" onClick={() => router.push('/home')}>
            ← Go Home
          </button>
          <button className="btn-ghost" onClick={() => router.back()}>
            Go Back
          </button>
        </div>

      </div>
    </div>
  );
}