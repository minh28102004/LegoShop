import { ReactNode } from 'react';
import Card from '@/common/components/ui/Card';
import SectionHeader from '@/common/components/ui/SectionHeader';

type AdminPageHeaderProps = {
  eyebrow?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
  badge?: ReactNode;
};

export default function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  badge,
}: AdminPageHeaderProps) {
  return (
    <Card className='p-5 sm:p-6 lg:p-7'>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={actions}
        badge={badge}
        titleClassName='admin-page-title max-w-5xl'
        descriptionClassName='admin-page-description mt-2.5 max-w-3xl'
      />
    </Card>
  );
}
