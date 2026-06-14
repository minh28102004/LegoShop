import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Palette, ShoppingBag } from "lucide-react";
import { ProductCard, Product } from "@/components/product/ProductCard";
import { fetchApi } from "@/lib/api";

export const revalidate = 0;

export default async function Home() {
  let featuredProducts: Product[] = [];
  
  try {
    const data = await fetchApi("/public/products");
    const products = Array.isArray(data) ? data : data?.data || [];
    featuredProducts = products.slice(0, 4);
  } catch (err) {
    console.error("Failed to fetch featured products:", err);
  }

  return (
    <div className="flex flex-col w-full">
      {/* Hero Banner */}
      <section className="relative h-[600px] w-full bg-zinc-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10" />
        <div className="absolute inset-0 opacity-50 mix-blend-overlay">
          <Image 
            src="https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=2000&auto=format&fit=crop" 
            alt="Hero Background" 
            fill 
            className="object-cover"
            priority
          />
        </div>
        
        <div className="container relative z-20 px-4 flex flex-col items-start gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-500 border border-red-500/30 text-sm font-medium backdrop-blur-md">
            <Sparkles className="w-4 h-4" />
            <span>Mới: Bộ sưu tập mùa hè 2026</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white max-w-2xl leading-tight">
            Tạo Nên Phiên Bản <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Độc Nhất</span> Của Bạn
          </h1>
          <p className="text-lg text-zinc-300 max-w-xl leading-relaxed">
            Nền tảng thiết kế sản phẩm cá nhân hóa hàng đầu. Biến ý tưởng của bạn thành hiện thực với công cụ Studio mạnh mẽ và thư viện phụ kiện đa dạng.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Link 
              href="/studio" 
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-all hover:scale-105 flex items-center gap-2 shadow-lg shadow-red-600/30"
            >
              <Palette className="w-5 h-5" />
              Thiết Kế Ngay
            </Link>
            <Link 
              href="/collection" 
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full transition-all backdrop-blur-md flex items-center gap-2"
            >
              Xem Sản Phẩm
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-white">
        <div className="container px-4 mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-black text-zinc-950 mb-4">Sản Phẩm Nổi Bật</h2>
              <p className="text-zinc-500">Những khung ảnh và phụ kiện được yêu thích nhất.</p>
            </div>
            <Link href="/collection" className="hidden md:flex items-center gap-2 font-medium text-red-600 hover:text-red-700">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-zinc-500">
                Chưa có sản phẩm nổi bật nào.
              </div>
            ) : (
              featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-zinc-50 border-t border-zinc-200">
        <div className="container px-4 mx-auto text-center max-w-4xl">
          <h2 className="text-3xl font-black mb-16">3 Bước Đơn Giản Để Sở Hữu</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-black text-2xl shadow-inner">1</div>
              <h3 className="font-bold text-xl">Chọn Khung & Kích Thước</h3>
              <p className="text-zinc-500">Lựa chọn khung ảnh phù hợp với không gian và sở thích của bạn từ bộ sưu tập đa dạng.</p>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-black text-2xl shadow-inner">2</div>
              <h3 className="font-bold text-xl">Thiết Kế Cá Nhân Hóa</h3>
              <p className="text-zinc-500">Thêm hình ảnh, tùy biến chữ viết và kéo thả các phụ kiện đáng yêu vào thiết kế của riêng bạn.</p>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-black text-2xl shadow-inner">3</div>
              <h3 className="font-bold text-xl">Đặt Hàng & Nhận Ưng Ý</h3>
              <p className="text-zinc-500">Thanh toán dễ dàng và nhận sản phẩm hoàn thiện sắc nét ngay tại nhà chỉ sau 3-5 ngày.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
