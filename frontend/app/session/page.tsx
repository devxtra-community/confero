'use client';

import { socket } from '@/lib/socket';
import { useEffect, useRef, useCallback, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Settings,
  MessageSquare,
} from 'lucide-react';

type PermissionState = 'idle' | 'requesting' | 'granted' | 'denied';

// ── Inner component that uses useSearchParams ──────────────────────────────
function VideoCallInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read directly from URL — never from props
  const callId = searchParams.get('callId') ?? '';
  const peerId = searchParams.get('peerId') ?? '';

  // Keep latest values in refs so async callbacks always see current value
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
  const sessionStartedRef = useRef(false); // guard against StrictMode double-fire

  const [status, setStatus] = useState('Initializing...');
  const [iceState, setIceState] = useState('new');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const [permissionState, setPermissionState] =
    useState<PermissionState>('idle');
  const [waitingForPeer, setWaitingForPeer] = useState(false);

  const iceServersRef = useRef<RTCIceServer[] | null>(null);

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isCallStarted) return;
    const t = setInterval(() => setCallDuration(p => p + 1), 1000);
    return () => clearInterval(t);
  }, [isCallStarted]);

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600),
      m = Math.floor((s % 3600) / 60),
      sec = s % 60;
    return [h, m, sec].map(n => String(n).padStart(2, '0')).join(':');
  };

  // ── Camera ───────────────────────────────────────────────────────────────
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

  // ── Cleanup ──────────────────────────────────────────────────────────────
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

  // ── PeerConnection ───────────────────────────────────────────────────────
  const createPC = useCallback((iceServers: RTCIceServer[]) => {
    console.log('CREATING PC WITH ICE:', iceServers);
    const pc = new RTCPeerConnection({
      iceServers,
    });

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

  // ── Main session effect ──────────────────────────────────────────────────
  // Depends on callId so it re-runs once searchParams resolves from '' to real value
  useEffect(() => {
    // Don't run until we have a real callId
    if (!callId || !peerId) return;

    // StrictMode guard — only start once per real mount
    if (sessionStartedRef.current) return;
    sessionStartedRef.current = true;

    const startSession = async () => {
      try {
        console.log('[session] Starting — callId:', callId, 'peerId:', peerId);
        await requestCamera();
        isCallActiveRef.current = true;

        const emitReady = () => {
          console.log(
            '[session] Emitting peer:ready — callId:',
            callIdRef.current
          );
          socket.emit('peer:ready', { callId: callIdRef.current });
          setWaitingForPeer(true);
          setStatus('Waiting for peer camera...');
        };

        if (socket.connected) {
          emitReady();
        } else {
          socket.once('connect', emitReady);
          socket.connect();
        }
      } catch {
        setStatus('Camera denied — cannot join call');
      }
    };

    startSession();

    // ── Socket event handlers ────────────────────────────────────────────
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
      console.log(
        '[session] call:start — shouldCreateOffer:',
        shouldCreateOffer
      );
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
      console.log('[session] webrtc:offer from', from);
      try {
        if (!iceServersRef.current) {
          console.error('ICE servers not initialized');
          return;
        }

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
      console.log('[session] webrtc:answer received');
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

    const onCallEnd = () => {
      console.log('[session] call:end');
      cleanup();
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
      socket.off('connect'); // remove pending ready emitter if unmounted early
      cleanup();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    };
  }, [callId, peerId, requestCamera, getOrCreatePC, addTracks, cleanup]);

  // ── Controls ─────────────────────────────────────────────────────────────
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

  const endCall = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    socket.emit('call:end', {
      callId: callIdRef.current,
      reason: 'USER_ENDED',
    });
    cleanup();
    setTimeout(() => router.push('/home'), 500);
  };

  // ── Denied screen ─────────────────────────────────────────────────────────
  if (permissionState === 'denied') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <VideoOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-white text-xl font-semibold mb-2">
            Camera Access Denied
          </h2>
          <p className="text-gray-400 mb-4">
            Allow camera access in browser settings and refresh.
          </p>
          <button
            onClick={() => router.push('/home')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full flex overflow-hidden">
      <main className="flex-1 flex flex-col relative">
        <header className="h-14 px-6 bg-background flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isCallStarted && (
              <>
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-primary text-sm">
                  REC {fmt(callDuration)}
                </span>
              </>
            )}
          </div>
          <h1 className="text-primary font-medium text-sm lg:text-base">
            Video Call – {status}
          </h1>
          <span className="hidden md:inline-block bg-primary px-3 py-1 rounded text-xs text-white">
            ICE: {iceState}
          </span>
        </header>

        <section className="flex-1 relative">
          {/* Remote video — full screen */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />

          {/* Waiting overlay */}
          {!hasRemoteVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white text-4xl">👤</span>
                </div>
                <p className="text-white text-lg font-medium">
                  {permissionState === 'requesting' &&
                    'Waiting for camera permission...'}
                  {permissionState === 'granted' &&
                    waitingForPeer &&
                    'Your camera is ready! Waiting for partner...'}
                  {permissionState === 'granted' && !waitingForPeer && status}
                </p>
                {waitingForPeer && (
                  <div className="mt-3 flex justify-center gap-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Local video — bottom right corner */}
          <div className="absolute bottom-10 right-3 lg:w-80 h-45 sm:w-60 sm:h-40 rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <span
              className={`absolute bottom-2 right-2 w-3 h-3 rounded-full border-2 border-white
              ${permissionState === 'granted' ? 'bg-green-500' : 'bg-gray-500'}`}
            />
            {permissionState === 'granted' && (
              <span className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-1.5 py-0.5 rounded">
                You
              </span>
            )}
          </div>

          {/* Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-800/80 backdrop-blur px-6 py-3 rounded-full">
            <button
              onClick={toggleMute}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition
                ${isMuted ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              {isMuted ? (
                <MicOff className="text-white" />
              ) : (
                <Mic className="text-white" />
              )}
            </button>
            <button
              onClick={toggleVideo}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition
                ${isVideoOff ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              {isVideoOff ? (
                <VideoOff className="text-white" />
              ) : (
                <Video className="text-white" />
              )}
            </button>
            <button
              onClick={endCall}
              className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center"
            >
              <Phone className="text-white rotate-135" />
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className="w-11 h-11 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center"
            >
              <MessageSquare className="text-white" />
            </button>
            <button className="w-11 h-11 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center">
              <Settings className="text-white" />
            </button>
          </div>
        </section>
      </main>

      {showChat && (
        <aside className="fixed inset-0 z-50 lg:static lg:inset-auto w-full lg:w-96 bg-gray-800 flex flex-col">
          <header className="h-14 px-4 bg-gray-700 flex items-center justify-between">
            <h2 className="text-white font-medium">Messages</h2>
            <button
              onClick={() => setShowChat(false)}
              className="text-gray-300 hover:text-white text-lg"
            >
              ✕
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">
                P
              </div>
              <div>
                <p className="text-gray-400 text-xs">Peer</p>
                <div className="bg-gray-700 text-sm text-white p-3 rounded-lg">
                  Hey, how is the connection?
                </div>
              </div>
            </div>
          </div>
          <footer className="p-4 bg-gray-700">
            <div className="flex gap-2">
              <input
                placeholder="Write message..."
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg outline-none"
              />
              <button className="bg-blue-600 hover:bg-blue-700 px-4 rounded-lg text-white">
                Send
              </button>
            </div>
          </footer>
        </aside>
      )}
    </div>
  );
}

// ── Outer page wraps inner in Suspense (required for useSearchParams in Next.js) ──
export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <p className="text-white">Loading session...</p>
        </div>
      }
    >
      <VideoCallInner />
    </Suspense>
  );
}
