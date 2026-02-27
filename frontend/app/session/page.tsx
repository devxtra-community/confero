'use client';

import { socket, connectSocket } from '@/lib/socket';
import { useEffect, useRef, useCallback, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  MessageSquare,
  PhoneOff,
  WifiOff,
  AlertTriangle,
  Home,
  Info,
  Flag,
  Zap,
  Shield,
  Users,
  Clock,
} from 'lucide-react';

type PermissionState = 'idle' | 'requesting' | 'granted' | 'denied';
type CallEndReason = 'USER_ENDED' | 'DISCONNECTED' | 'ICE_FAILED' | 'TIME_LIMIT';

// ── What the OTHER person sees (server-pushed call:end) ───────────────────
const PEER_END_CONFIG: Record<
  CallEndReason,
  { title: string; message: string; icon: React.ReactNode }
> = {
  USER_ENDED: {
    title: 'The call has ended',
    message: 'The other person left the call.',
    icon: null,
  },
  DISCONNECTED: {
    title: 'Connection lost',
    message: 'The other person lost their connection.',
    icon: null,
  },
  ICE_FAILED: {
    title: 'Connection failed',
    message: 'The connection could not be established.',
    icon: null,
  },
  TIME_LIMIT: {
    title: 'Time limit reached',
    message: 'The 3-minute call limit has been reached.',
    icon: null,
  },
};

function VideoCallInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const callId = searchParams.get('callId') ?? '';
  const peerId = searchParams.get('peerId') ?? '';

  const callIdRef = useRef<string>(callId);
  const peerUserIdRef = useRef<string>(peerId);

  useEffect(() => {
    callIdRef.current = callId;
  }, [callId]);
  useEffect(() => {
    peerUserIdRef.current = peerId;
  }, [peerId]);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);
  const tracksAddedRef = useRef(false);
  const isCallActiveRef = useRef(false);
  const sessionStartedRef = useRef(false);

  // ── Guard: once endCall() fires, ignore any incoming call:end from server ─
  // Without this, User A emits call:end → server echoes it back to User A →
  // onCallEnd fires → overwrites the "You left" screen with "call ended".
  const selfEndedRef = useRef(false);
  // Captures callDuration before cleanup() resets it to 0
  // so the ended screen can display the real call length
  const finalDurationRef = useRef(0);
  // Live mirror of callDuration state — always current inside any closure.
  // State closures go stale inside useEffect; refs never do.
  const callDurationRef = useRef(0);

  const [status, setStatus] = useState('Initializing...');
  const [iceState, setIceState] = useState('new');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [permissionState, setPermissionState] =
    useState<PermissionState>('idle');
  const [waitingForPeer, setWaitingForPeer] = useState(false);
  const [isDuplicateTab, setIsDuplicateTab] = useState(false);
  const iceServersRef = useRef<RTCIceServer[] | null>(null);

  // ── Call ended state ──────────────────────────────────────────────────────
  // callEnded + callEndReason: for the OTHER person's ended screen.
  // selfLeft: for the self-initiated "You left" brief screen.
  const [callEnded, setCallEnded] = useState(false);
  const [callEndReason, setCallEndReason] =
    useState<CallEndReason>('USER_ENDED');
  const [selfLeft, setSelfLeft] = useState(false);
  const [finalDuration, setFinalDuration] = useState(0);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isCallStarted) return;
    const t = setInterval(() => {
      setCallDuration(p => {
        const next = p + 1;
        callDurationRef.current = next;
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isCallStarted]);

  // ── Time limit enforcement (frontend) ────────────────────────────────────
  // Backend also enforces at 3 min. Frontend fires first for instant UI.
  useEffect(() => {
    if (!isCallStarted || callDuration < 180) return;
    selfEndedRef.current = true;
    setFinalDuration(callDurationRef.current);
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    socket.emit('call:end', { callId: callIdRef.current, reason: 'TIME_LIMIT' });
    cleanup();
    setCallEndReason('TIME_LIMIT');
    setCallEnded(true);
  }, [callDuration, isCallStarted]); // eslint-disable-line react-hooks/exhaustive-deps

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600),
      m = Math.floor((s % 3600) / 60),
      sec = s % 60;
    return [h, m, sec].map(n => String(n).padStart(2, '0')).join(':');
  };

  // ── Camera ────────────────────────────────────────────────────────────────
  const requestCamera = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    setPermissionState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setPermissionState('granted');
      setStatus('Camera ready');
      return stream;
    } catch {
      setPermissionState('denied');
      setStatus('Camera access denied');
      throw new Error('Camera denied');
    }
  }, []);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    isCallActiveRef.current = false;
    pcRef.current?.close();
    pcRef.current = null;
    tracksAddedRef.current = false;
    remoteStreamRef.current = null;
    setHasRemoteVideo(false);
    setCallDuration(0);
    setIsCallStarted(false);
    setWaitingForPeer(false);
  }, []);

  // ── PeerConnection ────────────────────────────────────────────────────────
  const createPC = useCallback((iceServers: RTCIceServer[]) => {
    const pc = new RTCPeerConnection({ iceServers });

    pc.onicecandidate = e => {
      if (!e.candidate) return;
      socket.emit('webrtc:ice', {
        callId: callIdRef.current,
        to: peerUserIdRef.current,
        candidate: e.candidate.toJSON(),
      });
    };

    pc.onconnectionstatechange = () => {
      setIceState(pc.connectionState);
      if (pc.connectionState === 'connected') {
        setStatus('Connected');
        setIsCallStarted(true);
        setWaitingForPeer(false);
      }
    };

    pc.ontrack = e => {
      if (!remoteStreamRef.current) remoteStreamRef.current = new MediaStream();
      remoteStreamRef.current.addTrack(e.track);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        setHasRemoteVideo(true);
        remoteVideoRef.current.play().catch(() => {});
      }
    };

    return pc;
  }, []);

  const getOrCreatePC = useCallback(
    (iceServers: RTCIceServer[]) => {
      if (pcRef.current) return pcRef.current;
      const pc = createPC(iceServers);
      pcRef.current = pc;
      tracksAddedRef.current = false;
      return pc;
    },
    [createPC]
  );

  const addTracks = useCallback((pc: RTCPeerConnection) => {
    if (tracksAddedRef.current || !localStreamRef.current) return;
    localStreamRef.current
      .getTracks()
      .forEach(t => pc.addTrack(t, localStreamRef.current!));
    tracksAddedRef.current = true;
  }, []);

  // ── Main session effect ───────────────────────────────────────────────────
  useEffect(() => {
    if (!callId || !peerId) return;
    if (sessionStartedRef.current) return;
    sessionStartedRef.current = true;

    const startSession = async () => {
      try {
        await requestCamera();
        isCallActiveRef.current = true;

        const emitReady = () => {
          socket.emit('peer:ready', { callId: callIdRef.current });
          setWaitingForPeer(true);
          setStatus('Waiting for peer camera...');
        };

        try {
          await connectSocket();
          emitReady();
        } catch (err) {
          const error = err as Error;
          if (error.message === 'ALREADY_CONNECTED') {
            setIsDuplicateTab(true);
            localStreamRef.current?.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
            return;
          }
          throw err;
        }
      } catch {
        setStatus('Camera denied — cannot join call');
      }
    };

    startSession();

    const onCallStart = async ({
      callId: cId,
      peerUserId: peer,
      shouldCreateOffer,
      iceServers,
    }: {
      callId: string;
      peerUserId: string;
      shouldCreateOffer: boolean;
      iceServers: RTCIceServer[];
    }) => {
      isCallActiveRef.current = true;
      callIdRef.current = cId;
      peerUserIdRef.current = peer;
      iceServersRef.current = iceServers;
      setStatus('Partner ready — connecting...');

      try {
        const pc = getOrCreatePC(iceServers);
        addTracks(pc);
        if (shouldCreateOffer) {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          await pc.setLocalDescription(offer);
          socket.emit('webrtc:offer', {
            callId: cId,
            offer: pc.localDescription,
            to: peer,
          });
        }
      } catch (err) {
        console.error('[session] call:start error', err);
      }
    };

    const onOffer = async ({
      callId: cId,
      offer,
      from,
    }: {
      callId: string;
      offer: RTCSessionDescriptionInit;
      from: string;
    }) => {
      try {
        if (!iceServersRef.current) return;
        const pc = getOrCreatePC(iceServersRef.current);
        addTracks(pc);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        pendingIceRef.current.forEach(c =>
          pc.addIceCandidate(new RTCIceCandidate(c))
        );
        pendingIceRef.current = [];
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc:answer', {
          callId: cId,
          answer: pc.localDescription,
          to: from,
        });
      } catch (err) {
        console.error('[session] offer error', err);
      }
    };

    const onAnswer = async ({
      answer,
    }: {
      answer: RTCSessionDescriptionInit;
    }) => {
      try {
        if (!pcRef.current) return;
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        pendingIceRef.current.forEach(c =>
          pcRef.current?.addIceCandidate(new RTCIceCandidate(c))
        );
        pendingIceRef.current = [];
      } catch (err) {
        console.error('[session] answer error', err);
      }
    };

    const onIce = ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      if (pcRef.current?.remoteDescription?.type) {
        pcRef.current
          .addIceCandidate(new RTCIceCandidate(candidate))
          .catch(() => {});
      } else {
        pendingIceRef.current.push(candidate);
      }
    };

    // ── call:end from server ──────────────────────────────────────────────
    // Fires when the OTHER person ends/drops — OR echoed back to self.
    // selfEndedRef.current guard prevents this from overwriting the
    // "You left" screen when User A's own emit bounces back from server.
    const onCallEnd = ({ reason }: { reason: CallEndReason }) => {
      if (selfEndedRef.current) return; // self already handled this — ignore echo
      setFinalDuration(callDurationRef.current);
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
      cleanup();
      setCallEndReason(reason ?? 'USER_ENDED');
      setCallEnded(true);
    };

    socket.on('call:start', onCallStart);
    socket.on('webrtc:offer', onOffer);
    socket.on('webrtc:answer', onAnswer);
    socket.on('webrtc:ice', onIce);
    socket.on('call:end', onCallEnd);

    return () => {
      sessionStartedRef.current = false;
      socket.off('call:start', onCallStart);
      socket.off('webrtc:offer', onOffer);
      socket.off('webrtc:answer', onAnswer);
      socket.off('webrtc:ice', onIce);
      socket.off('call:end', onCallEnd);
      socket.off('connect');
      cleanup();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    };
  }, [callId, peerId, requestCamera, getOrCreatePC, addTracks, cleanup]);

  // ── Controls ──────────────────────────────────────────────────────────────
  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
    }
  };

  const toggleVideo = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsVideoOff(!track.enabled);
    }
  };

  // ── endCall — self-initiated ──────────────────────────────────────────────
  // Sets selfEndedRef BEFORE emitting so the echo from server is ignored.
  // Shows "You left the call" briefly then redirects to /home.
  const endCall = () => {
    selfEndedRef.current = true; // guard must be set BEFORE emit
    finalDurationRef.current = callDurationRef.current;
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    socket.emit('call:end', {
      callId: callIdRef.current,
      reason: 'USER_ENDED',
    });
    cleanup();
    setSelfLeft(true);
    setTimeout(() => router.push('/home'), 2000);
  };

  // ── Screens ───────────────────────────────────────────────────────────────

  if (selfLeft) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0b]">
        <style>{`
          @keyframes shrink { from { width: 100%; } to { width: 0%; } }
          .bar-shrink { animation: shrink 2s linear forwards; }
        `}</style>
        <div className="text-center space-y-7">
          <div className="w-16 h-16 mx-auto rounded-full border border-white/10 flex items-center justify-center">
            <PhoneOff className="w-7 h-7 text-white/30" strokeWidth={1.5} />
          </div>
          <div className="space-y-1.5">
            <p className="text-white text-xl font-light tracking-tight">
              You left the call
            </p>
            <p className="text-white/30 text-sm font-mono">Returning to home</p>
          </div>
          <div className="w-40 h-px bg-white/10 mx-auto overflow-hidden rounded-full">
            <div className="h-full bg-white/40 rounded-full bar-shrink" />
          </div>
        </div>
      </div>
    );
  }

  if (callEnded) {
    const config = PEER_END_CONFIG[callEndReason];
    const iconEl =
      callEndReason === 'USER_ENDED' ? (
        <PhoneOff className="w-8 h-8 text-white/40" strokeWidth={1.5} />
      ) : callEndReason === 'DISCONNECTED' ? (
        <WifiOff className="w-8 h-8 text-white/40" strokeWidth={1.5} />
      ) : callEndReason === 'TIME_LIMIT' ? (
        <Clock className="w-8 h-8 text-white/40" strokeWidth={1.5} />
      ) : (
        <AlertTriangle className="w-8 h-8 text-white/40" strokeWidth={1.5} />
      );
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0b] px-4">
        <div className="w-full max-w-xs text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full border border-white/8 flex items-center justify-center">
              {iconEl}
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-white text-2xl font-light tracking-tight">
              {config.title}
            </h2>
            <p className="text-white/35 text-sm leading-relaxed">
              {config.message}
            </p>
            <p className="text-white/20 text-xs font-mono pt-1">
              {fmt(finalDuration)}
            </p>
          </div>
          <div className="w-full h-px bg-white/8" />
          <button
            onClick={() => router.push('/home')}
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-white/12 text-white/70 text-sm font-light tracking-wide hover:border-white/25 hover:text-white transition-all duration-300"
          >
            <Home className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform duration-300" />
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (isDuplicateTab) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0b] px-4">
        <div className="w-full max-w-sm text-center space-y-8">
          <div className="w-16 h-16 mx-auto rounded-full border border-white/8 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-white/30"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <p className="text-white text-xl font-light tracking-tight">
              Session already active
            </p>
            <p className="text-white/35 text-sm leading-relaxed">
              Another tab is connected. Only one tab can be active at a time.
            </p>
            <p className="text-white/20 text-xs pt-1">
              If that tab is closed or crashed, refresh this page.
            </p>
          </div>
          <div className="w-full h-px bg-white/8" />
          <button
            onClick={() => {
              socket.disconnect();
              window.close();
              setTimeout(() => router.push('/login'), 300);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/12 text-white/70 text-sm font-light hover:border-white/25 hover:text-white transition-all duration-300"
          >
            Close this tab
          </button>
        </div>
      </div>
    );
  }

  if (permissionState === 'denied') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0b]">
        <div className="text-center space-y-8 px-4">
          <div className="w-16 h-16 mx-auto rounded-full border border-white/8 flex items-center justify-center">
            <VideoOff className="w-7 h-7 text-white/30" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <p className="text-white text-xl font-light tracking-tight">
              Camera access denied
            </p>
            <p className="text-white/35 text-sm">
              Allow camera access in browser settings and refresh.
            </p>
          </div>
          <div className="w-full h-px bg-white/8 max-w-xs mx-auto" />
          <button
            onClick={() => router.push('/home')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/12 text-white/70 text-sm font-light hover:border-white/25 hover:text-white transition-all duration-300"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  // ── Main call UI ──────────────────────────────────────────────────────────
  return (
    <div
      className="h-screen w-full flex overflow-hidden"
      style={{ background: '#0a0a0b' }}
    >
      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.08); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-breathe { animation: breathe 3s ease-in-out infinite; }
        .animate-fade-up { animation: fadeUp 0.4s ease forwards; }
      `}</style>

      <main className="flex-1 flex flex-col relative h-full">
        {/* ── Top bar ── */}
        <header className="absolute top-0 left-0 right-0 z-20 h-14 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isCallStarted ? (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-500"
                style={{
                  background: callDuration >= 120 ? 'rgba(220,38,38,0.2)' : 'rgba(0,0,0,0.45)',
                  backdropFilter: 'blur(8px)',
                  border: callDuration >= 120 ? '1px solid rgba(220,38,38,0.3)' : '1px solid transparent',
                }}
              >
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${callDuration >= 120 ? 'bg-red-400' : 'bg-red-500'}`} />
                <span className={`text-xs font-mono tracking-widest transition-colors duration-500 ${callDuration >= 120 ? 'text-red-300' : 'text-white'}`}>
                  {fmt(callDuration)}
                </span>
              </div>
            ) : (
              <span
                className="text-white/35 text-xs font-mono tracking-widest uppercase px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(0,0,0,0.35)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {status}
              </span>
            )}
          </div>
          <span className="text-white/15 text-xs font-mono">{iceState}</span>
        </header>

        {/* ── Video area ── */}
        {/*
          h-full is critical: section must have explicit height so absolute
          children (controls, local video) are positioned within the viewport.
          Without it, section collapses to 0 and controls overflow below screen.
          Layout mirrors Google Meet: remote video fills section, controls float
          over video at bottom, local video sits just above controls on the right.
        */}
        <section className="flex-1 relative h-full overflow-hidden">
          {/* Remote video — fills entire section */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          />

          {!hasRemoteVideo && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0b] z-10">
              <div className="relative w-28 h-28 flex items-center justify-center mb-8">
                <div className="absolute inset-0 rounded-full border border-white/20 animate-breathe" />
                <div
                  className="absolute inset-3 rounded-full border border-white/10 animate-breathe"
                  style={{ animationDelay: '0.6s' }}
                />
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Video className="w-4 h-4 text-white/25" strokeWidth={1.5} />
                </div>
              </div>
              <div className="text-center space-y-1.5 animate-fade-up">
                <p className="text-white/60 text-sm font-light tracking-wide">
                  {permissionState === 'requesting' &&
                    'Requesting camera access…'}
                  {permissionState === 'granted' &&
                    waitingForPeer &&
                    'Waiting for your partner…'}
                  {permissionState === 'granted' && !waitingForPeer && status}
                </p>
                {waitingForPeer && (
                  <p className="text-white/20 text-xs font-mono">connecting</p>
                )}
              </div>
            </div>
          )}

          {/*
            ── Responsive layout ────────────────────────────────────────────
            Mobile  : local video = small PiP top-right corner (z-30)
                      controls   = centered pill fixed at bottom
            Desktop : local video = bottom-right corner, PiP above controls
                      controls   = centered pill at bottom
          */}

          {/* Local video PiP — top-right on mobile, bottom-right on sm+ */}
          <div
            className="absolute top-16 right-3 sm:bottom-20 sm:top-auto sm:right-4 z-30 w-34 sm:w-44 md:w-52 xl:w-72 rounded-xl overflow-hidden"
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              aspectRatio: '16/9',
            }}
          >
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <span
              className={`absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full border border-black/20
                ${permissionState === 'granted' ? 'bg-emerald-400' : 'bg-white/20'}`}
            />
            <span className="absolute bottom-1.5 left-2 text-white/40 text-[9px] font-mono leading-none">
              you
            </span>
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 h-36 z-20 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)',
            }}
          />

          {/* Controls bar */}
          <div className="absolute bottom-5 left-0 right-0 z-30 flex justify-center px-4">
            <div
              className="flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-2.5 rounded-full"
              style={{
                background: 'rgba(12,12,13,0.82)',
                border: '1px solid rgba(255,255,255,0.09)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}
            >
              {/* Mute */}
              <button
                onClick={toggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95
                  ${isMuted ? 'text-red-400' : 'text-white/55 hover:text-white'}`}
              >
                {isMuted ? (
                  <MicOff className="w-[17px] h-[17px]" strokeWidth={1.5} />
                ) : (
                  <Mic className="w-[17px] h-[17px]" strokeWidth={1.5} />
                )}
              </button>

              {/* Camera toggle */}
              <button
                onClick={toggleVideo}
                title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95
                  ${isVideoOff ? 'text-red-400' : 'text-white/55 hover:text-white'}`}
              >
                {isVideoOff ? (
                  <VideoOff className="w-[17px] h-[17px]" strokeWidth={1.5} />
                ) : (
                  <Video className="w-[17px] h-[17px]" strokeWidth={1.5} />
                )}
              </button>

              <div
                className="w-px h-4 mx-0.5"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              />

              {/* End call */}
              <button
                onClick={endCall}
                title="End call"
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-90"
                style={{ background: '#dc2626' }}
              >
                <Phone
                  className="w-[17px] h-[17px] text-white rotate-[135deg]"
                  strokeWidth={2}
                />
              </button>

              <div
                className="w-px h-4 mx-0.5"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              />

              {/* Chat */}
              <button
                onClick={() => {
                  setShowChat(!showChat);
                  setShowInfo(false);
                }}
                title="Chat"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95
                  ${showChat ? 'text-white' : 'text-white/55 hover:text-white'}`}
              >
                <MessageSquare
                  className="w-[17px] h-[17px]"
                  strokeWidth={1.5}
                />
              </button>

              {/* Info — opens rules/report/guidelines panel */}
              {/* Settings removed: had no functionality — zero onClick handler.
                  Replaced with Info which opens the rules & report slide-in panel. */}
              <button
                onClick={() => {
                  setShowInfo(!showInfo);
                  setShowChat(false);
                }}
                title="Info & Report"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95
                  ${showInfo ? 'text-white' : 'text-white/55 hover:text-white'}`}
              >
                <Info className="w-[17px] h-[17px]" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Chat panel ── */}
      {showChat && (
        <aside
          className="fixed inset-0 z-50 lg:static lg:inset-auto w-full lg:w-80 flex flex-col"
          style={{
            background: '#0f0f10',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <header
            className="h-14 px-5 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-white/60 text-sm font-light tracking-wide">
              Messages
            </span>
            <button
              onClick={() => setShowChat(false)}
              className="text-white/25 hover:text-white/60 transition-colors text-lg leading-none"
            >
              ✕
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white/50 flex-shrink-0"
                style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                }}
              >
                P
              </div>
              <div className="space-y-1">
                <p className="text-white/25 text-xs font-mono">peer</p>
                <div
                  className="text-white/60 text-sm leading-relaxed px-3 py-2 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  Hey, how is the connection?
                </div>
              </div>
            </div>
          </div>

          <footer
            className="p-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex gap-2">
              <input
                placeholder="Message…"
                className="flex-1 bg-transparent text-white/70 text-sm px-3 py-2.5 rounded-xl outline-none placeholder:text-white/20"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <div className="relative group">
                <button
                  disabled
                  className="px-4 py-2.5 rounded-xl text-white/20 text-sm font-light cursor-not-allowed"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  Send
                </button>
                <div
                  className="absolute bottom-full right-0 mb-2 w-48 px-3 py-2 rounded-xl text-white/50 text-xs font-light leading-relaxed pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{
                    background: '#1a1a1b',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  We&apos;re working on adding this feature — sorry for the
                  inconvenience.
                  <span
                    className="absolute bottom-[-5px] right-5 w-2.5 h-2.5 rotate-45"
                    style={{
                      background: '#1a1a1b',
                      borderRight: '1px solid rgba(255,255,255,0.08)',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}
                  />
                </div>
              </div>
            </div>
          </footer>
        </aside>
      )}

      {/* ── Info panel ── */}
      {/* Slide-in from right, same structure as chat panel.
          Contains: match rules, skills tip, report user, community guidelines.
          All content is dummy — replace with your real project details.
          showInfo and showChat are mutually exclusive (each closes the other). */}
      {showInfo && (
        <aside
          className="fixed inset-0 z-50 lg:static lg:inset-auto w-full lg:w-80 flex flex-col overflow-hidden"
          style={{
            background: '#0f0f10',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <header
            className="h-14 px-5 flex items-center justify-between flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span className="text-white/60 text-sm font-light tracking-wide">
              Info & Guidelines
            </span>
            <button
              onClick={() => setShowInfo(false)}
              className="text-white/25 hover:text-white/60 transition-colors text-lg leading-none"
            >
              ✕
            </button>
          </header>

          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Section 1: How matching works */}
            <div
              className="px-5 pt-5 pb-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <Users className="w-3.5 h-3.5 text-white/50" strokeWidth={1.5} />
                </div>
                <span className="text-white/70 text-sm font-medium">How matching works</span>
              </div>
              <div className="space-y-2.5 pl-9">
                {[
                  'You are matched with someone who shares at least one skill with you.',
                  'Matches are made in real time — the more skills you add, the faster you connect.',
                  'Both users must accept the match before the call starts.',
                  'You can find another match at any time from the home screen.',
                ].map((rule, i) => (
                  <div key={i} className="flex gap-2.5">
                    <span className="text-white/20 text-xs font-mono mt-0.5 flex-shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-white/40 text-xs leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Get matched faster */}
            <div
              className="px-5 pt-4 pb-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <Zap className="w-3.5 h-3.5 text-white/50" strokeWidth={1.5} />
                </div>
                <span className="text-white/70 text-sm font-medium">Get matched faster</span>
              </div>
              <div className="space-y-2 pl-9">
                <p className="text-white/40 text-xs leading-relaxed">
                  Users with more skills in their profile appear in more match
                  queues — increasing your chance of a faster connection.
                </p>
                <div className="mt-3 space-y-1.5">
                  {[
                    'Add skills that reflect your real expertise',
                    'Include both broad and niche skills',
                    'Update your profile regularly',
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-white/20 mt-1.5 flex-shrink-0" />
                      <p className="text-white/35 text-xs leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: Report a user */}
            <div
              className="px-5 pt-4 pb-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <Flag className="w-3.5 h-3.5 text-white/50" strokeWidth={1.5} />
                </div>
                <span className="text-white/70 text-sm font-medium">Report a user</span>
              </div>
              <div className="space-y-2 pl-9">
                <p className="text-white/40 text-xs leading-relaxed">
                  If someone is behaving inappropriately, you can report them.
                  All reports are reviewed by our team.
                </p>
                <div className="mt-3 space-y-1.5">
                  {[
                    'Harassment or abusive language',
                    'Inappropriate or explicit content',
                    'Spam or promotional content',
                    'Impersonation or fake identity',
                  ].map((reason, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg cursor-pointer transition-all hover:bg-white/4"
                      style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <span className="w-1 h-1 rounded-full bg-white/20 flex-shrink-0" />
                      <p className="text-white/35 text-xs flex-1">{reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4: Community guidelines */}
            <div className="px-5 pt-4 pb-6">
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <Shield className="w-3.5 h-3.5 text-white/50" strokeWidth={1.5} />
                </div>
                <span className="text-white/70 text-sm font-medium">Community guidelines</span>
              </div>
              <div className="space-y-2 pl-9">
                {[
                  'Be respectful — treat every person the way you want to be treated.',
                  'No harassment, hate speech, or discriminatory language of any kind.',
                  'Keep conversations relevant and constructive.',
                  'Protect your privacy — avoid sharing personal contact details.',
                  'Violations may result in permanent removal from the platform.',
                ].map((rule, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-white/20 mt-1.5 flex-shrink-0" />
                    <p className="text-white/35 text-xs leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
          <p className="text-white/30 text-sm font-mono">Loading…</p>
        </div>
      }
    >
      <VideoCallInner />
    </Suspense>
  );
}