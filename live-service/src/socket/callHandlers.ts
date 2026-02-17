import { SOCKET_EVENTS } from './socketEvents';
import { callService } from '../service/callService';
import { Server, Socket } from 'socket.io';

export const registerCallHandlers = (socket: Socket, io: Server) => {

  // ── peer:ready: fired by both users once their camera is on ──────────────
  // Call record already exists (created in matchingHandlers when match was found)
  // When BOTH users are ready → fire call:start to both → WebRTC begins
  socket.on(SOCKET_EVENTS.PEER_READY, ({ callId }) => {
    const userId = socket.data.user.userId;
    const call = callService.get(callId);

    // Guard: call must exist and be in INITIATING state
    if (!call || call.state !== 'INITIATING') return;

    // Mark this user ready
    callService.markReady(callId, userId);

    const updated = callService.get(callId);
    if (!updated) return;

    // Both ready → start WebRTC signaling
    if (updated.fromReady && updated.toReady) {
      callService.update(callId, 'CONNECTING');

      // userA (from) creates the offer, userB (to) waits
      io.to(updated.from).emit(SOCKET_EVENTS.CALL_START, {
        callId,
        peerUserId: updated.to,
        shouldCreateOffer: true,
      });

      io.to(updated.to).emit(SOCKET_EVENTS.CALL_START, {
        callId,
        peerUserId: updated.from,
        shouldCreateOffer: false,
      });
    }
  });

  // ── WebRTC signaling — completely unchanged ──────────────────────────────
  socket.on(SOCKET_EVENTS.WEBRTC_OFFER, ({ callId, offer, to }) => {
    const call = callService.get(callId);
    if (!call) return;
    const userId = socket.data.user.userId;
    if (userId !== call.from && userId !== call.to) return;
    io.to(to).emit(SOCKET_EVENTS.WEBRTC_OFFER, { callId, offer, from: userId });
  });

  socket.on(SOCKET_EVENTS.WEBRTC_ANSWER, ({ callId, answer, to }) => {
    const call = callService.get(callId);
    if (!call) return;
    const userId = socket.data.user.userId;
    if (userId !== call.from && userId !== call.to) return;
    io.to(to).emit(SOCKET_EVENTS.WEBRTC_ANSWER, { callId, answer, from: userId });
  });

  socket.on(SOCKET_EVENTS.WEBRTC_ICE, ({ callId, candidate, to }) => {
    const call = callService.get(callId);
    if (!call) return;
    const userId = socket.data.user.userId;
    if (userId !== call.from && userId !== call.to) return;
    io.to(to).emit(SOCKET_EVENTS.WEBRTC_ICE, { callId, candidate });
  });

  socket.on(SOCKET_EVENTS.WEBRTC_ICE_FAILED, ({ callId }) => {
    const call = callService.get(callId);
    if (!call) return;
    callService.update(callId, 'FAILED');
    io.to(call.from).to(call.to).emit(SOCKET_EVENTS.CALL_END, {
      callId,
      reason: 'ICE_FAILED',
    });
    callService.remove(callId);
  });

  socket.on(SOCKET_EVENTS.CALL_END, ({ callId }) => {
    const call = callService.get(callId);
    if (!call) return;
    callService.update(callId, 'ENDED');
    io.to(call.from).to(call.to).emit(SOCKET_EVENTS.CALL_END, {
      callId,
      reason: 'USER_ENDED',
    });
    callService.remove(callId);
  });
};