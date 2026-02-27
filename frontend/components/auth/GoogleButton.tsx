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

            const role = res.data.role;
            console.log(role);
            const target = role === 'admin' ? '/admin' : '/home';
            console.log('navigating navigating');
            router.replace(target);
            setTimeout(() => {
              router.refresh();
            }, 50);

            console.log('after navigating');
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
