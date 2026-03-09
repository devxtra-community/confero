import DashboardHome from '@/components/admin/AdminDashboard';
import { AdminErrorBoundary } from '@/components/admin/AdminErrorBoundary';

export default function AdminPage() {
  return (
    <AdminErrorBoundary>
      <DashboardHome />
    </AdminErrorBoundary>
  );
}