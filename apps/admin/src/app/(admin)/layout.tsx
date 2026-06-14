import { PropsWithChildren } from 'react';
import AdminLayout from '@/modules/admin/components/AdminLayout';

export default function ProtectedLayout({ children }: PropsWithChildren) {
  return <AdminLayout>{children}</AdminLayout>;
}

