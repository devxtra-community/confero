import ResetPasswordForm from '@/components/ResetPasswordForm';

interface PageProps {
  searchParams: {
    token?: string;
  };
}

export default function ResetPasswordPage({ searchParams }: PageProps) {
  const token = searchParams.token ?? '';

  return <ResetPasswordForm token={token} />;
}
