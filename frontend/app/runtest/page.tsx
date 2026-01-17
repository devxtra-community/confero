'use client';

import { io, Socket } from 'socket.io-client';
import { useEffect, useRef, useCallback } from 'react';

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

  /* ============================
     MEDIA (LOCAL)
  ============================ */
  const getMediaStream = async () => {
    if (localStreamRef.current) return localStreamRef.current;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    localStreamRef.current = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    return stream;
  };

  /* ============================
     PEER CONNECTION (SINGLE)
  ============================ */
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.onicecandidate = event => {
      if (event.candidate && callIdRef.current && peerUserIdRef.current) {
        socketRef.current?.emit('webrtc:ice', {
          callId: callIdRef.current,
          to: peerUserIdRef.current,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('🔗 Connection:', pc.connectionState);
    };

    pc.oniceconnectionstatechange = () => {
      console.log('🧊 ICE:', pc.iceConnectionState);
    };

    pc.ontrack = event => {
      console.log('🎯 Remote track:', event.track.kind);

      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
      }

      remoteStreamRef.current.addTrack(event.track);

      if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        remoteVideoRef.current.play().catch(() => {});
      }
    };

    return pc;
  };

  // 🔑 ENSURE ONLY ONE PC EXISTS
  const getOrCreatePC = useCallback(() => {
    if (pcRef.current) return pcRef.current;

    const pc = createPeerConnection();
    pcRef.current = pc;
    return pc;
  }, []);


  /* ============================
     SOCKET SETUP
  ============================ */
  useEffect(() => {
    const socket = io('http://localhost:4001', {
      withCredentials: true,
    });

    socketRef.current = socket;
    window.socket = socket;

    socket.onAny((event, data) => {
      console.log('📨 EVENT:', event, data);
    });

    /* -------- CALLEE -------- */
    socket.on('call:incoming', ({ callId, from }) => {
      callIdRef.current = callId;
      peerUserIdRef.current = from;

      socket.emit('call:accept', { callId });
    });

    socket.on('webrtc:offer', async ({ callId, offer }) => {
      const pc = getOrCreatePC();

      const stream = await getMediaStream();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(offer);

      // 🔥 FLUSH ICE
      for (const c of pendingIceCandidatesRef.current) {
        await pc.addIceCandidate(c);
      }
      pendingIceCandidatesRef.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('webrtc:answer', {
        callId,
        answer,
        to: peerUserIdRef.current,
      });
    });

    /* -------- CALLER -------- */
    socket.on('call:accepted', async ({ callId, to }) => {
      callIdRef.current = callId;
      peerUserIdRef.current = to;

      const pc = getOrCreatePC();

      const stream = await getMediaStream();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('webrtc:offer', {
        callId,
        offer,
        to,
      });
    });

    socket.on('webrtc:answer', async ({ answer }) => {
      await pcRef.current?.setRemoteDescription(answer);

      // 🔥 FLUSH ICE
      for (const c of pendingIceCandidatesRef.current) {
        await pcRef.current?.addIceCandidate(c);
      }
      pendingIceCandidatesRef.current = [];
    });

    socket.on('webrtc:ice', async ({ candidate }) => {
      const pc = pcRef.current;
      if (!pc) return;

      if (pc.remoteDescription) {
        await pc.addIceCandidate(candidate);
      } else {
        pendingIceCandidatesRef.current.push(candidate);
      }
    });

    return () => {
      pcRef.current?.close();
      pcRef.current = null;
      socket.disconnect();
    };
  }, []);

  /* ============================
     UI
  ============================ */
  return (
    <div>
      <h3>Video Call</h3>

      {/* LOCAL VIDEO */}
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: 300,
          border: '2px solid green',
          transform: 'scaleX(-1)',
        }}
      />

      {/* REMOTE VIDEO */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{
          width: 300,
          border: '2px solid blue',
          transform: 'scaleX(-1)',
        }}
      />
    </div>
  );
}
