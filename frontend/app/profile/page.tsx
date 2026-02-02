'use client';

import { useEffect, useState } from 'react';
import ProfilePage from '@/components/ProfilePage';
import { axiosInstance } from '@/lib/axiosInstance';
import { UserProfile } from '@/components/ProfilePage';
import Loading from '@/components/CenterLoader';

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get('/users/me');
        setUser(res.data.user);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <Loading />;
  if (!user) {
    return (
      <div className="p-6 text-sm text-red-600">Failed to load profile</div>
    );
  }

  return <ProfilePage user={user} />;
}
