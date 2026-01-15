'use client';

import { io, Socket } from 'socket.io-client';
import { useEffect, useRef } from 'react';

export default function SocketTest() {
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  /**
   * Creates ONE RTCPeerConnection
   * No media yet (Layer 1)
   */
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    // ICE candidates discovered locally
    pc.onicecandidate = event => {
      if (event.candidate) {
        socketRef.current?.emit('webrtc:ice', {
          callId: 'test-call-1',
          candidate: event.candidate,
        });
      }
    };

    // ICE connection state (THIS WAS NEVER FIRING BEFORE)
    pc.oniceconnectionstatechange = () => {
      console.log('🧊 ICE state:', pc.iceConnectionState);

      if (pc.iceConnectionState === 'failed') {
        socketRef.current?.emit('webrtc:ice-failed', {
          callId: 'test-call-1',
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('🔗 Connection state:', pc.connectionState);
    };

    return pc;
  };

  useEffect(() => {
    const socket = io('http://localhost:4001', {
      withCredentials: true,
    });

    socketRef.current = socket;
    window.socket = socket;

    socket.on('auth:success', () => {
      console.log('✅ Auth success');
    });

    socket.onAny((event, data) => {
      console.log('📨 EVENT:', event, data);
    });

    /**
     * ============================
     * CALLEE FLOW (User B)
     * ============================
     */

    socket.on('call:incoming', ({ callId }) => {
      console.log('📞 Incoming call', callId);

      // IMPORTANT: Accept the call
      socket.emit('call:accept', { callId });

      // Callee DOES NOT create offer
      pcRef.current = createPeerConnection();
    });

    socket.on('webrtc:offer', async ({ callId, offer }) => {
      console.log('📨 Offer received');

      const pc = pcRef.current ?? createPeerConnection();
      pcRef.current = pc;

      await pc.setRemoteDescription(offer);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('webrtc:answer', {
        callId,
        answer,
      });
    });

    /**
     * ============================
     * CALLER FLOW (User A)
     * ============================
     */

    socket.on('call:accepted', async ({ callId }) => {
      console.log('✅ Call accepted', callId);

      const pc = createPeerConnection();
      pcRef.current = pc;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('webrtc:offer', {
        callId,
        offer,
      });
    });

    socket.on('webrtc:answer', async ({ answer }) => {
      console.log('📨 Answer received');
      await pcRef.current?.setRemoteDescription(answer);
    });

    socket.on('webrtc:ice', async ({ candidate }) => {
      await pcRef.current?.addIceCandidate(candidate);
    });

    return () => {
      pcRef.current?.close();
      socket.disconnect();
    };
  }, []);

  return <div>Socket test (Layer 1)</div>;
}
