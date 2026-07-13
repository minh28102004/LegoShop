'use client';

import { PackageCheck, X } from 'lucide-react';
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import type { CustomFrameDesignData, JsonObject } from '@lego-shop/shared';
import { resolveApiAssetUrl } from '@/lib/api';
import type { Accessory, CharacterPart } from '@/modules/admin/types/admin.types';

const STUDIO_PREVIEW_MAX_BOUND = 420;
const STUDIO_PREVIEW_MIN_BOUND = 180;
const STUDIO_PREVIEW_FALLBACK_MAX_DIM = 30;

type PreviewCanvasSize = {
  width: number;
  height: number;
};

type PreviewPosition = {
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  rotation?: number;
};

type PreviewCharacterPartSnapshot = {
  id: string;
  name: string;
  type: string;
  imageUrl: string | null;
};

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
  canvasSize: PreviewCanvasSize;
  backgroundLabel?: string | null;
  previewUrl?: string | null;
  contentEntries: Array<[string, string]>;
  uploadedImages: Array<{ id: string; url: string; label: string }>;
  accessories: Array<{ id: string; name: string; quantity: number; imageUrl?: string | null }>;
  characters: Array<{
    id: string;
    name: string;
    imageUrl?: string | null;
    faceId?: string | null;
    hairId?: string | null;
    torsoId?: string | null;
    legsId?: string | null;
    hatId?: string | null;
    accessoryIds: string[];
  }>;
  elements: StudioElement[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  designData: JsonObject | null;
  productName: string;
  previewUrl?: string | null;
  characterParts?: CharacterPart[];
  accessories?: Accessory[];
};

type AdminDesignPreviewProps = {
  designData: JsonObject | null;
  previewUrl?: string | null;
  productName: string;
  characterParts?: CharacterPart[];
  accessories?: Accessory[];
  className?: string;
  fit?: 'responsive' | 'contain';
};

export function AdminDesignPreview({
  designData,
  previewUrl,
  productName,
  characterParts = [],
  accessories = [],
  className = '',
  fit = 'responsive',
}: AdminDesignPreviewProps) {
  const characterPartById = useMemo(
    () => new Map(characterParts.map((part) => [part.id, part])),
    [characterParts],
  );
  const accessoryImageById = useMemo(
    () => new Map(
      accessories
        .map((accessory) => [accessory.id, resolveApiAssetUrl(accessory.imageUrl)] as const)
        .filter((entry): entry is readonly [string, string] => Boolean(entry[1])),
    ),
    [accessories],
  );

  if (!isCustomFrameDesignData(designData)) {
    const resolvedPreviewUrl = resolveApiAssetUrl(previewUrl);

    return (
      <div className={`flex items-center justify-center overflow-hidden bg-slate-50 ${className}`}>
        {resolvedPreviewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolvedPreviewUrl}
            alt={productName}
            className={fit === 'contain' ? 'max-h-full max-w-full object-contain' : 'h-full w-full object-contain'}
          />
        ) : (
          <div className='grid h-full min-h-[160px] w-full place-items-center text-xs font-semibold text-slate-400'>
            Chưa có preview
          </div>
        )}
      </div>
    );
  }

  const canvasSize = getDesignPreviewCanvasSize(designData);
  const backgroundUrl = getDesignPreviewBackgroundUrl(designData, previewUrl);
  const textElements = getPreviewTextElements(designData);
  const sizingStyle: CSSProperties = fit === 'contain'
    ? { aspectRatio: `${canvasSize.width} / ${canvasSize.height}`, height: '100%' }
    : { aspectRatio: `${canvasSize.width} / ${canvasSize.height}`, width: '100%' };

  return (
    <div className={`flex items-center justify-center overflow-hidden bg-slate-50 ${className}`}>
      <div
        className='relative max-h-full max-w-full overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200'
        style={sizingStyle}
      >
        <PackageCheck className='absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-slate-200' />
        {backgroundUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backgroundUrl}
            alt={productName}
            className='absolute inset-0 h-full w-full object-cover'
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        ) : null}

        {textElements.map((element, index) => {
          const fontSize = readNumber(element.fontSize) ?? 16;
          const color = readString(element.color) ?? '#0f172a';
          const content = readString(element.content) ?? '';

          return (
            <div
              key={readString(element.id) ?? `text-${index}`}
              className='absolute whitespace-nowrap font-bold leading-none'
              style={{
                left: `${((readNumber(element.x) ?? 0) / canvasSize.width) * 100}%`,
                top: `${((readNumber(element.y) ?? 0) / canvasSize.height) * 100}%`,
                color,
                fontSize: `${clamp(fontSize * 0.36, 6, 13)}px`,
              }}
            >
              {content}
            </div>
          );
        })}

        {designData.characters.slice(0, 12).map((character, index) => {
          const imageUrl = resolveApiAssetUrl(character.imageUrl);
          const layers = getPreviewCharacterLayers(character, characterPartById);
          const style = getPreviewLayerStyle(character.position ?? character, canvasSize, index, 46, 74);

          return (
            <div key={character.id || `character-${index}`} className='absolute' style={style}>
              <div className='relative h-full w-full overflow-hidden rounded-md bg-white/80 shadow-sm ring-1 ring-white/80'>
                {layers.length > 0 ? (
                  layers.map((part) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={`${part.type}-${part.id}`}
                      src={part.imageUrl ?? ''}
                      alt=''
                      className='absolute inset-0 h-full w-full object-contain'
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  ))
                ) : imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={character.name}
                    className='h-full w-full object-contain'
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className='flex h-full w-full items-end justify-center bg-[#ffdf7e] pb-1 text-[9px] font-bold text-slate-900'>
                    NV
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {designData.accessories.slice(0, 12).map((accessory, index) => {
          const accessoryRecord = accessory as Record<string, unknown>;
          const imageUrl = resolveApiAssetUrl(readString(accessoryRecord.imageUrl)) || accessoryImageById.get(accessory.id) || '';

          return (
            <div
              key={`${accessory.id}-${index}`}
              className='absolute'
              style={getPreviewLayerStyle(accessory.position, canvasSize, index + designData.characters.length, 60, 60)}
            >
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={accessory.name}
                  className='h-full w-full object-contain'
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className='max-w-[76px] truncate rounded-full bg-white/90 px-2 py-1 text-[9px] font-bold text-slate-700 shadow-sm'>
                  {accessory.name}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DesignPreviewModal({
  isOpen,
  onClose,
  designData,
  productName,
  previewUrl,
  characterParts = [],
  accessories = [],
}: Props) {
  const [mounted, setMounted] = useState(false);
  const previewData = parseDesignData(designData);
  const accessoryImageById = useMemo(
    () => new Map(
      accessories
        .map((accessory) => [accessory.id, resolveApiAssetUrl(accessory.imageUrl)] as const)
        .filter((entry): entry is readonly [string, string] => Boolean(entry[1])),
    ),
    [accessories],
  );

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
                {previewData.schema === 'v1' ? (
                  <AdminDesignPreview
                    designData={designData}
                    previewUrl={previewUrl ?? previewData.previewUrl}
                    productName={productName}
                    characterParts={characterParts}
                    accessories={accessories}
                    className='h-[min(68vh,620px)] rounded-xl border border-slate-200 p-3 shadow-sm'
                    fit='contain'
                  />
                ) : previewData.previewUrl ? (
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

                {previewData.schema !== 'v1' && previewData.previewUrl ? (
                  <RelativePreview previewData={previewData} compact />
                ) : null}

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
                        <div key={character.id} className='rounded-lg border border-slate-100 bg-slate-50 p-2'>
                          <div className='flex items-center gap-2'>
                            {character.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={resolveApiAssetUrl(character.imageUrl)} alt='' className='h-8 w-8 rounded-lg object-cover' />
                            ) : null}
                            <span className='font-semibold'>{character.name || character.id}</span>
                          </div>
                          <p className='mt-1 break-all text-xs text-slate-500'>
                            {[character.faceId, character.hairId, character.torsoId, character.legsId, character.hatId]
                              .filter(Boolean)
                              .join(' · ') || 'Chưa có part ID'}
                          </p>
                          {character.accessoryIds.length > 0 ? (
                            <p className='mt-1 break-all text-xs text-slate-500'>
                              Phụ kiện: {character.accessoryIds.join(', ')}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </Panel>
                ) : null}

                {previewData.accessories.length > 0 ? (
                  <Panel title='Phụ kiện'>
                    <div className='space-y-2 text-sm text-slate-700'>
                      {previewData.accessories.map((accessory) => {
                        const imageUrl = resolveApiAssetUrl(accessory.imageUrl) || accessoryImageById.get(accessory.id) || '';

                        return (
                          <div key={accessory.id} className='flex items-center gap-2'>
                            {imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={imageUrl} alt='' className='h-8 w-8 rounded-lg object-cover' />
                            ) : null}
                            <span>{accessory.name} x{accessory.quantity}</span>
                          </div>
                        );
                      })}
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
            width: previewData.canvasSize.width,
            height: previewData.canvasSize.height,
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
                  left: `${(element.x / previewData.canvasSize.width) * 100}%`,
                  top: `${(element.y / previewData.canvasSize.height) * 100}%`,
                  width: `${(element.width / previewData.canvasSize.width) * 100}%`,
                  height: `${(element.height / previewData.canvasSize.height) * 100}%`,
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

  const frameSize = readString(value.frameSize) ?? readString(value.frameSizeLabel) ?? '';
  const canvasSize = getCanvasSizeFromLabel(frameSize);

  return {
    schema: 'legacy',
    frameSize,
    frameOrientation: canvasSize.width >= canvasSize.height ? 'landscape' : 'portrait',
    canvasSize,
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
  const canvasSize = getDesignPreviewCanvasSize(value);
  const accessoryElements = value.accessories.map((accessory) => ({
    id: `accessory-${accessory.id}`,
    type: 'accessory' as const,
    x: accessory.position.x,
    y: accessory.position.y,
    width: 60 * accessory.position.scale,
    height: 60 * accessory.position.scale,
    rotation: accessory.position.rotate,
    content: accessory.name,
    src: readString((accessory as Record<string, unknown>).imageUrl),
  }));
  const characterElements = value.characters.map((character, index) => {
    const legacyPosition = isRecord(character.position) ? character.position : null;
    const scale = readNumber(character.scale) ?? readNumber(legacyPosition?.scale) ?? 1;
    const x = readNumber(character.x) ?? readNumber(legacyPosition?.x) ?? 90 + index * 70;
    const y = readNumber(character.y) ?? readNumber(legacyPosition?.y) ?? 165;
    const rotation =
      readNumber(character.rotation) ??
      readNumber(legacyPosition?.rotation) ??
      readNumber(legacyPosition?.rotate) ??
      0;

    return {
      id: `character-${character.id}`,
      type: 'character' as const,
      x,
      y,
      width: 54 * scale,
      height: 92 * scale,
      rotation,
      content: readString(character.name) ?? `NV ${index + 1}`,
      src: readString(character.imageUrl),
    };
  });

  return {
    schema: 'v1',
    frameSize: value.frameOptionLabel ?? value.frameOptionId,
    frameOrientation: canvasSize.width >= canvasSize.height ? 'landscape' : 'portrait',
    canvasSize,
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
      imageUrl: readString((accessory as Record<string, unknown>).imageUrl),
    })),
    characters: value.characters.map((character) => ({
      id: character.id,
      name: readString(character.name) ?? character.id,
      imageUrl: readString(character.imageUrl),
      faceId: readString(character.faceId),
      hairId: readString(character.hairId),
      torsoId: readString(character.torsoId),
      legsId: readString(character.legsId),
      hatId: readString(character.hatId),
      accessoryIds: Array.isArray(character.accessoryIds)
        ? character.accessoryIds.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
        : [],
    })),
    elements: [...accessoryElements, ...characterElements],
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

function getDesignPreviewCanvasSize(designData: CustomFrameDesignData): PreviewCanvasSize {
  const storedCanvasSize = readRecord(designData.canvasSize);
  const storedWidth = readNumber(storedCanvasSize?.width);
  const storedHeight = readNumber(storedCanvasSize?.height);

  if (storedWidth && storedHeight) {
    return { width: storedWidth, height: storedHeight };
  }

  return getCanvasSizeFromLabel(designData.frameOptionLabel);
}

function getCanvasSizeFromLabel(label: unknown): PreviewCanvasSize {
  const frameDimensions = parseFrameDimensions(label);
  const maxDim = Math.max(
    frameDimensions.width,
    frameDimensions.height,
    STUDIO_PREVIEW_FALLBACK_MAX_DIM,
  );

  return {
    width: Math.max(
      STUDIO_PREVIEW_MIN_BOUND,
      Math.round((frameDimensions.width / maxDim) * STUDIO_PREVIEW_MAX_BOUND),
    ),
    height: Math.max(
      STUDIO_PREVIEW_MIN_BOUND,
      Math.round((frameDimensions.height / maxDim) * STUDIO_PREVIEW_MAX_BOUND),
    ),
  };
}

function parseFrameDimensions(label: unknown) {
  if (typeof label !== 'string') return { width: 30, height: 30 };
  const match = label.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/i);

  if (match?.[1] && match?.[2]) {
    return {
      width: Number(match[1]),
      height: Number(match[2]),
    };
  }

  return { width: 30, height: 30 };
}

function getDesignPreviewBackgroundUrl(designData: CustomFrameDesignData, itemPreviewUrl?: string | null) {
  const uploadedBackgroundUrl = designData.uploadedImages.find((image) => image.type === 'background')?.url;
  return resolveApiAssetUrl(itemPreviewUrl || designData.previewUrl || uploadedBackgroundUrl);
}

function getPreviewLayerStyle(
  position: PreviewPosition | undefined,
  canvasSize: PreviewCanvasSize,
  fallbackIndex: number,
  baseWidth: number,
  baseHeight: number,
): CSSProperties {
  const x = readNumber(position?.x) ?? 90 + fallbackIndex * 44;
  const y = readNumber(position?.y) ?? 120 + fallbackIndex * 18;
  const scale = readNumber(position?.scale) ?? 1;
  const rotate = readNumber(position?.rotate) ?? readNumber(position?.rotation) ?? 0;
  const width = baseWidth * scale;
  const height = baseHeight * scale;

  return {
    left: `${(x / canvasSize.width) * 100}%`,
    top: `${(y / canvasSize.height) * 100}%`,
    width: `${clamp((width / canvasSize.width) * 100, 3, 42)}%`,
    height: `${clamp((height / canvasSize.height) * 100, 3, 42)}%`,
    transform: `rotate(${rotate}deg)`,
    transformOrigin: 'center center',
  };
}

function getPreviewTextElements(designData: CustomFrameDesignData) {
  const elements = designData.elements;
  if (!Array.isArray(elements)) return [];

  return elements.flatMap((element): JsonObject[] => {
    const record = readRecord(element);
    if (record?.type !== 'text' || typeof record.content !== 'string' || !record.content.trim()) {
      return [];
    }

    return [record as JsonObject];
  });
}

function getPreviewCharacterPartSnapshot(value: unknown): PreviewCharacterPartSnapshot | null {
  const record = Array.isArray(value) ? readRecord(value[0]) : readRecord(value);
  if (!record) return null;

  const id = readString(record.id);
  const name = readString(record.name);
  const type = readString(record.type);
  const imageUrl = resolveApiAssetUrl(readString(record.imageUrl));

  if (!id || !name || !type) return null;

  return { id, name, type, imageUrl: imageUrl || null };
}

function getPreviewCharacterPartSnapshots(value: unknown) {
  if (!Array.isArray(value)) {
    const snapshot = getPreviewCharacterPartSnapshot(value);
    return snapshot ? [snapshot] : [];
  }

  return value
    .map((item) => getPreviewCharacterPartSnapshot(item))
    .filter((item): item is PreviewCharacterPartSnapshot => Boolean(item?.imageUrl));
}

function toPreviewCharacterPartSnapshot(part: CharacterPart | undefined): PreviewCharacterPartSnapshot | null {
  if (!part) return null;

  return {
    id: part.id,
    name: part.name,
    type: part.type,
    imageUrl: resolveApiAssetUrl(part.imageUrl) || part.imageUrl || null,
  };
}

function getPreviewCharacterLayers(
  character: CustomFrameDesignData['characters'][number],
  characterPartById: Map<string, CharacterPart>,
) {
  const storedParts = readRecord(character.characterParts);
  const storedLayers = [
    getPreviewCharacterPartSnapshot(storedParts?.LEGS),
    getPreviewCharacterPartSnapshot(storedParts?.TORSO),
    getPreviewCharacterPartSnapshot(storedParts?.FACE),
    getPreviewCharacterPartSnapshot(storedParts?.HAIR),
    getPreviewCharacterPartSnapshot(storedParts?.HAT),
    ...getPreviewCharacterPartSnapshots(storedParts?.ACCESSORY),
  ].filter((part): part is PreviewCharacterPartSnapshot => Boolean(part?.imageUrl));

  if (storedLayers.length > 0) return storedLayers;

  const accessoryIds = Array.isArray(character.accessoryIds) ? character.accessoryIds : [];
  return [
    toPreviewCharacterPartSnapshot(characterPartById.get(character.legsId)),
    toPreviewCharacterPartSnapshot(characterPartById.get(character.torsoId)),
    toPreviewCharacterPartSnapshot(characterPartById.get(character.faceId)),
    toPreviewCharacterPartSnapshot(characterPartById.get(character.hairId)),
    character.hatId ? toPreviewCharacterPartSnapshot(characterPartById.get(character.hatId)) : null,
    ...accessoryIds.map((id) => toPreviewCharacterPartSnapshot(characterPartById.get(id))),
  ].filter((part): part is PreviewCharacterPartSnapshot => Boolean(part?.imageUrl));
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

function readRecord(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
