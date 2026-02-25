import ResetPasswordForm from '@/components/ResetPasswordForm';

interface PageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token ?? '';

  return <ResetPasswordForm token={token} />;
}