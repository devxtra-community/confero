import { LoginRight } from '@/components/auth/LoginForm';
import { LoginLeft } from '@/components/auth/LoginImageCollage';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex">
      <LoginLeft />
      <LoginRight />
    </div>
  );
}
