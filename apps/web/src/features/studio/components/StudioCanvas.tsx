"use client";

import { Undo, Redo, Trash2, Share2, Image as ImageIcon, Type } from "lucide-react";
import { useStudio } from "./StudioContext";
import { useState, useRef, useEffect } from "react";
import { uploadCustomerImage } from "@/lib/api/uploads";

const getFrameColorHex = (name: string, apiHex?: string | null): string => {
  if (apiHex && apiHex.startsWith('#')) return apiHex;
  const lower = (name || '').trim().toLowerCase();
  if (lower === 'trắng' || lower === 'white') return '#ffffff';
  if (lower === 'đen' || lower === 'black') return '#1f1f21';
  if (lower === 'gỗ' || lower === 'wood') return '#d7a15c';
  return '#d1d5db';
};

export function StudioCanvas() {
  const { 
    elements, selectedId, setSelectedId, updateElement, removeElement, 
    activeTemplate, zoom, addElement, templates, frameSize, frameSizes,
    customBackgroundUrl, setCustomBackgroundUrl,
    setCustomBackgroundOriginalName
  } = useStudio();
  
  const currentTemplate = templates.find(t => t.id === activeTemplate);
  const activeTemplateImage = customBackgroundUrl ?? currentTemplate?.imageUrl;
  const backgroundInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const parseFrameDimensions = (lbl: string) => {
    const match = lbl.match(/(\d+)\s*x\s*(\d+)/i);
    if (match && match[1] && match[2]) {
      const wVal = parseInt(match[1], 10);
      const hVal = parseInt(match[2], 10);
      return { w: wVal, h: hVal };
    }
    return { w: 20, h: 20 };
  };

  const parsedSizes = frameSizes.map(s => {
    const { w, h } = parseFrameDimensions(s.label);
    return { id: s.id, w, h };
  });

  const maxDim = parsedSizes.length > 0 ? Math.max(...parsedSizes.map(s => Math.max(s.w, s.h)), 30) : 30;

  const selectedFrameSize = frameSizes.find(s => s.id === frameSize);
  const frameColorHex = getFrameColorHex("", selectedFrameSize?.colorHex);
  const currentSizeObj = selectedFrameSize?.widthCm && selectedFrameSize?.heightCm
    ? { w: selectedFrameSize.widthCm, h: selectedFrameSize.heightCm }
    : parsedSizes.find(s => s.id === frameSize) || { w: 20, h: 20 };

  const maxBound = 360;
  const minBound = 180;
  
  const canvasW = Math.max(minBound, Math.round((currentSizeObj.w / maxDim) * maxBound));
  const canvasH = Math.max(minBound, Math.round((currentSizeObj.h / maxDim) * maxBound));

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ id: string, startX: number, startY: number, initialX: number, initialY: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent, id: string, initialX: number, initialY: number) => {
    e.stopPropagation();
    setSelectedId(id);
    setIsDragging(true);
    dragRef.current = { id, startX: e.clientX, startY: e.clientY, initialX, initialY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragRef.current) return;
    const { id, startX, startY, initialX, initialY } = dragRef.current;
    const dx = (e.clientX - startX) / zoom;
    const dy = (e.clientY - startY) / zoom;
    updateElement(id, { x: initialX + dx, y: initialY + dy });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    dragRef.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleBackgroundUpload = async (file?: File) => {
    if (!file) return;
    setUploadingBackground(true);
    setUploadError(null);
    try {
      const uploaded = await uploadCustomerImage(file);
      setCustomBackgroundUrl(uploaded.url);
      setCustomBackgroundOriginalName(uploaded.originalName);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Không tải được ảnh lên");
    } finally {
      setUploadingBackground(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !isDragging) {
        const tag = (document.activeElement as HTMLElement)?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          removeElement(selectedId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, isDragging, removeElement]);

  return (
    <div className="flex-1 flex flex-col h-full relative" onClick={() => setSelectedId(null)}>
      {/* Toolbar */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
        <span className="bg-surface/90 backdrop-blur-sm text-xs font-bold uppercase tracking-widest text-text-secondary px-3 py-1.5 rounded-full border border-border shadow-sm pointer-events-auto">
          ẢNH XEM TRƯỚC
        </span>
        <div className="flex items-center gap-1.5 pointer-events-auto" onClick={e => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => addElement({ type: 'text', content: 'Văn bản mới', x: 120 + Math.random() * 160, y: 120 + Math.random() * 160, fontSize: 14, color: '#000000' })}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface border border-border text-xs font-semibold rounded-lg hover:bg-surface-hover shadow-sm transition-colors"
          >
            <Type className="w-3.5 h-3.5 text-text-secondary" />
            <span className="hidden sm:inline text-text-secondary">Thêm chữ</span>
          </button>
          <button
            type="button"
            onClick={() => backgroundInputRef.current?.click()}
            disabled={uploadingBackground}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface border border-border text-xs font-semibold rounded-lg hover:bg-surface-hover shadow-sm transition-colors text-emerald-600"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{uploadingBackground ? "Đang tải..." : "Hình ảnh"}</span>
          </button>
          <input
            ref={backgroundInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => handleBackgroundUpload(event.target.files?.[0])}
          />
          <div className="flex items-center bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
            <button type="button" className="px-2 py-1.5 text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors" title="Hoàn tác">
              <Undo className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-border" />
            <button type="button" className="px-2 py-1.5 text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors" title="Làm lại">
              <Redo className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => selectedId && removeElement(selectedId)}
            className={`p-1.5 border rounded-lg shadow-sm transition-colors ${selectedId ? 'bg-surface border-error/30 text-error hover:bg-error/10' : 'bg-surface/50 border-border text-text-muted cursor-not-allowed'}`}
            title="Xóa"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="p-1.5 bg-surface border border-border rounded-lg shadow-sm text-text-muted hover:text-primary hover:border-primary/30 transition-colors"
            title="Chia sẻ"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-10 pt-14">
        <div
          className="bg-white relative transition-all duration-300 origin-center bg-center bg-cover bg-no-repeat"
          style={{
            width: `${canvasW}px`,
            height: `${canvasH}px`,
            transform: `scale(${zoom})`,
            backgroundImage: activeTemplateImage ? `url(${activeTemplateImage})` : 'none',
            border: `12px solid ${frameColorHex}`,
            boxSizing: 'content-box',
            boxShadow: `
              0 15px 35px -5px rgba(0, 0, 0, 0.18), 
              0 10px 15px -6px rgba(0, 0, 0, 0.15),
              inset 0 0 5px rgba(0, 0, 0, 0.2), 
              inset 0 2px 4px rgba(255, 255, 255, 0.15)
            `,
          }}
        >
          {!activeTemplateImage && elements.length === 0 && (
            <div className="absolute inset-8 border-2 border-dashed border-zinc-200 rounded flex flex-col items-center justify-center text-zinc-400 pointer-events-none">
              <span className="text-sm text-center">Khu vực thiết kế</span>
              <span className="text-xs text-center mt-1 opacity-60">Chọn mẫu hoặc thêm chữ/phụ kiện</span>
            </div>
          )}
          {uploadError ? (
            <div className="absolute left-4 right-4 top-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {uploadError}
            </div>
          ) : null}
          {elements.map(el => (
            <div
              key={el.id}
              onPointerDown={e => handlePointerDown(e, el.id, el.x, el.y)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`absolute cursor-move select-none ${selectedId === el.id ? 'ring-2 ring-primary ring-offset-1' : 'hover:ring-1 hover:ring-primary/40'}`}
              style={{ left: el.x, top: el.y, fontSize: el.fontSize, color: el.color, width: el.width, height: el.height, touchAction: 'none' }}
            >
              {(el.type === 'accessory' || el.type === 'character') && el.imageUrl ? (
                <img src={el.imageUrl} alt={el.content} className="w-full h-full object-contain pointer-events-none" />
              ) : el.type === 'character' ? (
                <div className="pointer-events-none flex h-full w-full flex-col items-center justify-end">
                  <div className="h-5 w-5 rounded-full border-2 border-zinc-950 bg-amber-200 shadow-sm" />
                  <div className="mt-0.5 h-9 w-7 rounded-md border-2 border-zinc-950 bg-primary shadow-sm" />
                  <span className="mt-1 rounded-full bg-white/85 px-1.5 py-0.5 text-[9px] font-black text-zinc-900 shadow-sm">
                    {el.content}
                  </span>
                </div>
              ) : (
                <span className="pointer-events-none whitespace-nowrap">{el.content}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
