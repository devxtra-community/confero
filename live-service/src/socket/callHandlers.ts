import { SOCKET_EVENTS } from './socketEvents';
import { callService } from '../service/callService';
import { Server, Socket } from 'socket.io';

const CALL_TIMEOUT_MS = 20_000;

export const registerCallHandlers = (socket: Socket, io: Server) => {
  socket.on(SOCKET_EVENTS.CALL_INITIATE, ({ callId, toUserId }) => {
    const fromUserId = socket.data.user.userId;

    callService.create(callId, fromUserId, toUserId);

    io.to(toUserId).emit(SOCKET_EVENTS.CALL_INCOMING, {
      callId,
      from: fromUserId,
    });

    setTimeout(() => {
      const call = callService.get(callId);
      if (!call || call.state !== 'INITIATING') return;

      callService.update(callId, 'TIMEOUT');
      io.to(call.from).to(call.to).emit(SOCKET_EVENTS.CALL_TIMEOUT, { callId });

      callService.remove(callId);
    }, CALL_TIMEOUT_MS);
  });

  socket.on(SOCKET_EVENTS.CALL_ACCEPT, ({ callId }) => {
    const call = callService.get(callId);
    if (!call || call.state !== 'INITIATING') return;

    callService.update(callId, 'CONNECTING');

    io.to(call.from).emit(SOCKET_EVENTS.CALL_ACCEPTED, {
      callId,
      to: call.to,
    });

    io.to(call.to).emit(SOCKET_EVENTS.CALL_ACCEPTED, {
      callId,
      to: call.from,
    });
  });

  socket.on(SOCKET_EVENTS.WEBRTC_OFFER, ({ callId, offer, to }) => {
    const call = callService.get(callId);
    if (!call) return;

    const userId = socket.data.user.userId;
    if (userId !== call.from && userId !== call.to) return;

    io.to(to).emit(SOCKET_EVENTS.WEBRTC_OFFER, { callId, offer });
  });

  socket.on(SOCKET_EVENTS.WEBRTC_ANSWER, ({ callId, answer, to }) => {
    const call = callService.get(callId);
    if (!call) return;

    const userId = socket.data.user.userId;
    if (userId !== call.from && userId !== call.to) return;
    io.to(to).emit(SOCKET_EVENTS.WEBRTC_ANSWER, { callId, answer });
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

    io.to(call.from)
      .to(call.to)
      .emit(SOCKET_EVENTS.CALL_END, { callId, reason: 'ICE_FAILED' });

    callService.remove(callId);
  });
};
