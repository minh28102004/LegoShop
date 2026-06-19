'use client';

import { X } from 'lucide-react';
import React, { useEffect, useState, type CSSProperties } from 'react';
import type { JsonObject } from '@lego-shop/shared';

type StudioElement = {
  id: string;
  type: 'text' | 'accessory' | 'image';
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
  frameSize: string;
  frameOrientation: 'landscape' | 'portrait';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            Bản thiết kế: {productName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex flex-col gap-6">
          {!previewData ? (
            <div className="text-center text-slate-500 p-10">Không có dữ liệu thiết kế</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Kích thước khung</div>
                  <div className="font-semibold text-slate-800">{previewData.frameSize}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Chiều</div>
                  <div className="font-semibold text-slate-800">
                    {previewData.frameOrientation === 'landscape' ? 'Ngang' : 'Dọc'}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                <div className="text-sm font-bold text-slate-800 mb-6 w-full">Mô phỏng vị trí (Relative)</div>
                <div 
                  className="relative bg-zinc-100 border-2 border-dashed border-zinc-300 rounded-lg overflow-hidden flex items-center justify-center"
                  style={{
                    width: previewData.frameOrientation === 'landscape' ? '600px' : '400px',
                    height: previewData.frameOrientation === 'landscape' ? '400px' : '600px',
                    maxWidth: '100%'
                  }}
                >
                  {previewData.elements.length === 0 ? (
                    <span className="text-zinc-400 font-medium">Khung trống</span>
                  ) : (
                    previewData.elements.map(el => (
                      <div
                        key={el.id}
                        className={`absolute border border-blue-400 bg-blue-500/10 flex items-center justify-center rounded overflow-hidden shadow-sm`}
                        style={{
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${el.width}px`,
                          height: `${el.height}px`,
                          transform: `rotate(${el.rotation}deg)`,
                        }}
                      >
                        {el.type === 'text' ? (
                          <div 
                            style={{
                              ...el.style,
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textAlign: el.style?.textAlign || 'center'
                            }}
                          >
                            {el.content}
                          </div>
                        ) : el.type === 'accessory' && el.src ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={el.src} 
                            alt="Accessory" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        ) : (
                          <div className="text-xs text-blue-700 font-bold p-1">[{el.type}]</div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 text-sm font-bold text-slate-700">
                  Dữ liệu gốc (JSON)
                </div>
                <pre className="p-4 text-xs font-mono text-slate-600 bg-slate-50 overflow-x-auto">
                  {JSON.stringify(designData, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function parseDesignData(value: JsonObject | null): DesignData | null {
  if (!value) return null;

  return {
    frameSize: readString(value.frameSize) ?? '',
    frameOrientation: value.frameOrientation === 'landscape' ? 'landscape' : 'portrait',
    elements: Array.isArray(value.elements) ? value.elements.flatMap(parseStudioElement) : [],
  };
}

function parseStudioElement(value: unknown): StudioElement[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];

  const record = value as Record<string, unknown>;
  if (!isStudioElementType(record.type)) return [];

  return [
    {
      id: readString(record.id) ?? `${record.type}-${readNumber(record.x) ?? 0}-${readNumber(record.y) ?? 0}`,
      type: record.type,
      x: readNumber(record.x) ?? 0,
      y: readNumber(record.y) ?? 0,
      width: readNumber(record.width) ?? 0,
      height: readNumber(record.height) ?? 0,
      rotation: readNumber(record.rotation) ?? 0,
      content: readString(record.content),
      src: readString(record.src),
      style: readStyle(record.style),
    },
  ];
}

function isStudioElementType(value: unknown): value is StudioElement['type'] {
  return value === 'text' || value === 'accessory' || value === 'image';
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function readStyle(value: unknown): CSSProperties | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string | number] => {
      const [, entryValue] = entry;
      return typeof entryValue === 'string' || typeof entryValue === 'number';
    }),
  ) as CSSProperties;
}
