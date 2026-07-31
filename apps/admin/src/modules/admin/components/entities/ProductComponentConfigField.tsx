'use client';

import Checkbox from '@/common/components/ui/Checkbox';
import Input from '@/common/components/ui/Input';
import Select from '@/common/components/ui/Select';
import { resolveApiAssetUrl } from '@/lib/api';
import { formatVnd } from '@/lib/i18n/format';
import { useI18n } from '@/lib/i18n/useI18n';

export type ProductConfigOption = {
  id: string;
  name: string;
  imageUrl?: string | null;
  price?: number | null;
};

export type ProductConfigOptions = {
  frames: ProductConfigOption[];
  backgrounds: ProductConfigOption[];
  characters: ProductConfigOption[];
  accessories: ProductConfigOption[];
};

type ConfigPart = {
  id?: string;
  name?: string;
  type?: string;
  imageUrl?: string | null;
  price?: number;
  quantity?: number;
  [key: string]: unknown;
};

type Props = {
  value: unknown;
  options?: ProductConfigOptions;
  onChange: (value: Record<string, unknown>) => void;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? { ...(value as Record<string, unknown>) }
    : {};
}

function asPart(value: unknown): ConfigPart | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? { ...(value as ConfigPart) }
    : undefined;
}

function asParts(value: unknown): ConfigPart[] {
  return Array.isArray(value)
    ? value.map(asPart).filter((part): part is ConfigPart => Boolean(part))
    : [];
}

function createPart(option: ProductConfigOption, type: string, quantity = 1): ConfigPart {
  return {
    id: option.id,
    type,
    name: option.name,
    quantity,
    ...(typeof option.price === 'number' ? { price: option.price } : {}),
    ...(option.imageUrl ? { imageUrl: option.imageUrl } : {}),
  };
}

function OptionPreview({
  locale,
  option,
}: {
  locale: 'en' | 'vi';
  option: ProductConfigOption;
}) {
  const imageUrl = resolveApiAssetUrl(option.imageUrl);

  return (
    <div className='flex min-w-0 items-center gap-3'>
      <span className='grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50'>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt='' className='h-full w-full object-contain p-1' />
        ) : (
          <span className='text-sm font-bold text-slate-400'>—</span>
        )}
      </span>
      <span className='min-w-0'>
        <span className='block truncate text-sm font-semibold text-slate-800'>{option.name}</span>
        {typeof option.price === 'number' ? (
          <span className='block text-xs font-semibold text-[var(--admin-primary-strong)]'>
            {formatVnd(option.price, locale)}
          </span>
        ) : null}
      </span>
    </div>
  );
}

export default function ProductComponentConfigField({
  value,
  options = { frames: [], backgrounds: [], characters: [], accessories: [] },
  onChange,
}: Props) {
  const { locale, t } = useI18n();
  const config = asRecord(value);
  const frame = asPart(config.frame);
  const background = asPart(config.background);
  const characters = asParts(config.characters);
  const accessories = asParts(config.accessories);

  function update(patch: Record<string, unknown>) {
    onChange({ ...config, ...patch });
  }

  function updateSingle(
    key: 'frame' | 'background',
    id: string,
    source: ProductConfigOption[],
    type: string,
  ) {
    const selected = source.find((option) => option.id === id);
    update({ [key]: selected ? createPart(selected, type) : undefined });
  }

  function toggleMulti(
    key: 'characters' | 'accessories',
    option: ProductConfigOption,
    checked: boolean,
    type: string,
  ) {
    const current = key === 'characters' ? characters : accessories;
    const next = checked
      ? [...current.filter((part) => part.id !== option.id), createPart(option, type)]
      : current.filter((part) => part.id !== option.id);
    update({ [key]: next });
  }

  function updateQuantity(key: 'characters' | 'accessories', id: string, quantity: number) {
    const current = key === 'characters' ? characters : accessories;
    update({
      [key]: current.map((part) =>
        part.id === id ? { ...part, quantity: Math.max(1, Math.round(quantity || 1)) } : part,
      ),
    });
  }

  function renderMultiOptions(
    key: 'characters' | 'accessories',
    label: string,
    source: ProductConfigOption[],
    type: string,
  ) {
    const selectedParts = key === 'characters' ? characters : accessories;

    return (
      <section className='space-y-3 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4'>
        <div className='flex items-center justify-between gap-3'>
          <h4 className='text-sm font-bold text-slate-900'>{label}</h4>
          <span className='rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700'>
            {t('productConfig.selectedCount').replace('{count}', String(selectedParts.length))}
          </span>
        </div>
        {source.length > 0 ? (
          <div className='grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2'>
            {source.map((option) => {
              const selected = selectedParts.find((part) => part.id === option.id);
              return (
                <div key={option.id} className='min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-2.5'>
                  <Checkbox
                    checked={Boolean(selected)}
                    onChange={(event) => toggleMulti(key, option, event.target.checked, type)}
                    label={<OptionPreview locale={locale} option={option} />}
                    containerClassName='border-0 bg-transparent p-0 shadow-none'
                  />
                  {selected ? (
                    <label className='mt-2 flex items-center justify-between gap-3 border-t border-slate-200 pt-2 text-xs font-semibold text-slate-600'>
                      {t('productConfig.quantity')}
                      <Input
                        type='number'
                        min={1}
                        value={String(selected.quantity ?? 1)}
                        onChange={(event) =>
                          updateQuantity(key, option.id, Number(event.target.value))
                        }
                        size='md'
                        className='!h-9 !w-20 text-center'
                      />
                    </label>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <p className='rounded-xl bg-slate-50 px-3 py-4 text-sm font-medium text-slate-500'>
            {t('productConfig.empty')}
          </p>
        )}
      </section>
    );
  }

  return (
    <div className='space-y-4 rounded-[20px] border border-sky-100 bg-sky-50/45 p-3 sm:p-4'>
      <div className='rounded-xl border border-sky-100 bg-white px-4 py-3'>
        <p className='text-sm font-bold text-slate-900'>{t('productConfig.title')}</p>
        <p className='mt-1 text-xs font-medium leading-5 text-slate-500'>
          {t('productConfig.description')}
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <label className='space-y-2'>
          <span className='text-sm font-bold text-slate-800'>{t('productConfig.frame')}</span>
          <Select
            value={frame?.id ?? ''}
            onChange={(event) => updateSingle('frame', event.target.value, options.frames, 'frame')}
          >
            <option value=''>{t('productConfig.noFrame')}</option>
            {options.frames.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </Select>
        </label>

        <label className='space-y-2'>
          <span className='text-sm font-bold text-slate-800'>{t('productConfig.background')}</span>
          <Select
            value={background?.id ?? ''}
            onChange={(event) =>
              updateSingle('background', event.target.value, options.backgrounds, 'background')
            }
          >
            <option value=''>{t('productConfig.noBackground')}</option>
            {options.backgrounds.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </Select>
        </label>
      </div>

      <div className='grid gap-4 xl:grid-cols-2'>
        {renderMultiOptions('characters', t('productConfig.characters'), options.characters, 'character')}
        {renderMultiOptions('accessories', t('productConfig.accessories'), options.accessories, 'accessory')}
      </div>
    </div>
  );
}
