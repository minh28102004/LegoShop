"use client";

import { useState, useMemo, useEffect } from 'react';
import { useStudio } from "./StudioContext";
import { formatPrice } from "@/lib/formatters";
import { Search, ShoppingCart, Zap, UploadCloud, Check, ChevronLeft, ChevronRight, Save, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { UI_MODAL_IDS } from "@/constants";
import { useAuthStore } from "@/stores/authStore";
import { fetchApi } from "@/lib/api";

const getFrameColorHex = (name: string, apiHex?: string | null): string => {
  if (apiHex && apiHex.startsWith('#')) return apiHex;
  const lower = name.trim().toLowerCase();
  if (lower === 'trắng' || lower === 'white') return '#ffffff';
  if (lower === 'đen' || lower === 'black') return '#1f1f21';
  if (lower === 'gỗ' || lower === 'wood') return '#d7a15c';
  return '#d1d5db';
};

// ─── Freeship Progress Bar ─────────────────────────────────────────────────
function FreeshipBar({ amount, progress }: { amount: number; progress: number }) {
  if (progress >= 100) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm animate-fade-in">
        <span className="text-lg">🎉</span> Bạn đã được Miễn phí vận chuyển!
      </div>
    );
  }
  return (
    <div className="space-y-2 rounded-xl border border-border bg-surface p-4 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary">
          Thêm <span className="font-bold text-text-primary">{formatPrice(amount)}</span> để Freeship
        </span>
        <span className="font-bold text-primary">{progress}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-hover shadow-inner">
        <div 
          className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-700 ease-out" 
          style={{ width: `${progress}%` }} 
        />
      </div>
    </div>
  );
}

export function StudioRightPanel() {
  const { step, setStep, totalPrice } = useStudio();

  const handleNext = () => setStep(Math.min(4, step + 1));
  const handleBack = () => setStep(Math.max(1, step - 1));

  return (
    <div className="z-20 flex w-[420px] shrink-0 flex-col border-l border-border bg-surface shadow-2xl">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        <div className="animate-fade-in">
          {step === 1 && <Step1Frame />}
          {step === 2 && <Step2Content />}
          {step === 3 && <Step3Characters />}
          {step === 4 && <Step4Finish />}
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-surface p-6 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        <div className="mb-4 flex items-center justify-between px-1">
          <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">Giá tạm tính:</span>
          <span className="text-2xl font-black text-primary drop-shadow-sm">{formatPrice(totalPrice)}</span>
        </div>
        
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button 
              type="button"
              onClick={handleBack}
              className="flex items-center justify-center gap-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-bold text-text-secondary shadow-sm transition-all hover:bg-surface-hover hover:text-text-primary"
            >
              <ChevronLeft className="h-4 w-4" /> Quay lại
            </button>
          )}
          
          {step < 4 && (
            <button 
              type="button"
              onClick={handleNext}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg active:translate-y-0"
            >
              Tiếp theo <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Chọn khung ────────────────────────────────────────────────────
function Step1Frame() {
  const { frameSize, setFrameSize, frameColor, setFrameColor, frameSizes, frameColors, isLoadingData } = useStudio();

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-surface-hover animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-xs font-bold tracking-widest text-text-muted uppercase font-body">Kích thước khung</h3>
        <div className="grid grid-cols-3 gap-3">
          {frameSizes.map(s => (
            <button 
              key={s.id} 
              type="button" 
              onClick={() => setFrameSize(s.id)}
              className={`group relative flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 transition-all duration-300 ${
                frameSize === s.id 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-border bg-surface hover:border-primary/30 hover:bg-surface-hover hover:shadow-sm'
              }`}
              style={{
                paddingTop: s.popular ? 32 : 16,
                paddingBottom: 16,
                paddingLeft: 8,
                paddingRight: 8,
              }}
            >
              {s.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-950 shadow-md">
                  Phổ biến nhất
                </span>
              )}
              <span className={`text-sm font-bold transition-colors ${frameSize === s.id ? 'text-primary' : 'text-text-primary'}`}>
                {s.label}
              </span>
              <span className="text-xs font-semibold text-text-muted">
                {formatPrice(s.price)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xs font-bold tracking-widest text-text-muted uppercase font-body">Màu sắc khung</h3>
        <div className="flex flex-wrap gap-3">
          {frameColors.map(c => (
            <button 
              key={c.id} 
              type="button" 
              onClick={() => setFrameColor(c.name)}
              className={`flex items-center gap-2.5 rounded-full border-2 px-4 py-2 text-sm transition-all duration-300 ${
                frameColor === c.name 
                  ? 'border-primary bg-primary/5 shadow-sm' 
                  : 'border-border bg-surface hover:border-primary/30 hover:bg-surface-hover'
              }`}
            >
              <span 
                className="h-4 w-4 shrink-0 rounded-full border border-zinc-200 shadow-inner" 
                style={{ backgroundColor: getFrameColorHex(c.name, c.colorHex) }} 
              />
              <span className={`font-bold text-xs ${frameColor === c.name ? 'text-primary' : 'text-text-secondary'}`}>
                {c.name}
              </span>
              {frameColor === c.name && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <p className="mb-4 flex items-center gap-2 text-xs font-black tracking-widest text-text-secondary uppercase">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Giá cơ bản bao gồm:
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {[
            { icon: "🖼️", label: "1 Khung tranh LEGO" },
            { icon: "🎨", label: "1 Nền thiết kế" },
            { icon: "👤", label: "1-2 Nhân vật" },
            { icon: "🎁", label: "Hộp quà tặng" },
            { icon: "👜", label: "Túi xách tay" },
            { icon: "💌", label: "Thiệp chúc mừng" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="text-base drop-shadow-sm">{item.icon}</span>
              <span className="text-xs font-medium text-text-secondary">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="rounded-xl border border-border bg-surface-hover px-4 py-3 text-xs leading-relaxed text-text-muted shadow-inner font-medium">
        * Đây là bản xem trước mô phỏng. Sau khi đặt hàng, Designer sẽ thiết kế lại bố cục & màu sắc đẹp nhất và gửi bạn duyệt trước khi in ấn.
      </p>
    </div>
  );
}

// ─── Step 2: Nội dung ──────────────────────────────────────────────────────
function Step2Content() {
  const { activeTemplate, setActiveTemplate, templates, templateCategories, printText, setPrintText, isLoadingData, freeshipAmount, freeshipProgress } = useStudio();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    if (!activeCategoryId) return templates;
    return templates.filter(t => t.categoryId === activeCategoryId);
  }, [templates, activeCategoryId]);

  return (
    <div className="space-y-6">
      <FreeshipBar amount={freeshipAmount} progress={freeshipProgress} />

      <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-background">
          <h3 className="text-sm font-bold text-text-primary">CHỌN ẢNH NỀN</h3>
          <span className="rounded-full bg-surface-hover px-2.5 py-0.5 text-xs font-bold text-text-muted">
            {filteredTemplates.length} mẫu
          </span>
        </div>
        
        <div className="flex gap-2 overflow-x-auto px-5 py-4 scrollbar-hide">
          <button 
            type="button" 
            onClick={() => setActiveCategoryId(null)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              !activeCategoryId 
                ? 'bg-text-primary text-background shadow-md' 
                : 'border border-border bg-surface text-text-secondary hover:border-text-muted hover:bg-surface-hover'
            }`}
          >
            TẤT CẢ
          </button>
          {templateCategories.map(cat => (
            <button 
              key={cat.id} 
              type="button" 
              onClick={() => setActiveCategoryId(cat.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                activeCategoryId === cat.id 
                  ? 'bg-text-primary text-background shadow-md' 
                  : 'border border-border bg-surface text-text-secondary hover:border-text-muted hover:bg-surface-hover'
              }`}
            >
              {cat.name.toUpperCase()}
            </button>
          ))}
        </div>
        
        <div className="grid max-h-[280px] grid-cols-4 gap-3 overflow-y-auto px-5 pb-5 scrollbar-hide">
          {isLoadingData ? Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-square rounded-xl bg-surface-hover animate-pulse" />) :
           filteredTemplates.length === 0 ? <div className="col-span-4 py-10 text-center text-sm font-medium text-text-muted">Chưa có mẫu nào</div> :
           filteredTemplates.map(tpl => (
            <button 
              key={tpl.id} 
              type="button" 
              onClick={() => setActiveTemplate(tpl.id)}
              className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                activeTemplate === tpl.id 
                  ? 'border-primary shadow-md scale-95 ring-4 ring-primary/20' 
                  : 'border-transparent bg-surface-hover hover:border-primary/40 hover:shadow-md'
              }`}
            >
              {tpl.imageUrl ? (
                <img src={tpl.imageUrl} alt={tpl.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface-hover p-2">
                  <span className="text-center text-[10px] font-medium leading-tight text-text-muted">{tpl.name}</span>
                </div>
              )}
              
              {activeTemplate === tpl.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[1px]">
                  <div className="rounded-full bg-primary p-1 shadow-lg">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
              
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-center pt-6">
                <span className="block truncate text-[9px] font-extrabold uppercase tracking-wider text-white drop-shadow-md">
                  {tpl.name}
                </span>
              </div>
            </button>
          ))}
        </div>
        
        <div className="border-t border-border bg-background p-4">
          <button type="button" className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface py-3 text-xs font-bold text-text-secondary transition-all hover:border-primary hover:bg-primary/5 hover:text-primary">
            <UploadCloud className="h-4 w-4 transition-transform group-hover:-translate-y-1" />
            TẢI ẢNH NỀN CỦA BẠN LÊN
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-primary">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">2</div>
            NHẬP THÔNG TIN IN ẤN
          </h3>
          <button 
            type="button" 
            className="text-xs font-bold text-text-muted transition-colors hover:text-error" 
            onClick={() => setPrintText({ title: '', date: '', message: '' })}
          >
            XÓA TẤT CẢ
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Tên / Lời tựa ngắn <span className="text-error">*</span>
            </label>
            <input 
              type="text" 
              placeholder="VD: Tú & Lan" 
              value={printText.title} 
              onChange={e => setPrintText({ ...printText, title: e.target.value })}
              className="w-full rounded-xl border border-border bg-background p-3 text-sm font-medium text-text-primary shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Ngày kỷ niệm (nếu có)
            </label>
            <input 
              type="date" 
              value={printText.date} 
              onChange={e => setPrintText({ ...printText, date: e.target.value })}
              className="w-full rounded-xl border border-border bg-background p-3 text-sm font-medium text-text-primary shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" 
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              Lời nhắn (nếu có)
            </label>
            <textarea 
              placeholder="VD: Chúc mừng sinh nhật..." 
              value={printText.message} 
              onChange={e => setPrintText({ ...printText, message: e.target.value })}
              rows={3} 
              className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm font-medium text-text-primary shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Nhân vật ──────────────────────────────────────────────────────
function Step3Characters() {
  const { characterCount, setCharacterCount, characterPrice, accessories, accessoryCategories, addElement, elements, removeElement, freeshipAmount, freeshipProgress, isLoadingData } = useStudio();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const filteredAccessories = useMemo(() => {
    let list = accessories;
    if (activeCategoryId) list = list.filter(a => a.categoryId === activeCategoryId);
    if (searchQuery.trim()) { const q = searchQuery.toLowerCase(); list = list.filter(a => a.name.toLowerCase().includes(q)); }
    return list;
  }, [accessories, activeCategoryId, searchQuery]);

  const addedAccessoryIds = new Set(elements.filter(e => e.accessoryId).map(e => e.accessoryId));

  return (
    <div className="space-y-6">
      <FreeshipBar amount={freeshipAmount} progress={freeshipProgress} />
      
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-text-primary uppercase">Quản lý nhân vật</h3>
        <div className="flex items-center gap-4">
          <button 
            type="button" 
            onClick={() => setCharacterCount(characterCount + 1)}
            className="flex items-center gap-2 rounded-xl bg-text-primary px-5 py-2.5 text-sm font-bold text-background shadow-md transition-all hover:-translate-y-0.5 hover:bg-text-secondary hover:shadow-lg active:translate-y-0"
          >
            <span>+</span> Thêm nhân vật
          </button>
          
          {characterCount > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-2 shadow-sm">
              <span className="text-sm font-black text-text-primary">{characterCount} NV</span>
              <div className="h-4 w-px bg-border" />
              <button 
                type="button" 
                onClick={() => setCharacterCount(Math.max(0, characterCount - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-hover text-lg font-bold text-text-secondary transition-colors hover:bg-error/10 hover:text-error"
              >
                −
              </button>
            </div>
          )}
        </div>
        {characterCount > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-surface-hover px-3 py-2 text-xs font-medium text-text-secondary">
            <span>{characterCount} nhân vật × {formatPrice(characterPrice)}</span>
            <span className="font-bold text-text-primary">{formatPrice(characterCount * characterPrice)}</span>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden flex flex-col">
        <div className="border-b border-border bg-background px-5 py-4">
          <h3 className="mb-4 text-sm font-bold text-text-primary uppercase">Thêm phụ kiện & Charm</h3>
          
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Tìm phụ kiện (hoa, xe, bóng bay...)" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm font-medium shadow-inner outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" 
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button 
              type="button" 
              onClick={() => setActiveCategoryId(null)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                !activeCategoryId 
                  ? 'bg-text-primary text-background shadow-md' 
                  : 'border border-border bg-surface text-text-secondary hover:border-text-muted hover:bg-surface-hover'
              }`}
            >
              TẤT CẢ
            </button>
            {accessoryCategories.map(cat => (
              <button 
                key={cat.id} 
                type="button" 
                onClick={() => setActiveCategoryId(cat.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  activeCategoryId === cat.id 
                    ? 'bg-text-primary text-background shadow-md' 
                    : 'border border-border bg-surface text-text-secondary hover:border-text-muted hover:bg-surface-hover'
                }`}
              >
                {cat.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid max-h-[340px] grid-cols-4 gap-3 overflow-y-auto bg-surface p-5 scrollbar-hide">
          {isLoadingData ? Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-square rounded-xl bg-surface-hover animate-pulse" />) :
           filteredAccessories.length === 0 ? <div className="col-span-4 py-10 text-center text-sm font-medium text-text-muted">Không tìm thấy phụ kiện phù hợp</div> :
           filteredAccessories.map(acc => {
            const isAdded = addedAccessoryIds.has(acc.id);
            return (
              <button 
                key={acc.id} 
                type="button" 
                onClick={() => {
                  if (isAdded) { const el = elements.find(e => e.accessoryId === acc.id); if (el) removeElement(el.id); }
                  else addElement({ type: 'accessory', x: 80 + Math.random() * 200, y: 80 + Math.random() * 200, imageUrl: acc.imageUrl || acc.iconUrl || '', content: acc.name, width: 60, height: 60, price: acc.price, accessoryId: acc.id });
                }}
                className={`group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl border-2 p-2 transition-all duration-300 ${
                  isAdded 
                    ? 'border-primary bg-primary/10 shadow-inner' 
                    : 'border-border bg-surface hover:border-primary/40 hover:bg-surface-hover hover:shadow-md'
                }`}
              >
                {acc.imageUrl || acc.iconUrl ? (
                  <img src={acc.imageUrl || acc.iconUrl || ''} alt={acc.name} className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-sm" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-surface-hover" />
                )}
                
                <span className="mt-2 w-full truncate px-1 text-center text-[10px] font-bold text-text-secondary">
                  {acc.name}
                </span>
                
                <span className="mt-0.5 text-[10px] font-black text-primary">
                  {formatPrice(acc.price)}
                </span>
                
                {isAdded && (
                  <div className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary shadow-sm">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Hoàn tất ──────────────────────────────────────────────────────
function Step4Finish() {
  const { totalPrice, freeshipAmount, frameSize, frameSizes, frameColor, characterCount, characterPrice, elements, printText, activeTemplate, templates } = useStudio();
  const router = useRouter();
  const addItem = useCartStore(state => state.addItem);
  const openModal = useUIStore(state => state.openModal);

  const [seconds, setSeconds] = useState(15 * 60);
  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(interval);
  }, []);
  
  const timerMins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const timerSecs = String(seconds % 60).padStart(2, '0');

  const frameObj = frameSizes.find(s => s.id === frameSize);
  const accessoryItems = elements.filter(e => e.type === 'accessory' && e.price && e.price > 0);
  const selectedTemplate = templates.find(t => t.id === activeTemplate);
  const accessorySnapshot = accessoryItems
    .filter(el => typeof el.accessoryId === 'string')
    .map(el => ({
      id: el.accessoryId as string,
      name: el.content || 'Accessory',
      price: el.price || 0,
    }));
  const charactersTotalPrice = characterCount * characterPrice;

  const buildCartItem = () => ({
    productId: null,
    productName: `Khung LEGO tùy chỉnh${printText.title ? ` - ${printText.title}` : ''}`,
    quantity: 1,
    unitPrice: totalPrice,
    frameSizeId: frameSize,
    frameSizeLabel: frameObj?.label ?? frameSize,
    frameColorName: frameColor,
    accessories: accessorySnapshot,
    templateId: activeTemplate,
    designData: {
      elements,
      printText,
      templateId: activeTemplate,
      templateName: selectedTemplate?.name,
      characterCount,
      accessories: accessorySnapshot,
    },
    previewUrl: selectedTemplate?.imageUrl ?? null,
  });

  const handleAddToCart = () => { addItem(buildCartItem()); openModal(UI_MODAL_IDS.CART_DRAWER); };
  const handleBuyNow = () => { addItem(buildCartItem()); router.push('/checkout'); };

  return (
    <div className="space-y-6">
      {seconds > 0 && (
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 p-4 text-white shadow-md animate-fade-in">
          <div>
            <div className="flex items-center gap-1.5 text-sm font-black tracking-wide"><Zap className="h-4 w-4 fill-white" /> ƯU ĐÃI PHÚT CHÓT!</div>
            <div className="mt-1 text-xs font-medium text-white/90">Hoàn tất thiết kế ngay để nhận 1 Sticker quà tặng</div>
          </div>
          <div className="rounded-xl bg-black/20 px-3 py-2 font-mono text-xl font-black tracking-widest backdrop-blur-sm shadow-inner">
            {timerMins}:{timerSecs}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-background px-5 py-4">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">Chi tiết thiết kế</h3>
          <span className="rounded-full bg-surface-hover px-2.5 py-1 text-xs font-bold text-text-secondary shadow-inner">
            {characterCount} NV
          </span>
        </div>
        
        <div className="divide-y divide-border">
          {frameObj && (
            <div className="flex items-start justify-between px-5 py-4 transition-colors hover:bg-surface-hover/50">
              <div>
                <p className="text-sm font-bold text-text-primary">{frameObj.label}</p>
                <p className="mt-0.5 text-xs font-medium text-text-muted">Màu {frameColor}</p>
              </div>
              <span className="text-sm font-bold text-text-primary">{formatPrice(frameObj.price)}</span>
            </div>
          )}
          
          {characterCount > 0 && (
            <div className="flex items-start justify-between px-5 py-4 transition-colors hover:bg-surface-hover/50">
              <div>
                <p className="text-sm font-bold text-text-primary">Nhân vật LEGO</p>
                <p className="mt-0.5 text-xs font-medium text-text-muted">{characterCount} × {formatPrice(characterPrice)}</p>
              </div>
              <span className="text-sm font-bold text-text-primary">{formatPrice(charactersTotalPrice)}</span>
            </div>
          )}
          
          {accessoryItems.map(el => (
            <div key={el.id} className="flex items-start justify-between px-5 py-4 transition-colors hover:bg-surface-hover/50">
              <div>
                <p className="text-sm font-bold text-text-primary">{el.content}</p>
                <p className="mt-0.5 text-xs font-medium text-text-muted">Số lượng: 1</p>
              </div>
              <span className="text-sm font-bold text-text-primary">{formatPrice(el.price || 0)}</span>
            </div>
          ))}
        </div>
        
        <div className="border-t-2 border-dashed border-border bg-background px-5 py-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black uppercase text-text-secondary tracking-widest">Tổng cộng</span>
            <span className="text-2xl font-black text-primary drop-shadow-sm">{formatPrice(totalPrice)}</span>
          </div>
          {freeshipAmount > 0 && (
            <p className="mt-2 text-right text-xs font-medium text-text-muted">
              Thêm <span className="font-bold text-text-primary">{formatPrice(freeshipAmount)}</span> để được <strong className="text-emerald-600">FREESHIP</strong>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-sm">
        <span className="text-xl">💡</span>
        <div>
          <p className="mb-1 text-xs font-black text-blue-700 uppercase tracking-wider">Mẹo: Đặt sớm (Early Bird)</p>
          <p className="text-xs font-medium leading-relaxed text-blue-600/90">
            Sản phẩm cần <strong>1-2 ngày</strong> hoàn thiện. Chọn ngày nhận <strong>sau 20 ngày</strong> để được giảm ngay <span className="font-bold text-blue-800">5%</span>!
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={handleBuyNow}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-text-primary px-4 py-4 text-sm font-bold text-background shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-text-secondary hover:shadow-xl active:translate-y-0"
        >
          <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
            <div className="relative h-full w-8 bg-white/20" />
          </div>
          <span>Thanh toán ngay</span> <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-border bg-surface px-4 py-3.5 text-sm font-bold text-text-primary shadow-sm transition-all hover:border-primary/50 hover:bg-surface-hover hover:text-primary"
          >
            <ShoppingCart className="h-4 w-4" /> Thêm vào giỏ
          </button>
          
          <button
            type="button"
            onClick={async () => {
              const user = useAuthStore.getState().user;
              if (!user) {
                alert("Vui lòng đăng nhập để lưu thiết kế!");
                router.push('/login');
                return;
              }
              try {
                await fetchApi('/user-designs', {
                  method: 'POST',
                  body: JSON.stringify({
                    name: `Thiết kế ${new Date().toLocaleDateString()}`,
                    designData: buildCartItem().designData
                  })
                });
                alert("Lưu thiết kế thành công!");
              } catch (err: any) {
                alert(err.message || "Lỗi khi lưu thiết kế");
              }
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-surface-hover px-4 py-3.5 text-sm font-bold text-text-secondary shadow-sm transition-all hover:bg-border hover:text-text-primary"
          >
            <Save className="h-4 w-4" /> Lưu bản nháp
          </button>
        </div>
      </div>
    </div>
  );
}
