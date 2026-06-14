import { ReactNode } from 'react';
import Card from '@/common/components/ui/Card';
import SectionHeader from '@/common/components/ui/SectionHeader';

type AdminPageHeaderProps = {
  eyebrow?: ReactNode;
  icon?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
  badge?: ReactNode;
};

export default function AdminPageHeader({
  eyebrow,
  icon,
  title,
  description,
  actions,
  badge,
}: AdminPageHeaderProps) {
  return (
    <Card className='p-5 sm:p-6 lg:p-7'>
      <SectionHeader
        eyebrow={eyebrow}
        icon={icon}
        title={title}
        description={description}
        actions={actions}
        badge={badge}
        iconClassName='h-11 w-11 rounded-[15px] border-[var(--admin-accent)] bg-[#ffe16a] text-[#18385a] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)]'
        titleClassName='admin-page-title max-w-5xl'
        descriptionClassName='admin-page-description mt-2.5 max-w-3xl'
      />
    </Card>
  );
}
