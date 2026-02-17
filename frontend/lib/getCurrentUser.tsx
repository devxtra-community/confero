// // src/lib/server/getCurrentUser.ts
// import { cache } from 'react';
// import { axiosInstance } from './axiosInstance';

// export const getCurrentUser = cache(async () => {
//   try {
//     // const res = await fetch(`${process.env.GATEWAY_URL}/users/me`, {
//     //   credentials: 'include',
//     //   cache: 'no-store',
//     // });
//     const res = await axiosInstance.get('/users/me')
//     return res.data.user;
//   } catch {
//     return null;
//   }
// });
