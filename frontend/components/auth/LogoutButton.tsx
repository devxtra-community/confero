'use client';
import { axiosInstance } from '@/lib/axiosInstance';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { socket } from '@/lib/socket';

export default function LogoutButton() {
  const router = useRouter();

  const LogoutButton = async () => {
    const response = await axiosInstance.post('/auth/logout');
    toast.success(response.data.message);
    localStorage.removeItem('accessToken');

    if (socket.connected) {
      socket.disconnect();
    }

    setTimeout(() => {
      router.push('/login');
    }, 1200);
  };

  return <button onClick={LogoutButton}>Logout</button>;
}
