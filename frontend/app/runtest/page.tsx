'use client';

import { io, Socket } from 'socket.io-client';
import { useEffect, useRef, useCallback, useState } from 'react';

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

  // CLEANUP FUNCTION - DEFINED EARLY
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
    const socket = io('http://localhost:4001', {
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

  return (
    <div className="p-20 font-serif">
      <h3 className="m-2.5 text-2xl text-primary">Video Call Test</h3>
      <div className="p-2.5 border-2 m-2.5 bg-amber-50">
        <strong>Status:</strong> {status}
      </div>
      <div className="p-2.5 bg-blue-200 border-2 mb-5 text-md m-2.5">
        <strong>ICE State:</strong> {iceState}
      </div>

      <div className="flex gap-5 mt-5 flex-wrap ml-2.5">
        <div>
          <p className="font-bold mt-5 text-xl">You (Local)</p>
          <video
            className="w-125 h-100 border-green-500 border-3 scale-x-[-1] bg-black rounded-lg object-cover"
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
          />
        </div>

        <div>
          <p className="font-bold mt-5 text-xl">Remote User</p>
          <video
            className="w-125 h-100 border-blue-500 border-3 scale-x-[-1] bg-black rounded-lg object-cover"
            ref={remoteVideoRef}
            autoPlay
            playsInline
          />
        </div>
      </div>
    </div>
  );
}
