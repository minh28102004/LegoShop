'use client';

import { X } from 'lucide-react';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import type { CustomFrameDesignData, JsonObject } from '@lego-shop/shared';
import { resolveApiAssetUrl } from '@/lib/api';

type StudioElement = {
  id: string;
  type: 'text' | 'accessory' | 'image' | 'character';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content?: string;
  src?: string;
  style?: CSSProperties;
};

type DesignData = {
  schema: 'v1' | 'legacy';
  frameSize: string;
  frameOrientation: 'landscape' | 'portrait';
  backgroundLabel?: string | null;
  previewUrl?: string | null;
  contentEntries: Array<[string, string]>;
  uploadedImages: Array<{ id: string; url: string; label: string }>;
  accessories: Array<{ id: string; name: string; quantity: number }>;
  characters: Array<{ id: string; name: string; imageUrl?: string | null }>;
  elements: StudioElement[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  designData: JsonObject | null;
  productName: string;
};

export default function DesignPreviewModal({ isOpen, onClose, designData, productName }: Props) {
  const [mounted, setMounted] = useState(false);
  const previewData = parseDesignData(designData);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'>
      <div className='flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl'>
        <div className='flex items-center justify-between border-b border-slate-100 p-4'>
          <div>
            <h2 className='text-lg font-bold text-slate-800'>Bản thiết kế: {productName}</h2>
            {previewData ? (
              <p className='mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400'>
                {previewData.schema === 'v1' ? 'Custom frame schema v1' : 'Legacy design data'}
              </p>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className='rounded-full p-2 transition-colors hover:bg-slate-100'
            aria-label='Đóng'
          >
            <X className='h-5 w-5 text-slate-500' />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto bg-slate-50 p-6'>
          {!previewData ? (
            <div className='p-10 text-center text-slate-500'>Không có dữ liệu thiết kế</div>
          ) : (
            <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]'>
              <div className='space-y-6'>
                {previewData.previewUrl ? (
                  <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveApiAssetUrl(previewData.previewUrl)}
                      alt={productName}
                      className='max-h-[520px] w-full object-contain'
                    />
                  </div>
                ) : (
                  <RelativePreview previewData={previewData} />
                )}

                {previewData.previewUrl ? <RelativePreview previewData={previewData} compact /> : null}

                <div className='overflow-hidden rounded-xl border border-slate-200 bg-white'>
                  <div className='border-b border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700'>
                    Dữ liệu gốc (JSON)
                  </div>
                  <pre className='overflow-x-auto bg-slate-50 p-4 font-mono text-xs text-slate-600'>
                    {JSON.stringify(designData, null, 2)}
                  </pre>
                </div>
              </div>

              <aside className='space-y-4'>
                <InfoCard label='Kích thước khung' value={previewData.frameSize || '-'} />
                <InfoCard label='Nền' value={previewData.backgroundLabel || '-'} />
                <InfoCard label='Chiều' value={previewData.frameOrientation === 'landscape' ? 'Ngang' : 'Dọc'} />

                {previewData.contentEntries.length > 0 ? (
                  <Panel title='Nội dung in'>
                    <div className='space-y-2 text-sm'>
                      {previewData.contentEntries.map(([key, value]) => (
                        <p key={key} className='text-slate-700'>
                          <span className='font-semibold text-slate-500'>{key}:</span> {value}
                        </p>
                      ))}
                    </div>
                  </Panel>
                ) : null}

                {previewData.characters.length > 0 ? (
                  <Panel title='Nhân vật'>
                    <div className='space-y-2 text-sm text-slate-700'>
                      {previewData.characters.map((character) => (
                        <div key={character.id} className='flex items-center gap-2'>
                          {character.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={resolveApiAssetUrl(character.imageUrl)} alt='' className='h-8 w-8 rounded-lg object-cover' />
                          ) : null}
                          <span>{character.name || character.id}</span>
                        </div>
                      ))}
                    </div>
                  </Panel>
                ) : null}

                {previewData.accessories.length > 0 ? (
                  <Panel title='Phụ kiện'>
                    <div className='space-y-1 text-sm text-slate-700'>
                      {previewData.accessories.map((accessory) => (
                        <p key={accessory.id}>{accessory.name} x{accessory.quantity}</p>
                      ))}
                    </div>
                  </Panel>
                ) : null}

                {previewData.uploadedImages.length > 0 ? (
                  <Panel title='Ảnh upload'>
                    <div className='grid grid-cols-3 gap-2'>
                      {previewData.uploadedImages.map((image) => (
                        <a
                          key={image.id}
                          href={resolveApiAssetUrl(image.url)}
                          target='_blank'
                          rel='noreferrer'
                          className='overflow-hidden rounded-lg border border-slate-200 bg-white'
                          title={image.label}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={resolveApiAssetUrl(image.url)} alt={image.label} className='aspect-square w-full object-cover' />
                        </a>
                      ))}
                    </div>
                  </Panel>
                ) : null}
              </aside>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RelativePreview({ previewData, compact = false }: { previewData: DesignData; compact?: boolean }) {
  return (
    <div className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
      <div className='mb-4 text-sm font-bold text-slate-800'>
        {compact ? 'Mô phỏng vị trí' : 'Mô phỏng vị trí tương đối'}
      </div>
      <div className='flex justify-center overflow-x-auto'>
        <div
          className='relative flex items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-100'
          style={{
            width: previewData.frameOrientation === 'landscape' ? 600 : 400,
            height: previewData.frameOrientation === 'landscape' ? 400 : 600,
            maxWidth: '100%',
          }}
        >
          {previewData.elements.length === 0 ? (
            <span className='font-medium text-zinc-400'>Không có tọa độ chi tiết</span>
          ) : (
            previewData.elements.map((element) => (
              <div
                key={element.id}
                className='absolute flex items-center justify-center overflow-hidden rounded border border-blue-400 bg-blue-500/10 text-center shadow-sm'
                style={{
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                  transform: `rotate(${element.rotation}deg)`,
                }}
              >
                {element.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resolveApiAssetUrl(element.src)} alt='' className='h-full w-full object-contain' />
                ) : element.type === 'text' ? (
                  <div
                    style={{
                      ...element.style,
                      display: 'flex',
                      height: '100%',
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: element.style?.textAlign || 'center',
                    }}
                  >
                    {element.content}
                  </div>
                ) : (
                  <div className='p-1 text-xs font-bold text-blue-700'>{element.content || `[${element.type}]`}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-xl border border-slate-200 bg-white p-4'>
      <div className='mb-1 text-xs font-bold uppercase tracking-wider text-slate-500'>{label}</div>
      <div className='font-semibold text-slate-800'>{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className='rounded-xl border border-slate-200 bg-white p-4'>
      <div className='mb-3 text-xs font-bold uppercase tracking-wider text-slate-500'>{title}</div>
      {children}
    </div>
  );
}

function parseDesignData(value: JsonObject | null): DesignData | null {
  if (!value) return null;
  if (isCustomFrameDesignData(value)) return parseCustomFrameDesign(value);

  return {
    schema: 'legacy',
    frameSize: readString(value.frameSize) ?? readString(value.frameSizeLabel) ?? '',
    frameOrientation: value.frameOrientation === 'landscape' ? 'landscape' : 'portrait',
    backgroundLabel: readString(value.templateName) ?? readString(value.backgroundName),
    previewUrl: readString(value.previewUrl),
    contentEntries: getContentEntries(value.contentValues ?? value.printText),
    uploadedImages: [],
    accessories: [],
    characters: [],
    elements: Array.isArray(value.elements) ? value.elements.flatMap(parseStudioElement) : [],
  };
}

function parseCustomFrameDesign(value: CustomFrameDesignData): DesignData {
  const backgroundUpload = value.uploadedImages.find((image) => image.type === 'background');
  const accessoryElements = value.accessories.map((accessory) => ({
    id: `accessory-${accessory.id}`,
    type: 'accessory' as const,
    x: accessory.position.x,
    y: accessory.position.y,
    width: 60 * accessory.position.scale,
    height: 60 * accessory.position.scale,
    rotation: accessory.position.rotate,
    content: accessory.name,
  }));
  const characterElements = value.characters.map((character) => ({
    id: `character-${character.id}`,
    type: 'character' as const,
    x: character.position.x,
    y: character.position.y,
    width: 46 * character.position.scale,
    height: 70 * character.position.scale,
    rotation: character.position.rotate,
    content: character.name ?? undefined,
    src: character.imageUrl ?? undefined,
  }));

  return {
    schema: 'v1',
    frameSize: value.frameOptionLabel ?? value.frameOptionId,
    frameOrientation: 'portrait',
    backgroundLabel: value.backgroundName ?? value.backgroundId,
    previewUrl: value.previewUrl,
    contentEntries: getContentEntries(value.content),
    uploadedImages: value.uploadedImages.map((image) => ({
      id: image.id,
      url: image.url,
      label: image.originalName ?? image.type,
    })),
    accessories: value.accessories.map((accessory) => ({
      id: accessory.id,
      name: accessory.name,
      quantity: accessory.quantity,
    })),
    characters: value.characters.map((character) => ({
      id: character.id,
      name: character.name ?? character.id,
      imageUrl: character.imageUrl,
    })),
    elements: [
      ...(backgroundUpload
        ? [{
            id: 'background-upload',
            type: 'image' as const,
            x: 0,
            y: 0,
            width: 400,
            height: 600,
            rotation: 0,
            src: backgroundUpload.url,
          }]
        : []),
      ...accessoryElements,
      ...characterElements,
    ],
  };
}

function parseStudioElement(value: unknown): StudioElement[] {
  if (!isRecord(value)) return [];

  if (!isStudioElementType(value.type)) return [];

  return [
    {
      id: readString(value.id) ?? `${value.type}-${readNumber(value.x) ?? 0}-${readNumber(value.y) ?? 0}`,
      type: value.type,
      x: readNumber(value.x) ?? 0,
      y: readNumber(value.y) ?? 0,
      width: readNumber(value.width) ?? 0,
      height: readNumber(value.height) ?? 0,
      rotation: readNumber(value.rotation) ?? 0,
      content: readString(value.content),
      src: readString(value.src) ?? readString(value.imageUrl),
      style: readStyle(value.style),
    },
  ];
}

function isCustomFrameDesignData(value: unknown): value is CustomFrameDesignData {
  return isRecord(value) && value.version === 1 && value.type === 'CUSTOM_FRAME';
}

function isStudioElementType(value: unknown): value is StudioElement['type'] {
  return value === 'text' || value === 'accessory' || value === 'image' || value === 'character';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getContentEntries(value: unknown) {
  if (!isRecord(value)) return [];
  return Object.entries(value)
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].trim().length > 0)
    .slice(0, 8);
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function readStyle(value: unknown): CSSProperties | undefined {
  if (!isRecord(value)) return undefined;

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string | number] => {
      const [, entryValue] = entry;
      return typeof entryValue === 'string' || typeof entryValue === 'number';
    }),
  ) as CSSProperties;
}
