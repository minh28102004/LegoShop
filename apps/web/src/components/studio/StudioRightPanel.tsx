"use client";

import { useState, useMemo } from 'react';
import { useStudio, ApiFrameSize } from "./StudioContext";
import { formatCurrency } from "@/lib/utils";
import { Search, ChevronDown, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";

export function StudioRightPanel() {
  const { step, setStep, totalPrice, frameSize, setFrameSize, frameColor, setFrameColor, elements, activeTemplate } = useStudio();
  const { addItem } = useCart();
  const router = useRouter();

  const handleNext = () => setStep(Math.min(4, step + 1));
  const handleBack = () => setStep(Math.max(1, step - 1));

  const handleAddToCart = () => {
    addItem({
      productId: "custom-design-" + Date.now(),
      productName: `Khung LEGO tùy chỉnh`,
      price: totalPrice,
      quantity: 1,
      designData: { elements, activeTemplate, frameSize, frameColor }
    });
    // Open cart drawer? For now just go to cart page or trigger a global event, but I'll add cart drawer next phase.
    // I'll dispatch an event or just push to /cart if drawer is not ready.
    window.dispatchEvent(new CustomEvent('open-cart'));
  };

  return (
    <div className="w-[450px] bg-white border-l h-full flex flex-col z-20">
      <div className="flex-1 overflow-y-auto p-6">
        {step === 1 && <Step1Frame />}
        {step === 2 && <Step2Content />}
        {step === 3 && <Step3Characters />}
        {step === 4 && <Step4Finish />}
      </div>

      <div className="p-6 bg-white border-t shrink-0">
        <div className="flex items-center justify-end gap-2 mb-4">
          <span className="text-zinc-600 font-medium">Giá tạm tính:</span>
          <span className="text-xl font-bold text-red-500">{formatCurrency(totalPrice)}</span>
        </div>
        
        <div className="flex items-center gap-4">
          {step > 1 && (
            <button 
              onClick={handleBack}
              className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 text-zinc-600 font-medium hover:bg-zinc-50"
            >
              ← Quay lại
            </button>
          )}
          
          {step < 4 ? (
            <button 
              onClick={handleNext}
              className="flex-1 py-3 px-4 rounded-xl bg-red-300 text-white font-bold hover:bg-red-400 transition-colors"
            >
              Tiếp theo
            </button>
          ) : (
            <button 
              onClick={handleAddToCart}
              className="flex-1 py-3 px-4 rounded-xl bg-red-400 text-white font-bold hover:bg-red-500 transition-colors"
            >
              Tiếp theo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Step1Frame() {
  const { frameSize, setFrameSize, frameColor, setFrameColor, frameSizes, frameColors, isLoadingData } = useStudio();
  
  if (isLoadingData) {
    return <div className="p-8 text-center text-zinc-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-8 border rounded-xl p-6">
      <div>
        <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-800 mb-4">Chọn kích thước</h3>
        <div className="grid grid-cols-2 gap-3">
          {frameSizes.map(s => (
            <div 
              key={s.id}
              onClick={() => setFrameSize(s.id)}
              className={`relative p-4 rounded-xl border-2 cursor-pointer flex flex-col items-center justify-center text-center gap-1 transition-colors ${
                frameSize === s.id ? 'border-red-400 bg-red-50' : 'border-zinc-200 hover:border-red-200'
              }`}
            >
              {s.popular && <span className="absolute -top-3 bg-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded text-yellow-900">Phổ biến nhất</span>}
              <span className={`font-semibold ${frameSize === s.id ? 'text-red-600' : 'text-zinc-700'}`}>{s.label}</span>
              <span className="text-sm text-zinc-500">{formatCurrency(s.price)}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-800 mb-4">Màu khung</h3>
        <div className="flex gap-3">
          {frameColors.map(c => (
            <label key={c.id} className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer ${frameColor === c.name ? 'border-red-400 bg-red-50' : 'border-zinc-200'}`}>
              <input 
                type="radio" 
                name="color" 
                checked={frameColor === c.name} 
                onChange={() => setFrameColor(c.name)}
                className="text-red-500 focus:ring-red-500" 
              />
              {c.colorHex && (
                <span className="w-4 h-4 rounded-full border border-zinc-300" style={{ backgroundColor: c.colorHex }} />
              )}
              <span className="font-medium text-zinc-700">{c.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step2Content() {
  const { activeTemplate, setActiveTemplate, templates, templateCategories, isLoadingData } = useStudio();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    if (!activeCategoryId) return templates;
    return templates.filter(t => t.categoryId === activeCategoryId);
  }, [templates, activeCategoryId]);
  
  return (
    <div className="space-y-6">
      <div className="border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-800">Chọn ảnh nền</h3>
          <span className="text-xs text-zinc-500">{filteredTemplates.length} mẫu</span>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <button 
            onClick={() => setActiveCategoryId(null)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold ${!activeCategoryId ? 'bg-red-300 text-white' : 'bg-zinc-100 text-zinc-600'}`}
          >
            TẤT CẢ
          </button>
          {templateCategories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategoryId(cat.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold ${activeCategoryId === cat.id ? 'bg-red-300 text-white' : 'bg-zinc-100 text-zinc-600'}`}
            >
              {cat.name.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 h-64 overflow-y-auto">
          {isLoadingData ? (
            <div className="col-span-3 text-center text-sm text-zinc-500 py-8">Đang tải...</div>
          ) : filteredTemplates.length === 0 ? (
            <div className="col-span-3 text-center text-sm text-zinc-500 py-8">Chưa có mẫu nào</div>
          ) : (
            filteredTemplates.map(tpl => (
              <div 
                key={tpl.id} 
                onClick={() => setActiveTemplate(tpl.id)}
                className={`aspect-square rounded-xl border-2 cursor-pointer bg-zinc-50 flex flex-col items-center justify-center p-2 overflow-hidden relative group ${activeTemplate === tpl.id ? 'border-red-400' : 'border-zinc-200 hover:border-red-200'}`}
              >
                {tpl.imageUrl ? (
                  <img src={tpl.imageUrl} alt={tpl.name} className="w-full h-full object-cover rounded-lg absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-200 mb-2"></div>
                )}
                {/* Text overlay for name if we want, or just rely on image. Let's add a small label at the bottom */}
                <div className="absolute bottom-0 inset-x-0 bg-white/80 text-center py-1">
                  <span className="text-[10px] font-bold text-zinc-800 truncate w-full px-1">{tpl.name}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-blue-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            2. Nhập thông tin in ấn
          </h3>
          <button className="text-xs text-zinc-400 hover:text-zinc-600">XÓA TẤT CẢ</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-1">TÊN / LỜI TỰA NGẮN <span className="text-red-500">*</span></label>
            <input type="text" placeholder="VD: Tú & Lan" className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-red-400 focus:border-red-400 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-1">NGÀY KỶ NIỆM (NẾU CÓ)</label>
            <input type="date" className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-red-400 outline-none text-zinc-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-1">THÔNG ĐIỆP CỦA BẠN</label>
            <textarea placeholder="Nhập lời nhắn gửi..." rows={3} className="w-full border border-zinc-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-red-400 outline-none resize-none"></textarea>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3Characters() {
  const { addElement, accessories, accessoryCategories, isLoadingData } = useStudio();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAccessories = useMemo(() => {
    let result = accessories;
    if (activeCategoryId) {
      result = result.filter(a => a.categoryId === activeCategoryId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => a.name.toLowerCase().includes(q));
    }
    return result;
  }, [accessories, activeCategoryId, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="border rounded-xl p-6">
        <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-800 mb-4">Quản lý nhân vật</h3>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">
          + Thêm (10.000 đ)
        </button>
      </div>

      <div className="border rounded-xl p-6">
        <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-800 mb-4">Thêm phụ kiện & Charm</h3>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Tìm charm (hoa, túi, bóng bay...)" 
            className="w-full border border-zinc-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-1 focus:ring-red-400 outline-none" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide text-xs font-bold">
          <button 
            onClick={() => setActiveCategoryId(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full ${!activeCategoryId ? 'bg-zinc-800 text-white' : 'border border-zinc-200 text-zinc-600'}`}
          >
            Tất cả
          </button>
          {accessoryCategories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full ${activeCategoryId === cat.id ? 'bg-zinc-800 text-white' : 'border border-zinc-200 text-zinc-600'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {isLoadingData ? (
            <div className="col-span-3 text-center text-sm text-zinc-500 py-8">Đang tải...</div>
          ) : filteredAccessories.length === 0 ? (
            <div className="col-span-3 text-center text-sm text-zinc-500 py-8">Không tìm thấy phụ kiện</div>
          ) : (
            filteredAccessories.map((c) => (
              <div 
                key={c.id} 
                onClick={() => addElement({ 
                  type: 'accessory', 
                  content: c.name, 
                  imageUrl: c.imageUrl, 
                  accessoryId: c.id, 
                  price: c.price, 
                  x: 200, 
                  y: 200, 
                  width: 60, 
                  height: 60 
                })}
                className="border border-zinc-200 rounded-xl p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-red-400 group transition-colors bg-white relative"
              >
                {/* Use iconUrl if available, else imageUrl */}
                {c.iconUrl || c.imageUrl ? (
                  <img src={c.iconUrl || c.imageUrl} alt={c.name} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
                ) : (
                  <div className="w-10 h-10 bg-zinc-100 rounded-md"></div>
                )}
                <div className="text-center w-full">
                  <div className="text-[10px] font-bold text-zinc-700 truncate w-full px-1" title={c.name}>{c.name}</div>
                  <div className="text-[10px] text-red-500 font-medium">{formatCurrency(c.price)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Step4Finish() {
  const { frameSize, totalPrice } = useStudio();
  const { addItem } = useCart();
  const router = useRouter();

  const handleBuyNow = () => {
    // Add to cart and redirect to checkout
    addItem({
      productId: "custom-design-" + Date.now(),
      productName: `Khung LEGO tùy chỉnh`,
      price: totalPrice,
      quantity: 1,
    });
    router.push('/checkout');
  };

  return (
    <div className="space-y-6">
      <div className="bg-orange-300 rounded-xl p-4 flex items-center justify-between text-white">
        <div>
          <div className="font-bold flex items-center gap-2">🔥 ƯU ĐÃI PHÚT CHÓT!</div>
          <div className="text-sm">Hoàn tất đơn để nhận 1 Sticker quà tặng</div>
        </div>
        <div className="font-black text-xl">14:59</div>
      </div>

      <div className="border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-800">Chi tiết hóa đơn</h3>
          <span className="text-xs bg-zinc-100 px-2 py-1 rounded-md text-zinc-600 font-bold">0 NV</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div>
            <div className="font-bold text-zinc-800">{frameSize}</div>
            <div className="text-zinc-500 text-xs">Nhỏ gọn, tinh tế</div>
          </div>
          <div className="font-bold text-zinc-800">{formatCurrency(totalPrice)}</div>
        </div>

        <div className="border-t border-zinc-100 pt-4 flex justify-between items-center">
          <div className="font-bold text-zinc-800">Tạm tính</div>
          <div className="font-bold text-red-500 text-lg">{formatCurrency(totalPrice)}</div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-900">
        <div className="font-bold flex items-center gap-2 mb-1">📅 Mẹo: Đặt lịch sớm (Early Bird)</div>
        <p className="opacity-80">Sản phẩm thủ công cần 1-2 ngày hoàn thiện. Nếu chọn ngày nhận sau 20 ngày, giảm 5%!</p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-900">
        <div className="font-bold flex items-center gap-2 mb-1">🛡️ AN TÂM TUYỆT ĐỐI <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded">MIỄN PHÍ 100%</span></div>
        <p className="opacity-80 mt-2">Sau khi đặt hàng, Designer chuyên nghiệp sẽ check lại tỷ lệ. Gửi ảnh thực tế cho bạn duyệt trước khi gửi đi.</p>
      </div>

      <div className="flex gap-3">
        <button onClick={handleBuyNow} className="flex-1 bg-red-400 hover:bg-red-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
          ⚡ Mua ngay & Thanh toán
        </button>
        <button onClick={() => window.dispatchEvent(new CustomEvent('open-cart'))} className="flex-1 border border-zinc-200 hover:border-zinc-300 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-zinc-700">
          🛒 Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
