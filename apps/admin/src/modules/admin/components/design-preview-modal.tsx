'use client';

import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

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
  style?: any;
};

type DesignData = {
  frameSize: string;
  frameOrientation: 'landscape' | 'portrait';
  elements: StudioElement[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  designData: DesignData | null;
  productName: string;
};

export default function DesignPreviewModal({ isOpen, onClose, designData, productName }: Props) {
  const [mounted, setMounted] = useState(false);

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
          {!designData ? (
            <div className="text-center text-slate-500 p-10">Không có dữ liệu thiết kế</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Kích thước khung</div>
                  <div className="font-semibold text-slate-800">{designData.frameSize}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Chiều</div>
                  <div className="font-semibold text-slate-800">
                    {designData.frameOrientation === 'landscape' ? 'Ngang' : 'Dọc'}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                <div className="text-sm font-bold text-slate-800 mb-6 w-full">Mô phỏng vị trí (Relative)</div>
                <div 
                  className="relative bg-zinc-100 border-2 border-dashed border-zinc-300 rounded-lg overflow-hidden flex items-center justify-center"
                  style={{
                    width: designData.frameOrientation === 'landscape' ? '600px' : '400px',
                    height: designData.frameOrientation === 'landscape' ? '400px' : '600px',
                    maxWidth: '100%'
                  }}
                >
                  {designData.elements.length === 0 ? (
                    <span className="text-zinc-400 font-medium">Khung trống</span>
                  ) : (
                    designData.elements.map(el => (
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
