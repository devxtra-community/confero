import { SignUpForm } from '@/components/auth/SignUpForm';
import { AuthImageCollage } from '@/components/auth/AuthImageCollage';

export default function SignUpPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      <div className="flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          <SignUpForm />
        </div>
      </div>

      <div className="relative">
        <AuthImageCollage />
      </div>
    </div>
  );
}
