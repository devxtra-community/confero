'use client';

import { axiosInstance } from '@/lib/axiosInstance';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';

export default function GoogleButton() {
  const router = useRouter();

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={async credentialResponse => {
          const idToken = credentialResponse.credential;

          if (!idToken) {
            console.error('No ID token from Google');
            return;
          }

          try {
            await axiosInstance.post('/auth/google', {
              idToken,
            });

            const meRes = await axiosInstance.get('/users/me');
            const user = meRes.data.user;

            if (user.role === 'admin') {
              router.replace('/admin');
            } else {
              router.replace('/home');
            }
          } catch (error) {
            console.error('Google auth API failed', error);
            router.replace('/login');
          }
        }}
        onError={() => {
          console.error('Google Login Failed');
        }}
        useOneTap={false}
      />
    </div>
  );
}
