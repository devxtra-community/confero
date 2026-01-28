// src/lib/server/getCurrentUser.ts
import { cache } from 'react';

export const getCurrentUser = cache(async () => {
  try {
    const res = await fetch(`${process.env.GATEWAY_URL}/users/me`, {
      credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok) return null;

    return res.json();
  } catch {
    return null;
  }
});
