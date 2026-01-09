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
            const res = await axiosInstance.post('/auth/google', {
              idToken,
            });
            console.log(res)
            // OPTIONAL: store tokens if not handled by interceptor
            localStorage.setItem('accessToken', res.data.accessToken);
            // localStorage.setItem('refreshToken', res.data.refreshToken);

            router.push('/signup');
          } catch (error) {
            console.error('Google auth API failed', error);
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
