"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Search, X, Heart } from "lucide-react";
import { publicApiClient } from "@/lib/api/public-client";
import { formatPrice } from "@/lib/formatters";
import { ROUTES, UI_MODAL_IDS } from "@/constants";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { useDebounce } from "@/hooks/useDebounce";

type CollectionProduct = {
  id: string | number;
  name: string;
  category?: string;
  basePrice?: number;
  price?: string | number;
  images?: string[];
  img?: string;
  badge?: string | null;
  orders?: number;
};

const PRICE_FILTERS = ["Tất cả", "Dưới 200K", "200K–300K", "Trên 300K"];
const COMPLEXITY = ["Tất cả", "1 nhân vật", "2 nhân vật", "2+ nhân vật"];

const DEMO_PRODUCTS: CollectionProduct[] = [
  { id: 1, name: "Happy Birthday 1", category: "Anniversary", basePrice: 290000, images: ["https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop"], badge: "Bán chạy", orders: 123 },
  { id: 2, name: "Merry Christmas", category: "Holiday", basePrice: 360000, images: ["https://images.unsplash.com/photo-1543158181-e6f9f6712055?q=80&w=800&auto=format&fit=crop"], badge: null, orders: 37 },
  { id: 3, name: "Merry Christmas 2", category: "Holiday", basePrice: 338000, images: ["https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800&auto=format&fit=crop"], badge: null, orders: 46 },
  { id: 4, name: "Ronaldo", category: "Sport", basePrice: 305000, images: ["https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop"], badge: null, orders: 38 },
  { id: 5, name: "Gallery 1", category: "Gallery", basePrice: 320000, images: ["https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=800&auto=format&fit=crop"], badge: "Mới", orders: 6 },
  { id: 6, name: "Gallery 2", category: "Gallery", basePrice: 355000, images: ["https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop"], badge: null, orders: 3 },
  { id: 7, name: "Wedding Frame", category: "Wedding", basePrice: 415000, images: ["https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop"], badge: null, orders: 1 },
  { id: 8, name: "Family Portrait", category: "Family", basePrice: 338000, images: ["https://images.unsplash.com/photo-1602524816543-e0e78f2c3a5a?q=80&w=800&auto=format&fit=crop"], badge: null, orders: 11 },
];

const CATEGORY_TABS = ["Tất cả", "Anniversary", "Holiday", "Wedding", "Sport", "Gallery", "Family"];

export default function CollectionPage() {
  const [products, setProducts] = useState<CollectionProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [activePriceFilter, setActivePriceFilter] = useState("Tất cả");
  const [activeComplexity, setActiveComplexity] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 200);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodsRes = await publicApiClient.products.listProducts({ limit: 20 });
        setProducts(prodsRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const displayProducts = useMemo(
    () => (products.length > 0 ? products : DEMO_PRODUCTS),
    [products],
  );

  const filtered = useMemo(() => {
    const normalizedSearch = debouncedSearchQuery.trim().toLowerCase();

    return displayProducts.filter((p) => {
      if (normalizedSearch && !p.name.toLowerCase().includes(normalizedSearch)) return false;
      if (activeCategory !== "Tất cả" && p.category !== activeCategory) return false;
      return true;
    });
  }, [activeCategory, debouncedSearchQuery, displayProducts]);

  return (
    <div className="min-h-screen bg-background">

      {/* Page Header */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 max-w-7xl pt-10 pb-0">
          <p className="text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-3">Bộ sưu tập</p>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight mb-2">
            Bộ sưu tập{" "}
            <span className="italic text-primary">Luvin</span>
          </h1>
          <p className="text-sm text-text-secondary font-light max-w-lg mb-6">
            Tất cả mẫu có thể thay đổi tiêu đề, ảnh & thông tin theo ý muốn
          </p>

          {/* Search bar */}
          <div className="relative max-w-sm mb-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Tìm kiếm mẫu thiết kế..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-full pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-text-muted"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide mt-6">
            {CATEGORY_TABS.map((name) => {
              const isActive = activeCategory === name;
              return (
                <button
                  key={name}
                  onClick={() => setActiveCategory(name)}
                  className={`shrink-0 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter chips row */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 max-w-7xl py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-xs text-text-muted font-medium shrink-0">Ngân sách:</span>
            {PRICE_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActivePriceFilter(f)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  activePriceFilter === f
                    ? "bg-primary text-white border-primary"
                    : "border-border text-text-secondary hover:border-primary/50 hover:text-primary bg-white"
                }`}
              >
                {f}
              </button>
            ))}
            <span className="w-px h-4 bg-border mx-1 shrink-0" />
            <span className="text-xs text-text-muted font-medium shrink-0">Nhân vật:</span>
            {COMPLEXITY.map(f => (
              <button
                key={f}
                onClick={() => setActiveComplexity(f)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  activeComplexity === f
                    ? "bg-primary text-white border-primary"
                    : "border-border text-text-secondary hover:border-primary/50 hover:text-primary bg-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-7xl py-8">

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-text-muted">
            <span className="font-semibold text-text-primary">{filtered.length}</span> mẫu thiết kế
          </span>
          <div className="flex items-center gap-2 border border-border rounded-full px-4 py-2 text-xs font-medium text-text-secondary cursor-pointer hover:border-primary/50 transition-all bg-white">
            <span>Sắp xếp: Mặc định</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-border animate-pulse">
                <div className="aspect-square bg-[#F8F4F0]" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-[#F8F4F0] rounded-full w-3/4" />
                  <div className="h-3 bg-[#F8F4F0] rounded-full w-1/2" />
                  <div className="h-10 bg-[#F8F4F0] rounded-xl w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((product) => {
              const productImage = product.images?.[0] ?? product.img ?? null;
              const unitPrice =
                typeof product.basePrice === "number"
                  ? product.basePrice
                  : typeof product.price === "number"
                    ? product.price
                    : 0;

              return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden border border-border hover:shadow-[0_8px_32px_-4px_rgb(0_0_0/0.10)] transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="relative aspect-square bg-[#F8F4F0] overflow-hidden">
                  {productImage ? (
                    <Image
                      src={productImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🖼️</div>
                  )}

                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
                      {product.badge}
                    </span>
                  )}

                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-text-muted hover:text-primary transition-colors shadow-sm opacity-0 group-hover:opacity-100">
                    <Heart className="w-3.5 h-3.5" />
                  </button>

                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Link
                      href={ROUTES.creatorStudio}
                      className="bg-white text-text-primary text-xs font-semibold px-5 py-2.5 rounded-full shadow-md hover:bg-primary hover:text-white transition-colors transform translate-y-2 group-hover:translate-y-0 duration-300"
                    >
                      Tùy chỉnh mẫu này
                    </Link>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-text-primary text-sm mb-0.5 truncate">{product.name}</h3>
                  {product.orders && (
                    <p className="text-[11px] text-text-muted mb-2">{product.orders} lượt đặt hàng</p>
                  )}
                  <p className="text-base font-bold text-text-primary mb-3">
                    {product.basePrice ? formatPrice(product.basePrice) : product.price || "Liên hệ"}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Link
                      href={ROUTES.creatorStudio}
                      className="w-full flex items-center justify-center bg-surface border border-border text-text-secondary text-xs font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Tùy chỉnh
                    </Link>
                    <button
                      onClick={() => {
                        useCartStore.getState().addItem({
                          productId: String(product.id),
                          productName: product.name,
                          quantity: 1,
                          unitPrice,
                          frameSizeId: 'M',
                          frameSizeLabel: 'Khung vừa',
                          frameColorName: 'White',
                          designData: { elements: [] },
                          previewUrl: productImage,
                        });
                        useUIStore.getState().openModal(UI_MODAL_IDS.CART_DRAWER);
                      }}
                      className="w-full flex items-center justify-center bg-[hsl(var(--color-cta))] text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-[hsl(var(--color-cta-hover))] transition-colors"
                    >
                      Thêm giỏ hàng
                    </button>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-semibold text-text-primary mb-2">Không tìm thấy mẫu phù hợp</p>
            <p className="text-sm text-text-muted mb-6">Thử tìm kiếm với từ khóa khác</p>
            <button
              onClick={() => { setSearchQuery(""); setActiveCategory("Tất cả"); }}
              className="text-sm font-medium text-primary hover:underline"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
