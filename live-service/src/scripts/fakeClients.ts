import { io } from 'socket.io-client';

const AUTH_URL = 'http://localhost:4002/auth/login';
const SOCKET_URL = 'http://localhost:4001';

const USERS = [{ email: 'sameerptmc@gmail.com', password: 'sameer123' }];

const CLIENTS_PER_USER = 5;
const RECONNECT_INTERVAL = 2000;

async function login(email: string, password: string): Promise<string> {
  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed: ${text}`);
  }

  const rawCookies = (res.headers as any).getSetCookie?.() || [];

  if (!rawCookies.length) {
    throw new Error('No set-cookie returned from login');
  }

  const accessCookie = rawCookies.find((c: string) =>
    c.startsWith('accessToken=')
  );

  if (!accessCookie) {
    throw new Error('accessToken cookie not found');
  }

  const token = accessCookie.split(';')[0].replace('accessToken=', '');

  console.log('Token extracted:', token.slice(0, 40) + '...');

  return token;
}

function createSocket(id: string, token: string) {
  const socket = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: {
      token,
    },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log(`[${id}] connected → ${socket.id}`);
  });

  socket.on('disconnect', reason => {
    console.log(`[${id}] disconnected → ${reason}`);
  });

  socket.on('connect_error', err => {
    console.error(`[${id}] connect_error →`, err.message);
  });

  return socket;
}

async function main() {
  const clients: any[] = [];

  for (const user of USERS) {
    try {
      const token = await login(user.email, user.password);
      console.log(`Logged in: ${user.email}`);

      for (let i = 0; i < CLIENTS_PER_USER; i++) {
        const id = `${user.email}-${i}`;
        const socket = createSocket(id, token);
        clients.push(socket);
      }
    } catch (err: any) {
      console.error(`Login failed for ${user.email}:`, err.message);
      return;
    }
  }

  setInterval(() => {
    if (!clients.length) return;

    const victim = clients[Math.floor(Math.random() * clients.length)];
    console.log(`Killing one socket...`);
    victim.disconnect();

    setTimeout(() => {
      victim.connect();
    }, RECONNECT_INTERVAL);
  }, 1500);
}

main();
