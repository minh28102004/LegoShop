import Link from 'next/link';
import { Globe, Camera, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-300 py-12 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-2xl font-black text-white mb-4">LEGO<span className="text-red-600">SHOP</span></h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Sáng tạo không giới hạn. Tự thiết kế và cá nhân hóa những sản phẩm độc đáo của riêng bạn.
          </p>
          <div className="flex gap-4 mt-6">
            <Link href="#" className="hover:text-white transition-colors"><Globe className="w-5 h-5" /></Link>
            <Link href="#" className="hover:text-white transition-colors"><Camera className="w-5 h-5" /></Link>
            <Link href="#" className="hover:text-white transition-colors"><MessageCircle className="w-5 h-5" /></Link>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Khám phá</h4>
          <ul className="space-y-3 text-sm">
            <li><Link href="/" className="hover:text-white transition-colors">Trang chủ</Link></li>
            <li><Link href="/collection" className="hover:text-white transition-colors">Bộ sưu tập</Link></li>
            <li><Link href="/studio" className="hover:text-white transition-colors">Studio Thiết Kế</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">Về chúng tôi</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Hỗ trợ khách hàng</h4>
          <ul className="space-y-3 text-sm">
            <li><Link href="/order-tracking" className="hover:text-white transition-colors">Tra cứu đơn hàng</Link></li>
            <li><Link href="/faq" className="hover:text-white transition-colors">Câu hỏi thường gặp</Link></li>
            <li><Link href="/shipping" className="hover:text-white transition-colors">Chính sách vận chuyển</Link></li>
            <li><Link href="/returns" className="hover:text-white transition-colors">Chính sách đổi trả</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Liên hệ</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 shrink-0 text-zinc-500" />
              <span>123 Đường Sáng Tạo, Quận 1, TP. HCM</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 shrink-0 text-zinc-500" />
              <span>1900 1234</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 shrink-0 text-zinc-500" />
              <span>support@legoshop.com</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-zinc-800 text-sm text-center text-zinc-500">
        <p>&copy; {new Date().getFullYear()} LegoShop. All rights reserved.</p>
      </div>
    </footer>
  );
}
