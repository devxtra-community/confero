'use client';

import { GoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';

export default function GoogleButton() {
  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          const idToken = credentialResponse.credential;

          if (!idToken) {
            console.error('No ID token from Google');
            return;
          }

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken }),
            }
          );

          const data = await res.json();
          console.log('Google auth success:', data);
        }}
        onError={() => {
          console.error('Google Login Failed');
        }}
        useOneTap={false}
      />
    </div>
  );
}
