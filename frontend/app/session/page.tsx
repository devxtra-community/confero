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

export default function SocketTest() {
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const callIdRef = useRef<string | null>(null);
  const peerUserIdRef = useRef<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const tracksAddedRef = useRef<boolean>(false);

  const [status, setStatus] = useState<string>('Initializing...');
  const [iceState, setIceState] = useState<string>('new');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(true);

  //this is the audio and video connection thing
  const getMediaStream = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setStatus('Media ready');
      return stream;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Media error:', err.message);
        setStatus(err.message);
      } else {
        console.error('Media error:', err);
        setStatus('Media access denied');
      }
      throw err;
    }
  }, []);

  // CLEANUP FUNCTION
  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    tracksAddedRef.current = false;

    localStreamRef.current?.getTracks().forEach(track => track.stop());
    localStreamRef.current = null;

    remoteStreamRef.current = null;
  }, []);

  // PEER CONNECTION CODE IS HERE
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    pc.onicecandidate = event => {
      if (event.candidate && callIdRef.current && peerUserIdRef.current) {
        console.log(
          'Sending ICE candidate:',
          event.candidate.candidate.substring(0, 50)
        );
        socketRef.current?.emit('webrtc:ice', {
          callId: callIdRef.current,
          to: peerUserIdRef.current,
          candidate: event.candidate.toJSON(),
        });
      } else if (!event.candidate) {
        console.log('ICE gathering complete');
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection:', pc.connectionState);
      setStatus(`Connection: ${pc.connectionState}`);

      if (pc.connectionState === 'connected') {
        setStatus('Connected successfully');
      } else if (pc.connectionState === 'failed') {
        setStatus('Connection failed');
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE:', pc.iceConnectionState);
      setIceState(pc.iceConnectionState);

      if (pc.iceConnectionState === 'failed') {
        console.error('ICE connection failed');
        socketRef.current?.emit('webrtc:ice-failed', {
          callId: callIdRef.current,
        });
      }
    };

    pc.onicegatheringstatechange = () => {
      console.log('ICE Gathering:', pc.iceGatheringState);
    };

    pc.ontrack = event => {
      console.log('Remote track received:', event.track.kind);

      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStreamRef.current;
        }
      }

      remoteStreamRef.current.addTrack(event.track);

      // Play video safely
      if (remoteVideoRef.current && remoteVideoRef.current.paused) {
        remoteVideoRef.current.play().catch(err => {
          if (err.name !== 'AbortError') {
            console.error('Remote video play error:', err);
          }
        });
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
      if (tracksAddedRef.current) {
        console.log('Tracks already added, skipping');
        return;
      }

      const stream = await getMediaStream();
      stream.getTracks().forEach(track => {
        const sender = pc.addTrack(track, stream);
        console.log('Added track:', track.kind, 'Sender:', sender);
      });

      tracksAddedRef.current = true;
    },
    [getMediaStream]
  );

  // SOCKET SETUP STARTS HERE
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL, {
      path: '/live/socket.io',
      withCredentials: true,
    });

    socketRef.current = socket;
    if (typeof window !== 'undefined') {
      window.socket = socket;
    }

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setStatus('Connected to server');
    });

    socket.onAny((event, data) => {
      console.log('EVENT:', event, JSON.stringify(data).substring(0, 100));
    });

    // RECEIVER OF THE INCOMING CALL
    socket.on('call:incoming', async ({ callId, from }) => {
      console.log('Incoming call from:', from);
      setStatus('Incoming call...');

      callIdRef.current = callId;
      peerUserIdRef.current = from;

      // Auto-accept
      socket.emit('call:accept', { callId });
      setStatus('Call accepted, waiting for offer...');
    });

    socket.on('webrtc:offer', async ({ callId, offer }) => {
      console.log('Received offer');
      setStatus('Received offer, creating answer...');

      try {
        const pc = getOrCreatePC();
        await addTracksToPC(pc);

        console.log('Setting remote description (offer)...');
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        console.log('Remote description set (offer)');

        // Process pending ICE candidates AFTER setting remote description
        console.log(
          `Processing ${pendingIceCandidatesRef.current.length} pending ICE candidates`
        );
        for (const c of pendingIceCandidatesRef.current) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(c));
            console.log('Added pending ICE candidate');
          } catch (err: unknown) {
            if (err instanceof Error) {
              console.error('Failed to add pending ICE:', err.message);
            } else {
              console.error('Failed to add pending ICE:', err);
            }
          }
        }
        pendingIceCandidatesRef.current = [];

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log('Created and set local description (answer)');

        socket.emit('webrtc:answer', {
          callId,
          answer: pc.localDescription,
          to: peerUserIdRef.current,
        });

        setStatus('Answer sent, connecting...');
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Error handling offer:', err.message);
          setStatus('Error: ' + err.message);
        } else {
          console.error('Error handling offer:', err);
          setStatus('Error occurred while handling offer');
        }
      }
    });

    //CALLER (initiates call)
    socket.on('call:accepted', async ({ callId, to }) => {
      console.log('Call accepted by:', to);
      setStatus('Call accepted, creating offer...');

      try {
        callIdRef.current = callId;
        peerUserIdRef.current = to;

        const pc = getOrCreatePC();
        await addTracksToPC(pc);

        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);
        console.log('Created and set local description (offer)');

        socket.emit('webrtc:offer', {
          callId,
          offer: pc.localDescription,
          to,
        });

        setStatus('Offer sent, waiting for answer...');
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Error creating offer:', err.message);
          setStatus('Error: ' + err.message);
        } else {
          console.error('Error creating offer:', err);
          setStatus('Error occurred while creating offer');
        }
      }
    });

    socket.on('webrtc:answer', async ({ answer }) => {
      console.log('Received answer');

      try {
        if (!pcRef.current) {
          console.error('No peer connection exists');
          return;
        }

        console.log('Setting remote description (answer)...');
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        console.log('Remote description set (answer)');

        // Process pending ICE candidates AFTER setting remote description
        console.log(
          `Processing ${pendingIceCandidatesRef.current.length} pending ICE candidates`
        );
        for (const c of pendingIceCandidatesRef.current) {
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(c));
            console.log('Added pending ICE candidate');
          } catch (err: unknown) {
            if (err instanceof Error) {
              console.error('Failed to add pending ICE:', err.message);
            } else {
              console.error('Failed to add pending ICE:', err);
            }
          }
        }
        pendingIceCandidatesRef.current = [];

        setStatus('Negotiation complete, connecting...');
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Error handling answer:', err.message);
          setStatus('Error: ' + err.message);
        } else {
          console.error('Error handling answer:', err);
          setStatus('Error occurred while handling answer');
        }
      }
    });

    socket.on('webrtc:ice', async ({ candidate }) => {
      console.log('Received ICE candidate');

      const pc = pcRef.current;
      if (!pc) {
        console.log('No PC yet, queuing ICE candidate');
        pendingIceCandidatesRef.current.push(candidate);
        return;
      }

      if (pc.remoteDescription && pc.remoteDescription.type) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('Added ICE candidate immediately');
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error('Failed to add ICE candidate:', err.message);
          } else {
            console.error('Failed to add ICE candidate:', err);
          }
        }
      } else {
        console.log('No remote description yet, queuing ICE');
        pendingIceCandidatesRef.current.push(candidate);
      }
    });

    socket.on('call:timeout', () => {
      setStatus('Call timeout');
    });

    socket.on('call:end', ({ reason }) => {
      setStatus(`Call ended: ${reason}`);
      cleanup();
    });

    return () => {
      cleanup();
      socket.disconnect();
    };
  }, [getOrCreatePC, addTracksToPC, cleanup]);

  // Auto-start media on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getMediaStream();
  }, [getMediaStream]);

  // UI CONTROL FUNCTIONS
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const endCall = () => {
    cleanup();
    setStatus('Call ended');
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 flex overflow-hidden">
      {/* ================= Sidebar (Desktop only) ================= */}
      <aside className="hidden lg:flex w-20 bg-gray-800 flex-col items-center py-6">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
          M
        </div>

        <div className="flex-1" />

        <div className="w-11 h-11 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm">U</span>
        </div>
      </aside>

      {/* ================= Main Area ================= */}
      <main className="flex-1 flex flex-col relative">
        {/* ================= Header ================= */}
        <header className="h-14 px-6 bg-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-gray-300 text-sm">REC 00:00:00</span>
          </div>

          <h1 className="text-white font-medium text-sm lg:text-base">
            Video Call – {status}
          </h1>

          <span className="hidden md:inline-block bg-gray-700 px-3 py-1 rounded text-xs text-white">
            ICE: {iceState}
          </span>
        </header>

        {/* ================= Video Stage ================= */}
        <section className="flex-1 relative bg-black">
          {/* Remote Video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />

          {/* Local Video */}
          <div
            className="
          absolute bottom-10 right-3
          lg:w-80 h-45
          sm:w-60 sm:40
          rounded-xl overflow-hidden
          border border-gray-700
          shadow-2xl
        "
          >
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <span className="absolute bottom-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>

          {/* ================= Controls ================= */}
          <div
            className="
          absolute bottom-6 left-1/2 -translate-x-1/2
          flex items-center gap-4
          bg-gray-800/80 backdrop-blur
          px-6 py-3 rounded-full
        "
          >
            <button
              onClick={toggleMute}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition ${
                isMuted ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {isMuted ? (
                <MicOff className="text-white" />
              ) : (
                <Mic className="text-white" />
              )}
            </button>

            <button
              onClick={toggleVideo}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition ${
                isVideoOff ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
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
              onClick={() => setShowChat(true)}
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

      {/* ================= Chat Panel ================= */}
      {showChat && (
        <aside
          className="
        fixed inset-0 z-50
        lg:static lg:inset-auto
        w-full lg:w-96
        bg-gray-800 flex flex-col
      "
        >
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
            {/* Message */}
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                C
              </div>
              <div>
                <p className="text-gray-400 text-xs">Carol</p>
                <div className="bg-gray-700 text-sm text-white p-3 rounded-lg">
                  Hello guys! What’s your opinion?
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
