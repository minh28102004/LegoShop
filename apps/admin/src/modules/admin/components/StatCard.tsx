import Card from '@/common/components/ui/Card';

type StatCardProps = {
  label: string;
  value: string | number;
  description?: string;
  tone?: 'amber' | 'blue' | 'emerald' | 'slate';
};

const TONE_STYLES = {
  amber: {
    dot: 'bg-amber-400',
    panel: 'bg-amber-50',
    strip: 'bg-amber-400',
  },
  blue: {
    dot: 'bg-blue-500',
    panel: 'bg-blue-50',
    strip: 'bg-blue-500',
  },
  emerald: {
    dot: 'bg-emerald-500',
    panel: 'bg-emerald-50',
    strip: 'bg-emerald-500',
  },
  slate: {
    dot: 'bg-slate-400',
    panel: 'bg-slate-100',
    strip: 'bg-slate-400',
  },
} as const;

export default function StatCard({
  label,
  value,
  description,
  tone = 'amber',
}: StatCardProps) {
  const styles = TONE_STYLES[tone];

  return (
    <Card hover className='h-full overflow-hidden p-0 hover:-translate-y-0.5'>
      <div className='relative flex min-h-[132px] flex-col justify-between px-5 py-4 sm:min-h-[138px]'>
        <div className={['absolute inset-y-4 left-0 w-1 rounded-r-full', styles.strip].join(' ')} />
        <div>
          <div className='flex items-start justify-between gap-3'>
            <p className='text-[13px] font-semibold leading-5 text-slate-500'>{label}</p>
            <span className={['inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full', styles.panel].join(' ')}>
              <span className={['h-2.5 w-2.5 rounded-full', styles.dot].join(' ')} />
            </span>
          </div>
          <p className='mt-3 text-[26px] font-bold leading-none tracking-[-0.035em] text-slate-900 sm:text-[28px]'>
            {value}
          </p>
          {description ? (
            <p className='mt-2 truncate text-[13px] font-medium leading-5 text-slate-500'>
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
