'use client';

import { io, Socket } from 'socket.io-client';
import { useEffect, useRef, useCallback, useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  Settings,
  MessageSquare,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VideoCallProps {
  callId: string;
  peerUserId: string;
  isInitiator: boolean;
}

export default function VideoCall({
  callId,
  peerUserId,
  isInitiator,
}: VideoCallProps) {
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const callIdRef = useRef<string>(callId);
  const peerUserIdRef = useRef<string>(peerUserId);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const tracksAddedRef = useRef<boolean>(false);

  const [status, setStatus] = useState<string>('Initializing...');
  const [iceState, setIceState] = useState<string>('new');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallStarted, setIsCallStarted] = useState(false);

  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

  const isCallActiveRef = useRef(false);

  const router = useRouter();

  useEffect(() => {
    if (isCallStarted) {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isCallStarted]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getMediaStream = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;

    try {
      console.log('📹 Requesting media stream...');
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
      setStatus('Media ready');
      return stream;
    } catch (err: unknown) {
      console.error(' Media error:', err);
      setStatus('Media access denied');
      throw err;
    }
  }, []);

  const cleanup = useCallback(() => {
    isCallActiveRef.current = false;
    pcRef.current?.close();
    pcRef.current = null;
    tracksAddedRef.current = false;
    remoteStreamRef.current = null;
    setHasRemoteVideo(false);
    setCallDuration(0);
    setIsCallStarted(false);
  }, []);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    pc.onicecandidate = event => {
      if (!isCallActiveRef.current || !event.candidate) return;
      socketRef.current?.emit('webrtc:ice', {
        callId: callIdRef.current,
        to: peerUserIdRef.current,
        candidate: event.candidate.toJSON(),
      });
    };

    pc.onconnectionstatechange = () => {
      setIceState(pc.connectionState);
      if (pc.connectionState === 'connected') {
        setStatus('Connected successfully');
        setIsCallStarted(true);
      }
    };

    pc.ontrack = event => {
      console.log('🎥 REMOTE TRACK RECEIVED:', event.track.kind);
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
      }

      remoteStreamRef.current.addTrack(event.track);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        setHasRemoteVideo(true);
        remoteVideoRef.current.play().catch(() => {});
      }
    };

    return pc;
  }, []);

  const getOrCreatePC = useCallback(() => {
    if (pcRef.current) return pcRef.current;
    const pc = createPeerConnection();
    pcRef.current = pc;
    tracksAddedRef.current = false;
    return pc;
  }, [createPeerConnection]);

  const addTracksToPC = useCallback(
    async (pc: RTCPeerConnection) => {
      if (tracksAddedRef.current) return;
      const stream = await getMediaStream();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      tracksAddedRef.current = true;
    },
    [getMediaStream]
  );

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      path: '/live/socket.io',
      withCredentials: true,
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', async () => {
      setStatus('Connected to server');
      if (isInitiator) {
        isCallActiveRef.current = true;
        try {
          await getMediaStream();
          socket.emit('call:initiate', {
            callId: callIdRef.current,
            toUserId: peerUserIdRef.current,
          });
        } catch (err: unknown) {
          console.error(' Media error:', err);
          throw err;
        }
      }
    });

    socket.on('call:incoming', async ({ callId, from }) => {
      callIdRef.current = callId;
      peerUserIdRef.current = from;
      isCallActiveRef.current = true;
      try {
        await getMediaStream();
        getOrCreatePC();
        socket.emit('call:accept', { callId });
      } catch (err: unknown) {
        console.error(' Media error:', err);
        throw err;
      }
    });

    socket.on('webrtc:offer', async ({ callId, offer, from }) => {
      try {
        const pc = getOrCreatePC();
        await addTracksToPC(pc);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        pendingIceCandidatesRef.current.forEach(c =>
          pc.addIceCandidate(new RTCIceCandidate(c))
        );
        pendingIceCandidatesRef.current = [];

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc:answer', {
          callId,
          answer: pc.localDescription,
          to: from,
        });
      } catch (err: unknown) {
        console.error(' Media error:', err);
        throw err;
      }
    });

    socket.on('call:accepted', async ({ callId, to }) => {
      isCallActiveRef.current = true;
      try {
        const pc = getOrCreatePC();
        await addTracksToPC(pc);
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);
        socket.emit('webrtc:offer', { callId, offer: pc.localDescription, to });
      } catch (err: unknown) {
        console.error(' Media error:', err);
        throw err;
      }
    });

    socket.on('webrtc:answer', async ({ answer }) => {
      try {
        if (pcRef.current) {
          await pcRef.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          pendingIceCandidatesRef.current.forEach(c =>
            pcRef.current?.addIceCandidate(new RTCIceCandidate(c))
          );
          pendingIceCandidatesRef.current = [];
        }
      } catch (err: unknown) {
        console.error(' Media error:', err);
        throw err;
      }
    });

    socket.on('webrtc:ice', async ({ candidate }) => {
      const pc = pcRef.current;
      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      } else {
        pendingIceCandidatesRef.current.push(candidate);
      }
    });

    socket.on('call:end', () => cleanup());

    return () => {
      cleanup();
      socket.disconnect();
    };
  }, [isInitiator, getOrCreatePC, addTracksToPC, cleanup, getMediaStream]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsVideoOff(!track.enabled);
      }
    }
  };

  const endCall = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    socketRef.current?.emit('call:end', {
      callId: callIdRef.current,
      reason: 'USER_ENDED',
    });

    cleanup();
    setTimeout(() => {
      router.push('/home');
    }, 1100);
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden">
      <main className="flex-1 flex flex-col relative">
        <header className="h-14 px-6 bg-background flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isCallStarted && (
              <>
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-primary text-sm">
                  REC {formatDuration(callDuration)}
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

        <section className="flex-1 relative ">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />

          {!hasRemoteVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white text-4xl">👤</span>
                </div>
                <p className="text-white text-lg font-medium">{status}</p>
                <p className="text-gray-400 text-sm mt-2">
                  Waiting for peer...
                </p>
              </div>
            </div>
          )}

          <div className="absolute bottom-10 right-3 lg:w-80 h-45 sm:w-60 sm:h-40 rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <span className="absolute bottom-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-800/80 backdrop-blur px-6 py-3 rounded-full">
            <button
              onClick={toggleMute}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition ${isMuted ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              {isMuted ? (
                <MicOff className="text-white" />
              ) : (
                <Mic className="text-white" />
              )}
            </button>
            <button
              onClick={toggleVideo}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition ${isVideoOff ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
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
                  Hey, How s the connection
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
