import { ProductCard, Product } from "@/components/product/ProductCard";
import { Filter, ChevronDown, PackageOpen } from "lucide-react";
import { fetchApi } from "@/lib/api";

export const revalidate = 0; // Disable cache for now

export default async function CollectionPage() {
  let products: Product[] = [];
  let error = null;

  try {
    const data = await fetchApi("/public/products");
    // API might return data in different shapes, let's assume it returns an array or { data: [] }
    products = Array.isArray(data) ? data : data?.data || [];
  } catch (err: any) {
    console.error("Failed to fetch products:", err);
    error = "Không thể tải danh sách sản phẩm lúc này. Vui lòng thử lại sau.";
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-zinc-950 mb-2">Bộ Sưu Tập</h1>
          <p className="text-zinc-500">Khám phá các sản phẩm có thể cá nhân hóa của chúng tôi</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button className="flex items-center justify-between gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors flex-1 md:w-48 text-sm">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-500" />
              <span>Lọc sản phẩm</span>
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          </button>
          
          <button className="flex items-center justify-between gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors flex-1 md:w-48 text-sm">
            <span>Sắp xếp: Mới nhất</span>
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>

      {error ? (
        <div className="text-center py-20 bg-red-50 text-red-600 rounded-2xl">
          <p>{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 text-zinc-500 rounded-2xl flex flex-col items-center">
          <PackageOpen className="w-12 h-12 mb-4 text-zinc-300" />
          <h3 className="text-lg font-bold text-zinc-700 mb-2">Chưa có sản phẩm nào</h3>
          <p>Hiện tại cửa hàng đang cập nhật sản phẩm. Bạn hãy quay lại sau nhé.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="mt-16 flex justify-center">
            <button className="px-8 py-3 border border-zinc-200 hover:border-zinc-400 text-zinc-700 font-medium rounded-full transition-colors">
              Tải thêm sản phẩm
            </button>
          </div>
        </>
      )}
    </div>
  );
}
