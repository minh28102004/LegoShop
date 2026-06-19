"use client";

import { useState, useMemo, useEffect } from 'react';
import { useStudio } from "./StudioContext";
import { formatPrice } from "@/lib/formatters";
import { Search, ShoppingCart, Zap, UploadCloud, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { UI_MODAL_IDS } from "@/constants";
import { useAuthStore } from "@/stores/authStore";
import { browserApiClient } from "@/lib/api/browser-client";
import type { JsonObject } from "@lego-shop/shared";

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
      <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-2">
        🎉 Bạn đã được Miễn phí vận chuyển!
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-text-secondary">Thêm <span className="font-bold text-text-primary">{formatPrice(amount)}</span> để Freeship</span>
        <span className="text-text-muted font-medium">{progress}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-border overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export function StudioRightPanel() {
  const { step, setStep, totalPrice } = useStudio();

  const handleNext = () => setStep(Math.min(4, step + 1));
  const handleBack = () => setStep(Math.max(1, step - 1));

  return (
    <div
      style={{
        width: 420,
        minWidth: 420,
        maxWidth: 420,
        background: "#fff",
        borderLeft: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        zIndex: 20,
        boxShadow: "-4px 0 16px rgba(0,0,0,0.04)",
        flexShrink: 0,
      }}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {step === 1 && <Step1Frame />}
        {step === 2 && <Step2Content />}
        {step === 3 && <Step3Characters />}
        {step === 4 && <Step4Finish />}
      </div>

      <div style={{ padding: 16, background: "#fff", borderTop: "1px solid #e5e7eb", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, padding: "0 4px" }}>
          <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>Giá tạm tính:</span>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#2563eb" }}>{formatPrice(totalPrice)}</span>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {step > 1 && (
            <button 
              type="button"
              onClick={handleBack}
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                color: "#6b7280",
                fontWeight: 700,
                fontSize: 13,
                background: "#fff",
                cursor: "pointer",
              }}
            >
              ← Quay lại
            </button>
          )}
          
          {step < 4 && (
            <button 
              type="button"
              onClick={handleNext}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: 12,
                background: "#2563eb",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                border: "none",
                cursor: "pointer",
              }}
            >
              Tiếp theo →
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
      <div className="space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-20 rounded-xl bg-border animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b7280", marginBottom: 12, fontFamily: "var(--font-body)" }}>CHỌN KÍCH THƯỚC</h3>
        <div className="grid grid-cols-3 gap-2">
          {frameSizes.map(s => (
            <button key={s.id} type="button" onClick={() => setFrameSize(s.id)}
              className={`relative rounded-xl border-2 cursor-pointer flex flex-col items-center text-center gap-0.5 transition-all ${
                frameSize === s.id ? 'border-primary bg-primary/8 shadow-sm' : 'border-border hover:border-primary/40 hover:bg-surface-hover'
              }`}
              style={{
                paddingTop: s.popular ? 28 : 14,
                paddingBottom: 14,
                paddingLeft: 8,
                paddingRight: 8,
              }}
            >
              {s.popular && (
                <span 
                  className="absolute bg-yellow-400 text-yellow-900 text-[9px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-xs"
                  style={{
                    top: -10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                  }}
                >
                  Phổ biến nhất
                </span>
              )}
              <span className={`font-bold text-sm ${frameSize === s.id ? 'text-primary' : 'text-text-primary'}`}>{s.label}</span>
              <span className="text-[11px] text-text-muted">{formatPrice(s.price)}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b7280", marginBottom: 12, fontFamily: "var(--font-body)" }}>MÀU KHUNG</h3>
        <div className="flex flex-wrap gap-2">
          {frameColors.map(c => (
            <button key={c.id} type="button" onClick={() => setFrameColor(c.name)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-sm transition-all ${
                frameColor === c.name ? 'border-primary bg-primary/8' : 'border-border hover:border-primary/30'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-full border border-zinc-300 shadow-sm shrink-0" style={{ backgroundColor: getFrameColorHex(c.name, c.colorHex) }} />
              <span className={`font-semibold text-xs ${frameColor === c.name ? 'text-primary' : 'text-text-secondary'}`}>{c.name}</span>
              {frameColor === c.name && <Check className="w-3 h-3 text-primary" />}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-4">
        <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          GIÁ CÓ BẢN BAO GỒM:
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {[
            { icon: "🖼️", label: "1 Khung tranh LEGO" },
            { icon: "🎨", label: "1 Nền thiết kế theo yêu cầu" },
            { icon: "👤", label: "1-2 Nhân vật LEGO" },
            { icon: "🎁", label: "Hộp quà" },
            { icon: "👜", label: "Túi" },
            { icon: "💌", label: "Thiệp" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className="text-sm">{item.icon}</span>
              <span className="text-[11px] text-text-secondary">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-text-muted bg-background rounded-lg px-3 py-2.5 border border-border leading-relaxed">
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
    <div className="space-y-5">
      <FreeshipBar amount={freeshipAmount} progress={freeshipProgress} />

      <div className="border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111827", fontFamily: "var(--font-body)", margin: 0 }}>CHỌN ẢNH NỀN</h3>
          <span className="text-xs text-text-muted">{filteredTemplates.length} mẫu</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto px-4 pb-3 scrollbar-hide">
          <button type="button" onClick={() => setActiveCategoryId(null)}
            className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${!activeCategoryId ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary hover:border-primary/50'}`}
          >TẤT CẢ</button>
          {templateCategories.map(cat => (
            <button key={cat.id} type="button" onClick={() => setActiveCategoryId(cat.id)}
              className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${activeCategoryId === cat.id ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary hover:border-primary/50'}`}
            >{cat.name.toUpperCase()}</button>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2 px-4 pb-4 max-h-52 overflow-y-auto">
          {isLoadingData ? Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-square rounded-lg bg-border animate-pulse" />) :
           filteredTemplates.length === 0 ? <div className="col-span-5 text-center text-xs text-text-muted py-8">Chưa có mẫu nào</div> :
           filteredTemplates.map(tpl => (
            <button key={tpl.id} type="button" onClick={() => setActiveTemplate(tpl.id)}
              className={`aspect-square rounded-lg border-2 overflow-hidden relative transition-all ${activeTemplate === tpl.id ? 'border-primary shadow-sm' : 'border-border hover:border-primary/40'}`}
            >
              {tpl.imageUrl ? <img src={tpl.imageUrl} alt={tpl.name} loading="lazy" className="w-full h-full object-cover" /> :
               <div className="w-full h-full bg-surface-hover flex items-center justify-center"><span className="text-[10px] text-text-muted text-center px-1 leading-tight">{tpl.name}</span></div>}
              {activeTemplate === tpl.id && <div className="absolute inset-0 bg-primary/20 flex items-center justify-center"><Check className="w-4 h-4 text-primary drop-shadow" /></div>}
              <div className="absolute bottom-0 inset-x-0 bg-black/50 text-center py-0.5">
                <span className="text-[8px] font-bold text-white truncate block px-0.5">{tpl.name.toUpperCase()}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="mx-4 mb-4">
          <button type="button" className="w-full py-2.5 border-2 border-dashed border-border rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-text-secondary hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all">
            <UploadCloud className="w-4 h-4" />
            TẢI ẢNH NỀN CỦA RIÊNG BẠN
          </button>
        </div>
      </div>

      <div className="border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#2563eb", fontFamily: "var(--font-body)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563eb", display: "inline-block" }} />
            2. NHẬP THÔNG TIN IN ẤN
          </h3>
          <button type="button" className="text-[11px] text-text-muted hover:text-error" onClick={() => setPrintText({ title: '', date: '', message: '' })}>XÓA TẤT CẢ</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-text-secondary mb-1">TÊN / LỜI TỰA NGẮN <span className="text-error">*</span></label>
            <input type="text" placeholder="VD: Tú & Lan" value={printText.title} onChange={e => setPrintText({ ...printText, title: e.target.value })}
              className="w-full border border-border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-surface" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-text-secondary mb-1">NGÀY KỶ NIỆM (NẾU CÓ)</label>
            <input type="date" value={printText.date} onChange={e => setPrintText({ ...printText, date: e.target.value })}
              className="w-full border border-border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-surface" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-text-secondary mb-1">LỜI NHẮN (NẾU CÓ)</label>
            <textarea placeholder="VD: Chúc mừng sinh nhật..." value={printText.message} onChange={e => setPrintText({ ...printText, message: e.target.value })}
              rows={2} className="w-full border border-border rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-surface resize-none" />
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
    <div className="space-y-4">
      <FreeshipBar amount={freeshipAmount} progress={freeshipProgress} />
      
      <div className="border border-border rounded-xl p-4">
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111827", fontFamily: "var(--font-body)", margin: "0 0 12px 0" }}>QUẢN LÝ NHÂN VẬT</h3>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setCharacterCount(characterCount + 1)}
            className="px-4 py-2 bg-[hsl(var(--color-cta))] text-white font-bold text-sm rounded-lg hover:bg-[hsl(var(--color-cta-hover))] transition-colors shadow-sm">
            + Thêm ({formatPrice(characterPrice)})
          </button>
          {characterCount > 0 && (
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setCharacterCount(Math.max(0, characterCount - 1))}
                className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:bg-error/10 hover:text-error transition-colors font-bold">−</button>
              <span className="font-bold text-sm text-text-primary">{characterCount} NV</span>
            </div>
          )}
        </div>
        {characterCount > 0 && (
          <p className="text-[11px] text-text-muted mt-2">
            {characterCount} nhân vật × {formatPrice(characterPrice)} = <strong className="text-text-primary">{formatPrice(characterCount * characterPrice)}</strong>
          </p>
        )}
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <div className="px-4 pt-4 pb-3">
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111827", fontFamily: "var(--font-body)", margin: "0 0 12px 0" }}>THÊM PHỤ KIỆN & CHARM</h3>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input type="text" placeholder="Tìm charm (hoa, túi, bóng bay...)" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-border rounded-lg text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-surface" />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            <button type="button" onClick={() => setActiveCategoryId(null)}
              className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${!activeCategoryId ? 'bg-[hsl(var(--color-cta))] text-white' : 'bg-surface border border-border text-text-secondary'}`}>Tất cả</button>
            {accessoryCategories.map(cat => (
              <button key={cat.id} type="button" onClick={() => setActiveCategoryId(cat.id)}
                className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${activeCategoryId === cat.id ? 'bg-[hsl(var(--color-cta))] text-white' : 'bg-surface border border-border text-text-secondary hover:border-primary/40'}`}>{cat.name}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2 px-4 pb-4 max-h-64 overflow-y-auto">
          {isLoadingData ? Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-square rounded-xl bg-border animate-pulse" />) :
           filteredAccessories.length === 0 ? <div className="col-span-5 text-center text-xs text-text-muted py-8">Không có phụ kiện</div> :
           filteredAccessories.map(acc => {
            const isAdded = addedAccessoryIds.has(acc.id);
            return (
              <button key={acc.id} type="button" onClick={() => {
                if (isAdded) { const el = elements.find(e => e.accessoryId === acc.id); if (el) removeElement(el.id); }
                else addElement({ type: 'accessory', x: 80 + Math.random() * 200, y: 80 + Math.random() * 200, imageUrl: acc.imageUrl || acc.iconUrl || '', content: acc.name, width: 60, height: 60, price: acc.price, accessoryId: acc.id });
              }}
                className={`relative aspect-square rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center p-1 transition-all ${isAdded ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 bg-surface'}`}
              >
                {acc.imageUrl || acc.iconUrl ? <img src={acc.imageUrl || acc.iconUrl || ''} alt={acc.name} loading="lazy" className="w-9 h-9 object-contain" /> : <div className="w-9 h-9 bg-border rounded-lg" />}
                <span className="text-[9px] font-medium text-text-secondary mt-0.5 text-center leading-tight line-clamp-1 w-full px-0.5">{acc.name}</span>
                <span className="text-[9px] font-bold text-primary">{formatPrice(acc.price)}</span>
                {isAdded && <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center"><Check className="w-2 h-2 text-white" /></div>}
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
  const { totalPrice, freeshipAmount, frameSize, frameSizes, frameColor, characterCount, characterPrice, elements, printText, activeTemplate } = useStudio();
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
  const charactersTotalPrice = characterCount * characterPrice;

  const buildCartItem = () => ({
    productId: null,
    productName: `Khung LEGO tùy chỉnh${printText.title ? ` - ${printText.title}` : ''}`,
    quantity: 1,
    unitPrice: totalPrice,
    frameSizeId: frameSize,
    frameSizeLabel: frameObj?.label ?? frameSize,
    frameColorName: frameColor,
    designData: { elements, printText, templateId: activeTemplate, characterCount },
    previewUrl: null,
  });

  const buildUserDesignData = (): JsonObject => ({
    elements: elements.map((element): JsonObject => ({
      id: element.id,
      type: element.type,
      x: element.x,
      y: element.y,
      ...(element.content !== undefined ? { content: element.content } : {}),
      ...(element.imageUrl !== undefined ? { imageUrl: element.imageUrl } : {}),
      ...(element.fontSize !== undefined ? { fontSize: element.fontSize } : {}),
      ...(element.color !== undefined ? { color: element.color } : {}),
      ...(element.width !== undefined ? { width: element.width } : {}),
      ...(element.height !== undefined ? { height: element.height } : {}),
      ...(element.price !== undefined ? { price: element.price } : {}),
      ...(element.accessoryId !== undefined ? { accessoryId: element.accessoryId } : {}),
    })),
    printText: {
      title: printText.title,
      date: printText.date,
      message: printText.message,
    },
    templateId: activeTemplate,
    characterCount,
  });

  const handleAddToCart = () => { addItem(buildCartItem()); openModal(UI_MODAL_IDS.CART_DRAWER); };
  const handleBuyNow = () => { addItem(buildCartItem()); router.push('/checkout'); };

  return (
    <div className="space-y-4">
      {seconds > 0 && (
        <div className="bg-gradient-to-r from-orange-400 to-amber-400 rounded-xl p-3 flex items-center justify-between text-white">
          <div>
            <div className="font-bold text-sm flex items-center gap-1.5"><Zap className="w-4 h-4" /> ƯU ĐÃI PHÚT CHÓT!</div>
            <div className="text-xs opacity-90 mt-0.5">Hoàn tất đơn để nhận 1 Sticker quà tặng</div>
          </div>
          <div className="bg-white/20 rounded-lg px-3 py-1.5 font-mono font-black text-xl">{timerMins}:{timerSecs}</div>
        </div>
      )}

      <div className="border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-surface">
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#111827", fontFamily: "var(--font-body)", margin: 0 }}>CHI TIẾT HÓA ĐƠN</h3>
          <span className="text-xs text-text-muted font-medium">{characterCount} NV</span>
        </div>
        <div className="divide-y divide-border">
          {frameObj && (
            <div className="flex justify-between items-start px-4 py-3">
              <div><p className="text-sm font-semibold text-text-primary">{frameObj.label}</p><p className="text-xs text-text-muted">Nhỏ gọn, tinh tế</p></div>
              <span className="text-sm font-bold text-text-primary">{formatPrice(frameObj.price)}</span>
            </div>
          )}
          {characterCount > 0 && (
            <div className="flex justify-between items-start px-4 py-3">
              <div><p className="text-sm font-semibold text-text-primary">Nhân vật LEGO</p><p className="text-xs text-text-muted">{characterCount} × {formatPrice(characterPrice)}</p></div>
              <span className="text-sm font-bold text-text-primary">{formatPrice(charactersTotalPrice)}</span>
            </div>
          )}
          {accessoryItems.map(el => (
            <div key={el.id} className="flex justify-between items-start px-4 py-3">
              <div><p className="text-sm font-semibold text-text-primary">{el.content}</p><p className="text-xs text-text-muted">Sl: 1</p></div>
              <span className="text-sm font-bold text-text-primary">{formatPrice(el.price || 0)}</span>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 bg-background border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-text-secondary">Tạm tính</span>
            <span className="text-lg font-black" style={{ color: "#2563eb" }}>{formatPrice(totalPrice)}</span>
          </div>
          {freeshipAmount > 0 && (
            <p className="text-[11px] text-text-muted mt-1">Mua thêm <span className="font-bold text-text-primary">{formatPrice(freeshipAmount)}</span> để được <strong>FREESHIP</strong></p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <span className="text-lg">📅</span>
          <div>
            <p className="text-xs font-bold text-blue-700 mb-1">Mẹo: Đặt Lịch Sớm (Early Bird)</p>
            <p className="text-[11px] text-blue-600 leading-relaxed">Sản phẩm thủ công cần <strong>1-2 ngày hoàn thiện</strong> và 2-4 ngày vận chuyển. Nếu bạn có kế hoạch tặng quà xa, hãy chọn ngày nhận <strong>sau 20 ngày</strong> để được <span className="font-bold text-blue-800">Giảm ngay 5%!</span></p>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-black text-emerald-700">🛡 AN TÂM TUYỆT ĐỐI</p>
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">MIỄN PHÍ 100%</span>
        </div>
        <p className="text-[11px] text-emerald-600 leading-relaxed">Sau khi đặt hàng, <strong className="text-emerald-700">Designer chuyên nghiệp</strong> sẽ trực tiếp căn chỉnh lại bố cục, font chữ đẹp nhất và <strong>gửi ảnh thực tế</strong> cho bạn duyệt trước khi gửi đi.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleBuyNow}
          className="py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-1.5"
          style={{
            backgroundColor: "#2563eb",
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
          }}
        >
          🔥 Mua ngay & Thanh toán
        </button>
        <button
          type="button"
          onClick={handleAddToCart}
          className="py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5"
          style={{
            backgroundColor: "transparent",
            color: "#2563eb",
            border: "2px solid #2563eb",
            cursor: "pointer",
          }}
        >
          <ShoppingCart className="w-4 h-4" /> Thêm vào giỏ
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
              await browserApiClient.userDesigns.createUserDesign({
                name: `Thiết kế ${new Date().toLocaleDateString()}`,
                designData: buildUserDesignData(),
              });
              alert("Lưu thiết kế thành công!");
            } catch (err) {
              alert(err instanceof Error ? err.message : "Lỗi khi lưu thiết kế");
            }
          }}
          className="col-span-2 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 bg-surface border border-border text-text-secondary hover:bg-gray-50"
        >
          💾 Lưu bản nháp thiết kế
        </button>
      </div>
    </div>
  );
}
