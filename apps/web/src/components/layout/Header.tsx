"use client";

import Link from 'next/link';
import { ShoppingCart, Search, Menu, User } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { CartDrawer } from '../cart/CartDrawer';

export function Header() {
  const { items } = useCart();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleOpenCart = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-cart'));
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black text-black">LEGO<span className="text-red-600">SHOP</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 font-medium">
            <Link href="/" className="text-sm hover:text-red-600 transition-colors">Trang chủ</Link>
            <Link href="/collection" className="text-sm hover:text-red-600 transition-colors">Bộ sưu tập</Link>
            <Link href="/studio" className="text-sm hover:text-red-600 transition-colors">Studio Thiết Kế</Link>
            <Link href="/order-tracking" className="text-sm hover:text-red-600 transition-colors">Tra cứu đơn</Link>
            <Link href="/business" className="text-sm hover:text-red-600 transition-colors">Doanh nghiệp</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors hidden md:block">
              <Search className="w-5 h-5" />
            </button>
            <button onClick={handleOpenCart} className="p-2 hover:bg-zinc-100 rounded-full transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors hidden md:block">
              <User className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors md:hidden">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      <CartDrawer />
    </>
  );
}
