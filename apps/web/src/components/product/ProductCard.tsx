import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { resolveApiAssetUrl } from "@/lib/api/assets";

export interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  images: string[];
  description?: string;
  status: "active" | "inactive";
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group cursor-pointer flex flex-col">
      <Link href={`/studio?productId=${product.id}`}>
        <div className="relative aspect-[4/5] bg-zinc-100 rounded-2xl overflow-hidden mb-4">
          <Image
            src={
              resolveApiAssetUrl(product.images[0]) ||
              "https://images.unsplash.com/photo-1582562124811-c09040d0a901?q=80&w=600&auto=format&fit=crop"
            }
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
        </div>
      </Link>

      <Link href={`/studio?productId=${product.id}`} className="flex-1">
        <h3 className="font-bold text-lg mb-1 group-hover:text-red-600 transition-colors">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-zinc-500 text-sm mb-2 line-clamp-1">
            {product.description}
          </p>
        )}
      </Link>

      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="font-bold text-red-600">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(product.basePrice)}
        </span>
        <button
          className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors"
          title="Thêm vào giỏ hàng nhanh"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
