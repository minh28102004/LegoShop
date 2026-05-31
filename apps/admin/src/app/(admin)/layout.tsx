import { PropsWithChildren } from 'react';
import AdminShell from '@/components/admin/admin-shell';

export default function ProtectedLayout({ children }: PropsWithChildren) {
  return <AdminShell>{children}</AdminShell>;
}
