import { SOCKET_EVENTS } from './socketEvents';
import { callService } from '../service/callService';
import { Server, Socket } from 'socket.io';
import { publishEvent } from '../service/rabbitPublisher';

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

      publishEvent('session.ended', {
        sessionId: callId,
        endedAt: new Date(),
        reason: 'TIMEOUT',
      }).catch(console.error);

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
  });

  socket.on(SOCKET_EVENTS.WEBRTC_OFFER, ({ callId, offer, to }) => {
    const call = callService.get(callId);
    if (!call) return;

    const userId = socket.data.user.userId;
    if (userId !== call.from && userId !== call.to) return;

    io.to(to).emit(SOCKET_EVENTS.WEBRTC_OFFER, {
      callId,
      offer,
      from: userId,
    });
  });

  socket.on(SOCKET_EVENTS.WEBRTC_ANSWER, ({ callId, answer, to }) => {
    const call = callService.get(callId);
    if (!call) return;

    const userId = socket.data.user.userId;
    if (userId !== call.from && userId !== call.to) return;

    io.to(to).emit(SOCKET_EVENTS.WEBRTC_ANSWER, {
      callId,
      answer,
      from: userId,
    });

    if (call.state !== 'CONNECTING') return;

    callService.update(callId, 'CONNECTED');

    publishEvent('session.started', {
      sessionId: callId,
      userA: call.from,
      userB: call.to,
      startedAt: new Date(),
    }).catch(console.error);
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

    publishEvent('session.ended', {
      sessionId: callId,
      endedAt: new Date(),
      reason: 'ICE_FAILED',
    }).catch(console.error);

    io.to(call.from)
      .to(call.to)
      .emit(SOCKET_EVENTS.CALL_END, { callId, reason: 'ICE_FAILED' });

    callService.remove(callId);
  });
};
