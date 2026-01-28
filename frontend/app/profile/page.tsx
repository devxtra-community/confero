'use client';

import { useEffect, useState } from 'react';
import ProfilePage from '@/components/ProfilePage';
import { axiosInstance } from '@/lib/axiosInstance';
import { UserProfile } from '@/components/ProfilePage';

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get('/users/me');
        setUser(res.data.user);
      } catch {
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <ProfilePage user={user} />;
}
