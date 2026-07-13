"use client";

import { Undo, Redo, Trash2 } from "lucide-react";
import { useStudio } from "./StudioContext";
import { useState, useRef, useEffect } from "react";

export function StudioCanvas() {
  const { 
    elements, 
    selectedId, 
    setSelectedId, 
    updateElement, 
    removeElement, 
    activeTemplate, 
    zoom, 
    addElement,
    templates
  } = useStudio();
  
  const currentTemplate = templates.find(t => t.id === activeTemplate);
  const activeTemplateImage = currentTemplate?.imageUrl;

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
    
    // Calculate new position
    const dx = (e.clientX - startX) / zoom;
    const dy = (e.clientY - startY) / zoom;
    
    updateElement(id, { x: initialX + dx, y: initialY + dy });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    dragRef.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Keyboard delete support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId && !isDragging) {
          removeElement(selectedId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, isDragging, removeElement]);

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 h-full relative" onClick={() => setSelectedId(null)}>
      {/* Top Toolbar */}
      <div className="absolute top-4 right-6 flex items-center gap-2 z-10" onClick={e => e.stopPropagation()}>
        <button onClick={() => addElement({ type: 'text', content: 'Văn bản mới', x: 150, y: 150, fontSize: 16, color: '#000000' })} className="px-3 py-1.5 bg-white border border-zinc-200 text-sm font-medium rounded-md hover:bg-zinc-50 flex items-center gap-2">
          <span className="font-bold">T+</span> Thêm chữ
        </button>
        <button className="px-3 py-1.5 bg-white border border-zinc-200 text-sm font-medium rounded-md hover:bg-zinc-50 flex items-center gap-2 text-emerald-600">
          🖼️ Hình ảnh
        </button>

        <div className="flex items-center ml-2 bg-white border border-zinc-200 rounded-md">
          <button className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-l-md" title="Hoàn tác">
            <Undo className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-zinc-200" />
          <button className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-r-md" title="Làm lại">
            <Redo className="w-4 h-4" />
          </button>
        </div>

        <button onClick={() => selectedId && removeElement(selectedId)} className={`p-1.5 border rounded-md transition-colors ${selectedId ? 'bg-white border-red-200 text-red-500 hover:bg-red-50' : 'bg-white/50 border-zinc-200 text-zinc-300 cursor-not-allowed'}`} title="Xóa">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-8">
        <div 
          className="w-[400px] h-[400px] bg-white shadow-lg relative border border-zinc-200 transition-transform origin-center bg-center bg-contain bg-no-repeat"
          style={{ 
            transform: `scale(${zoom})`,
            backgroundImage: activeTemplateImage ? `url(${activeTemplateImage})` : 'none',
          }}
        >
          {!activeTemplateImage && elements.length === 0 && (
            <div className="absolute inset-8 border-2 border-dashed border-zinc-200 rounded flex flex-col items-center justify-center text-zinc-400 pointer-events-none">
              <span className="text-sm">Khu vực thiết kế</span>
            </div>
          )}

          {/* Render Elements */}
          {elements.map(el => (
            <div
              key={el.id}
              onPointerDown={(e) => handlePointerDown(e, el.id, el.x, el.y)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`absolute cursor-move select-none ${selectedId === el.id ? 'ring-2 ring-red-500 ring-offset-2' : 'hover:ring-1 hover:ring-zinc-300 hover:ring-offset-1'}`}
              style={{
                left: el.x,
                top: el.y,
                fontSize: el.fontSize,
                color: el.color,
                width: el.width,
                height: el.height,
                touchAction: 'none'
              }}
            >
              {el.type === 'accessory' && el.imageUrl ? (
                <img src={el.imageUrl} alt={el.content} className="w-full h-full object-contain pointer-events-none" />
              ) : (
                el.content
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
