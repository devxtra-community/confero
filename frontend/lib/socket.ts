// lib/socket.ts
import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
  path: '/live/socket.io',
  withCredentials: true,
  autoConnect: false, // ← we call socket.connect() manually so we control timing
});

/**
 * Connects the socket and returns a promise that resolves on success
 * or rejects with the server error message (e.g. 'ALREADY_CONNECTED').
 *
 * Safe to call if already connected — resolves immediately.
 */
export function connectSocket(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (socket.connected) {
      resolve();
      return;
    }

    const onConnect = () => {
      cleanup();
      resolve();
    };

    const onError = (err: Error) => {
      cleanup();
      reject(err);
    };

    const cleanup = () => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onError);
    };

    socket.once('connect', onConnect);
    socket.once('connect_error', onError);
    socket.connect();
  });
}

export function resetSocket(): void {
  if (socket.connected) {
    socket.disconnect();
  }
  socket.removeAllListeners();
}