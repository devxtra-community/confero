// lib/socket.ts
import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
  path: '/live/socket.io',
  withCredentials: true,
  autoConnect: false, // ← we call socket.connect() manually so we control timing
});
