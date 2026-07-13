'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Card from '@/common/components/ui/Card';
import LoadingState from '@/common/components/ui/LoadingState';
import PageShell from '@/common/components/ui/PageShell';
import SectionHeader from '@/common/components/ui/SectionHeader';
import Select from '@/common/components/ui/Select';
import Table, {
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeader,
  TableRow,
} from '@/common/components/ui/Table';
import { getStatusBadgeLabel, StatusBadge } from '@/common/components/ui/Badge';
import {
  getOrderById,
  listResource,
  updateOrderPaymentStatus,
  updateOrderShippingStatus,
  updateOrderStatus,
} from '@/modules/admin/services/adminApi';
import { resolveApiAssetUrl } from '@/lib/api';
import { useI18n } from '@/lib/i18n/useI18n';
import AdminNavIcon from '@/modules/admin/components/AdminNavIcon';
import type { Accessory, CharacterPart, Order, OrderStatus, PaymentStatus, ShippingStatus } from '@/modules/admin/types/admin.types';
import type { CustomFrameDesignData, JsonObject } from '@lego-shop/shared';
import DesignPreviewModal, { AdminDesignPreview } from './design-preview-modal';

type Props = {
  orderId: string;
};

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipping',
  'completed',
  'cancelled',
];
const PAYMENT_STATUSES: PaymentStatus[] = [
  'unpaid',
  'pending',
  'deposit_pending',
  'deposit_paid',
  'paid',
  'failed',
  'cancelled',
  'refunded',
];
const SHIPPING_STATUSES: ShippingStatus[] = [
  'pending',
  'preparing',
  'shipping',
  'delivered',
  'cancelled',
];

const CURRENCY = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const SHIPPING_METHOD_LABELS: Record<string, string> = {
  shop_support: 'Shop hỗ trợ đặt ship',
  standard: 'Ship thường',
  fast: 'Ship nhanh',
  self: 'Tự book ship / Qua lấy',
};

function isJsonObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isCustomFrameDesignData(value: unknown): value is CustomFrameDesignData {
  return (
    isJsonObject(value) &&
    value.version === 1 &&
    value.type === 'CUSTOM_FRAME'
  );
}

function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function getDesignBackgroundLabel(value: JsonObject | null) {
  if (!value) return null;
  if (isCustomFrameDesignData(value)) {
    return value.backgroundName ?? value.backgroundId ?? null;
  }
  return readString(value.templateName) ?? readString(value.backgroundName) ?? readString(value.backgroundId);
}

function getDesignContentEntries(value: JsonObject | null) {
  if (!value) return [];
  const content = isCustomFrameDesignData(value) && isJsonObject(value.content)
    ? value.content
    : isJsonObject(value.contentValues)
      ? value.contentValues
      : isJsonObject(value.printText)
        ? value.printText
        : null;

  if (!content) return [];

  return Object.entries(content)
    .filter(([, entryValue]) => typeof entryValue === 'string' && entryValue.trim())
    .slice(0, 6) as Array<[string, string]>;
}

function getDesignUploadedImages(value: JsonObject | null) {
  if (!isCustomFrameDesignData(value)) return [];
  return value.uploadedImages.filter((image) => image.url);
}

type DesignCharacterSummary = {
  id: string;
  name: string;
  faceId: string | null;
  hairId: string | null;
  torsoId: string | null;
  legsId: string | null;
  hatId: string | null;
  accessoryIds: string[];
};

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    : [];
}

function getDesignCharacters(value: JsonObject | null): DesignCharacterSummary[] {
  if (!value) return [];

  if (isCustomFrameDesignData(value)) {
    return value.characters.map((character, index) => ({
      id: readString(character.id) ?? `character-${index + 1}`,
      name: readString(character.name) ?? `NV ${index + 1}`,
      faceId: readString(character.faceId),
      hairId: readString(character.hairId),
      torsoId: readString(character.torsoId),
      legsId: readString(character.legsId),
      hatId: readString((character as Record<string, unknown>).hatId as string | undefined),
      accessoryIds: readStringArray(character.accessoryIds),
    }));
  }

  const elements = Array.isArray(value.elements) ? value.elements : [];
  return elements.flatMap((element, index) => {
    if (!isJsonObject(element) || element.type !== 'character') return [];

    return [{
      id: readString(element.id) ?? `character-${index + 1}`,
      name: readString(element.content) ?? readString(element.name) ?? `NV ${index + 1}`,
      faceId: readString(element.faceId),
      hairId: readString(element.hairId),
      torsoId: readString(element.torsoId),
      legsId: readString(element.legsId),
      hatId: readString(element.hatId),
      accessoryIds: readStringArray(element.accessoryIds),
    }];
  });
}

function getDesignStats(value: JsonObject | null) {
  if (!value) {
    return { accessories: 0, characters: 0, uploadedImages: 0 };
  }

  if (isCustomFrameDesignData(value)) {
    return {
      accessories: value.accessories.length,
      characters: value.characters.length,
      uploadedImages: value.uploadedImages.length,
    };
  }

  const elements = Array.isArray(value.elements) ? value.elements : [];
  return {
    accessories: elements.filter((element) => isJsonObject(element) && element.type === 'accessory').length,
    characters: elements.filter((element) => isJsonObject(element) && element.type === 'character').length,
    uploadedImages: 0,
  };
}

const HISTORY_TYPE_LABELS: Record<string, string> = {
  ORDER_STATUS: 'Đơn hàng',
  PAYMENT_STATUS: 'Thanh toán',
  SHIPPING_STATUS: 'Vận chuyển',
  NOTE: 'Ghi chú',
};

function CharacterPartBadge({
  label,
  partId,
  partMap,
}: {
  label: string;
  partId: string | null;
  partMap: Map<string, CharacterPart>;
}) {
  const part = partId ? partMap.get(partId) : undefined;
  const imageUrl = part?.imageUrl ? resolveApiAssetUrl(part.imageUrl) : null;

  return (
    <div className='flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2'>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt='' className='h-8 w-8 shrink-0 rounded-lg object-contain' />
      ) : (
        <div className='grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-400'>
          -
        </div>
      )}
      <div className='min-w-0'>
        <p className='text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400'>{label}</p>
        <p className='truncate text-xs font-semibold text-slate-700'>{part?.name ?? partId ?? '-'}</p>
      </div>
    </div>
  );
}

export default function OrderDetail({ orderId }: Props) {
  const { t, locale } = useI18n();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewItem, setPreviewItem] = useState<{
    designData: JsonObject | null;
    productName: string;
    previewUrl?: string | null;
  } | null>(null);
  const [characterParts, setCharacterParts] = useState<CharacterPart[]>([]);
  const [accessoryCatalog, setAccessoryCatalog] = useState<Accessory[]>([]);
  const characterPartMap = useMemo(
    () => new Map(characterParts.map((part) => [part.id, part])),
    [characterParts],
  );

  function statusLabel(value: string) {
    return getStatusBadgeLabel(value, t);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, parts, accessories] = await Promise.all([
        getOrderById(orderId),
        listResource('character-parts').catch(() => [] as CharacterPart[]),
        listResource('accessories').catch(() => [] as Accessory[]),
      ]);
      setOrder(data);
      setCharacterParts(parts);
      setAccessoryCatalog(accessories);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('orderDetail.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [orderId, t]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [load]);

  async function updateStatus(
    kind: 'order' | 'payment' | 'shipping',
    value: OrderStatus | PaymentStatus | ShippingStatus,
  ) {
    if (!order) return;
    setSaving(true);
    setError(null);

    try {
      if (kind === 'order') {
        await updateOrderStatus(order.id, value as OrderStatus);
      }
      if (kind === 'payment') {
        await updateOrderPaymentStatus(order.id, value as PaymentStatus);
      }
      if (kind === 'shipping') {
        await updateOrderShippingStatus(order.id, value as ShippingStatus);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('orderDetail.updateFailed'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingState text={t('orderDetail.loading')} />;
  }

  if (error || !order) {
    return (
      <Card className='border-red-200 bg-red-50 p-5 text-red-700'>
        {error ?? t('orderDetail.notFound')}
      </Card>
    );
  }

  const designItems = order.items.filter((item) => item.previewUrl || isJsonObject(item.designData));

  return (
    <PageShell>
      <Card className='p-5 sm:p-6'>
        <SectionHeader
          icon={<AdminNavIcon name='orders' className='h-6 w-6' />}
          title={order.orderCode}
          description={order.customerName}
          actions={
            <>
              <StatusBadge value={order.orderStatus} t={t} />
              <StatusBadge value={order.paymentStatus} t={t} />
              <StatusBadge value={order.shippingStatus} t={t} />
            </>
          }
        />

        <div className='mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              {t('orderDetail.customer')}
            </p>
            <p className='mt-2 text-sm font-medium text-slate-900'>{order.customerName}</p>
          </div>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              {t('orderDetail.phone')}
            </p>
            <p className='mt-2 text-sm font-medium tabular-nums text-slate-900'>{order.phone}</p>
          </div>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              {t('orderDetail.email')}
            </p>
            <p className='mt-2 truncate text-sm font-medium text-slate-900'>{order.email || '-'}</p>
          </div>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              Zalo
            </p>
            <p className='mt-2 truncate text-sm font-medium text-slate-900'>{order.zalo || '-'}</p>
          </div>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              {t('orderDetail.paymentMethod')}
            </p>
            <p className='mt-2 text-sm font-medium text-slate-900'>{order.paymentMethod}</p>
          </div>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4 md:col-span-2'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              {t('orderDetail.address')}
            </p>
            <p className='mt-2 text-sm font-medium leading-6 text-slate-900'>{order.address}</p>
          </div>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4 md:col-span-2'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              Dòng địa chỉ
            </p>
            <p className='mt-2 text-sm font-medium leading-6 text-slate-900'>{order.addressLine || '-'}</p>
          </div>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              Vận chuyển
            </p>
            <p className='mt-2 text-sm font-medium text-slate-900'>
              {SHIPPING_METHOD_LABELS[order.shippingMethod ?? ''] ?? order.shippingMethod ?? '-'}
            </p>
            <p className='mt-1 text-xs text-slate-500'>Shop báo phí trước khi giao</p>
          </div>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              Ngày nhận
            </p>
            <p className='mt-2 text-sm font-medium text-slate-900'>
              {order.receiveDate ? new Date(order.receiveDate).toLocaleDateString('vi-VN') : '-'}
            </p>
          </div>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              Hạn thanh toán
            </p>
            <p className='mt-2 text-sm font-medium text-slate-900'>
              {order.expiresAt ? new Date(order.expiresAt).toLocaleString('vi-VN') : '-'}
            </p>
          </div>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              Tạm tính sản phẩm
            </p>
            <p className='mt-2 text-base font-bold tabular-nums text-slate-900'>
              {CURRENCY.format(order.itemsAmount ?? order.totalAmount)}
            </p>
            <p className='mt-1 text-xs text-slate-500'>
              Add-ons: {CURRENCY.format((order.giftFee ?? 0) + (order.polaroidFee ?? 0))}
              {order.discountAmount > 0 ? ` · Voucher: -${CURRENCY.format(order.discountAmount)}` : ''}
            </p>
          </div>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              {t('orderDetail.total')}
            </p>
            <p className='mt-2 text-base font-bold tabular-nums text-slate-900'>
              {CURRENCY.format(order.totalAmount)}
            </p>
            <p className='mt-1 text-xs text-slate-500'>
              Gói quà: {order.giftPackage ? CURRENCY.format(order.giftFee ?? 0) : '-'} · Polaroid: {order.polaroidOption ?? 'none'}
            </p>
          </div>
          <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4'>
            <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
              {t('orderDetail.remaining')}
            </p>
            <p className='mt-2 text-base font-bold tabular-nums text-slate-900'>
              {CURRENCY.format(order.remainingAmount)}
            </p>
            <p className='mt-1 text-xs text-slate-500'>
              {t('orderDetail.deposit')}: {CURRENCY.format(order.depositAmount)}
            </p>
          </div>
          {order.note ? (
            <div className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4 md:col-span-2'>
              <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500'>
                Ghi chú khách hàng
              </p>
              <p className='mt-2 whitespace-pre-line text-sm font-medium leading-6 text-slate-900'>{order.note}</p>
            </div>
          ) : null}
          {order.cancelReason ? (
            <div className='rounded-[22px] border border-red-200 bg-red-50 p-4 md:col-span-2'>
              <p className='text-[12px] font-semibold uppercase tracking-[0.12em] text-red-500'>
                Lý do hủy
              </p>
              <p className='mt-2 whitespace-pre-line text-sm font-medium leading-6 text-red-800'>{order.cancelReason}</p>
            </div>
          ) : null}
        </div>
      </Card>

      <Card className='p-5 sm:p-6'>
        <SectionHeader
          title={t('orderDetail.statusControls')}
          description={saving ? t('entity.saving') : undefined}
        />

        <div className='mt-5 grid gap-4 lg:grid-cols-3'>
          <label className='space-y-2'>
            <span className='admin-label'>{t('orderDetail.orderStatus')}</span>
            <Select
              value={order.orderStatus}
              disabled={saving}
              aria-label={t('orderDetail.orderStatus')}
              onChange={(e) => updateStatus('order', e.target.value as OrderStatus)}
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </Select>
          </label>

          <label className='space-y-2'>
            <span className='admin-label'>{t('orderDetail.paymentStatus')}</span>
            <Select
              value={order.paymentStatus}
              disabled={saving}
              aria-label={t('orderDetail.paymentStatus')}
              onChange={(e) => updateStatus('payment', e.target.value as PaymentStatus)}
            >
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </Select>
          </label>

          <label className='space-y-2'>
            <span className='admin-label'>{t('orderDetail.shippingStatus')}</span>
            <Select
              value={order.shippingStatus}
              disabled={saving}
              aria-label={t('orderDetail.shippingStatus')}
              onChange={(e) => updateStatus('shipping', e.target.value as ShippingStatus)}
            >
              {SHIPPING_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </Select>
          </label>
        </div>
      </Card>

      <Card className='p-5 sm:p-6'>
        <SectionHeader title={t('orderDetail.items')} />
        <div className='mt-4'>
          <Table className='min-w-[760px]'>
            <TableHeader>
              <tr>
                <TableHead>{t('orderDetail.product')}</TableHead>
                <TableHead className='text-center'>{t('orderDetail.qty')}</TableHead>
                <TableHead className='text-right'>{t('orderDetail.price')}</TableHead>
                <TableHead className='text-center'>{t('orderDetail.preview')}</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {order.items.length === 0 ? (
                <TableEmptyState colSpan={4}>
                  {locale === 'vi' ? 'Không có sản phẩm nào.' : 'No products found.'}
                </TableEmptyState>
              ) : (
                order.items.map((item) => (
                  <TableRow key={item.id} hoverable>
                    <TableCell className='font-medium text-slate-800'>
                      <span className='block max-w-[320px] truncate'>{item.productName}</span>
                      <span className='mt-1 block text-xs font-normal text-slate-500'>
                        {[item.frameSizeLabel, item.frameColorName].filter(Boolean).join(' · ') || '-'}
                      </span>
                      {item.accessories?.length ? (
                        <span className='mt-1 block max-w-[360px] truncate text-xs font-normal text-slate-500'>
                          Phụ kiện: {item.accessories.map((accessory) => accessory.name).join(', ')}
                        </span>
                      ) : null}
                      {item.note ? (
                        <span className='mt-1 block max-w-[360px] whitespace-pre-line text-xs font-normal text-slate-500'>
                          Ghi chú: {item.note}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className='text-center'>{item.quantity}</TableCell>
                    <TableCell className='text-right font-medium text-slate-800'>
                      {CURRENCY.format(item.price)}
                    </TableCell>
                    <TableCell className='text-center'>
                      <div className='flex flex-col items-center gap-2'>
                        {item.previewUrl ? (
                          <a
                            href={resolveApiAssetUrl(item.previewUrl)}
                            target='_blank'
                            className='text-sm font-medium text-[var(--admin-primary-strong)] underline underline-offset-4'
                            rel='noreferrer'
                          >
                            {t('orderDetail.open')}
                          </a>
                        ) : null}
                        {isJsonObject(item.designData) ? (
                          <button
                            onClick={() => setPreviewItem({
                              designData: item.designData ?? null,
                              productName: item.productName,
                              previewUrl: item.previewUrl,
                            })}
                            className='cursor-pointer text-sm font-bold text-emerald-600 underline underline-offset-4 hover:text-emerald-700'
                          >
                            Xem thiết kế
                          </button>
                        ) : null}
                        {!item.previewUrl && !isJsonObject(item.designData) ? (
                          <span className='text-slate-400'>-</span>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {designItems.length > 0 ? (
          <div className='mt-6 grid gap-4 lg:grid-cols-2'>
            {designItems.map((item) => {
              const designData = isJsonObject(item.designData) ? item.designData : null;
              const backgroundLabel = getDesignBackgroundLabel(designData);
              const contentEntries = getDesignContentEntries(designData);
              const uploadedImages = getDesignUploadedImages(designData);
              const stats = getDesignStats(designData);
              const designCharacters = getDesignCharacters(designData);

              return (
                <div key={item.id} className='rounded-[22px] border border-[var(--admin-border)] bg-slate-50 p-4'>
                  <div className='flex flex-col gap-4 sm:flex-row'>
                    <div className='h-40 w-full shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white sm:w-40'>
                      <AdminDesignPreview
                        designData={designData}
                        previewUrl={item.previewUrl}
                        productName={item.productName}
                        characterParts={characterParts}
                        accessories={accessoryCatalog}
                        className='h-full w-full'
                        fit='contain'
                      />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-start justify-between gap-3'>
                        <div>
                          <p className='text-sm font-bold text-slate-900'>{item.productName}</p>
                          <p className='mt-1 text-xs text-slate-500'>
                            {[item.frameSizeLabel, item.frameColorName].filter(Boolean).join(' · ') || '-'}
                          </p>
                        </div>
                        {designData ? (
                          <button
                            onClick={() => setPreviewItem({
                              designData,
                              productName: item.productName,
                              previewUrl: item.previewUrl,
                            })}
                            className='rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50'
                          >
                            Xem dữ liệu
                          </button>
                        ) : null}
                      </div>

                      <div className='mt-3 grid gap-2 text-xs text-slate-600'>
                        <p><span className='font-bold text-slate-700'>Nền:</span> {backgroundLabel ?? '-'}</p>
                        <p>
                          <span className='font-bold text-slate-700'>Thành phần:</span>{' '}
                          {stats.characters} nhân vật · {stats.accessories} phụ kiện · {stats.uploadedImages} ảnh upload
                        </p>
                        {item.note ? (
                          <p className='whitespace-pre-line'>
                            <span className='font-bold text-slate-700'>Ghi chú:</span> {item.note}
                          </p>
                        ) : null}
                        {contentEntries.length > 0 ? (
                          <div className='rounded-xl bg-white p-3'>
                            {contentEntries.map(([key, value]) => (
                              <p key={key} className='truncate'>
                                <span className='font-semibold text-slate-500'>{key}:</span> {value}
                              </p>
                            ))}
                          </div>
                        ) : null}
                        {designCharacters.length > 0 ? (
                          <div className='rounded-xl bg-white p-3'>
                            <p className='mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500'>
                              Nhân vật LEGO
                            </p>
                            <div className='space-y-3'>
                              {designCharacters.map((character, index) => (
                                <div key={character.id} className='rounded-xl border border-slate-100 bg-slate-50 p-2'>
                                  <p className='mb-2 text-xs font-bold text-slate-800'>
                                    {character.name || `NV ${index + 1}`}
                                  </p>
                                  <div className='grid gap-2 sm:grid-cols-2'>
                                    <CharacterPartBadge label='Mặt' partId={character.faceId} partMap={characterPartMap} />
                                    <CharacterPartBadge label='Tóc' partId={character.hairId} partMap={characterPartMap} />
                                    <CharacterPartBadge label='Áo' partId={character.torsoId} partMap={characterPartMap} />
                                    <CharacterPartBadge label='Quần' partId={character.legsId} partMap={characterPartMap} />
                                    {character.hatId && (
                                      <CharacterPartBadge label='Mũ' partId={character.hatId} partMap={characterPartMap} />
                                    )}
                                  </div>
                                  {character.accessoryIds.length > 0 ? (
                                    <div className='mt-2 grid gap-2 sm:grid-cols-2'>
                                      {character.accessoryIds.map((partId) => (
                                        <CharacterPartBadge key={partId} label='Phụ kiện' partId={partId} partMap={characterPartMap} />
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {uploadedImages.length > 0 ? (
                        <div className='mt-3 flex flex-wrap gap-2'>
                          {uploadedImages.map((image) => {
                            const imageUrl = resolveApiAssetUrl(image.url);
                            const imageLabel = image.originalName ?? image.type;
                            return (
                              <a
                                key={`${image.type}-${image.url}`}
                                href={imageUrl}
                                target='_blank'
                                rel='noreferrer'
                                className='h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-white'
                                title={imageLabel}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imageUrl} alt={imageLabel} className='h-full w-full object-cover' />
                              </a>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </Card>

      {order.payments && order.payments.length > 0 ? (
        <Card className='p-5 sm:p-6'>
          <SectionHeader title={t('orderDetail.paymentLogs')} />
          <div className='mt-4'>
            <Table className='min-w-[760px]'>
              <TableHeader>
                <tr>
                  <TableHead>{t('orderDetail.provider')}</TableHead>
                  <TableHead>{t('orderDetail.type')}</TableHead>
                  <TableHead className='text-right'>{t('orders.amount')}</TableHead>
                  <TableHead className='text-center'>{t('common.status')}</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {order.payments.map((payment) => (
                  <TableRow key={payment.id} hoverable>
                    <TableCell className='font-medium text-slate-800'>{payment.provider}</TableCell>
                    <TableCell>{payment.type}</TableCell>
                    <TableCell className='text-right font-medium text-slate-800'>
                      {CURRENCY.format(payment.amount)}
                    </TableCell>
                    <TableCell className='text-center'>
                      <StatusBadge value={payment.status} t={t} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : null}

      {order.statusHistories && order.statusHistories.length > 0 ? (
        <Card className='p-5 sm:p-6'>
          <SectionHeader title='Lịch sử trạng thái' />
          <div className='mt-5 space-y-3'>
            {order.statusHistories.map((history) => {
              const actor = history.changedByAdmin?.name || history.changedByAdmin?.email || 'Hệ thống';
              return (
                <div key={history.id} className='rounded-2xl border border-[var(--admin-border)] bg-slate-50 p-4'>
                  <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                    <div>
                      <p className='text-sm font-bold text-slate-900'>
                        {HISTORY_TYPE_LABELS[history.type] ?? history.type}
                      </p>
                      <p className='mt-1 text-sm text-slate-600'>
                        <span className='font-semibold'>{history.fromValue ?? '-'}</span>
                        {' → '}
                        <span className='font-semibold'>{history.toValue ?? '-'}</span>
                      </p>
                      {history.note ? (
                        <p className='mt-2 whitespace-pre-line text-xs text-slate-500'>{history.note}</p>
                      ) : null}
                    </div>
                    <div className='text-left text-xs text-slate-500 sm:text-right'>
                      <p className='font-semibold text-slate-700'>{actor}</p>
                      <p>{new Date(history.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      {error ? <Card className='border-red-200 bg-red-50 p-4 text-red-700'>{error}</Card> : null}

      <DesignPreviewModal 
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        designData={previewItem?.designData ?? null}
        productName={previewItem?.productName || ''}
        previewUrl={previewItem?.previewUrl}
        characterParts={characterParts}
        accessories={accessoryCatalog}
      />
    </PageShell>
  );
}

