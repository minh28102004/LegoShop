import { redirect } from 'next/navigation';
import { ADMIN_ROUTES } from '@/common/constants/routes';

export default function HomePage() {
  redirect(ADMIN_ROUTES.dashboard);
}
