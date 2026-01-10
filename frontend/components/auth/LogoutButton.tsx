'use client';
import { axiosInstance } from '@/lib/axiosInstance';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LogoutButton() {
  const router = useRouter();
  const LogoutButton = async () => {
    const response = await axiosInstance.post('/auth/logout');
    toast.success(response.data.message);
    localStorage.removeItem('accessToken');
    setTimeout(() => {
      router.push('/login');
    }, 1200);
  };
  return <button onClick={LogoutButton}>LogoutButton</button>;
}
