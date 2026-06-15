"use client";

import { useState } from "react";
import { Building2, MessageSquare, Users, BadgePercent, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";

export default function BusinessPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "", contactName: "", email: "", phone: "", message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchApi("/business-inquiries", { method: "POST", body: JSON.stringify(formData) });
      setSuccess(true);
    } catch {
      alert("Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-border rounded-xl px-3.5 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-surface text-text-primary";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-surface border-b border-border py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-8">
            <Link href="/" className="hover:text-primary">Trang chủ</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-text-secondary font-semibold">Doanh nghiệp</span>
          </nav>
          <div className="max-w-2xl">
            <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em]">Dành cho Doanh nghiệp</span>
            <h1 className="text-4xl md:text-5xl font-black text-text-primary mt-3 mb-5 leading-tight">
              Quà Tặng Khách Hàng<br />& Đối Tác
            </h1>
            <p className="text-text-secondary text-lg font-light leading-relaxed">
              Khung LEGO thiết kế độc quyền là món quà hoàn hảo mang đậm dấu ấn cá nhân và văn hóa doanh nghiệp của bạn.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-16">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: Benefits */}
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: BadgePercent, color: "bg-primary/10 text-primary", title: "Chiết khấu số lượng lớn", desc: "Giá ưu đãi cho đơn từ 10 sản phẩm trở lên" },
                { icon: MessageSquare, color: "bg-blue-100 text-blue-600", title: "Thiết kế theo yêu cầu", desc: "Tùy biến logo, màu sắc thương hiệu riêng biệt" },
                { icon: Users, color: "bg-emerald-100 text-emerald-600", title: "Tư vấn tận tình", desc: "Đội ngũ hỗ trợ 24/7, phản hồi trong 2 giờ" },
                { icon: Building2, color: "bg-purple-100 text-purple-600", title: "Giao hàng đúng hẹn", desc: "Đảm bảo tiến độ cho sự kiện của bạn" },
              ].map(item => (
                <div key={item.title} className="bg-surface border border-border rounded-2xl p-5">
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-3`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-text-primary text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Clients */}
            <div className="bg-surface border border-border rounded-2xl p-6">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">Phù hợp cho</p>
              <div className="flex flex-wrap gap-2">
                {["Sự kiện công ty", "Quà tri ân nhân viên", "Tết & Lễ hội", "Team building", "Ra mắt sản phẩm", "Kỷ niệm thành lập", "Quà tặng đối tác"].map(t => (
                  <span key={t} className="px-3 py-1.5 bg-primary/8 text-primary text-xs font-semibold rounded-full">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-surface rounded-3xl border border-border p-8 shadow-sm">
            {success ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black text-text-primary mb-3">Đã Gửi Yêu Cầu!</h3>
                <p className="text-text-secondary mb-8 leading-relaxed">
                  Cảm ơn bạn đã quan tâm. Đội ngũ The Luvin sẽ liên hệ tư vấn trong thời gian sớm nhất (thường trong vòng 2 giờ làm việc).
                </p>
                <button onClick={() => { setSuccess(false); setFormData({ companyName: "", contactName: "", email: "", phone: "", message: "" }); }}
                  className="text-primary font-bold hover:underline">
                  Gửi yêu cầu khác
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-black text-text-primary mb-6">Liên Hệ Tư Vấn</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wide">Tên Công Ty / Tổ chức <span className="text-error">*</span></label>
                    <input required type="text" className={inputCls} value={formData.companyName} onChange={e => setFormData(p => ({ ...p, companyName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wide">Người liên hệ <span className="text-error">*</span></label>
                    <input required type="text" className={inputCls} value={formData.contactName} onChange={e => setFormData(p => ({ ...p, contactName: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wide">Email <span className="text-error">*</span></label>
                      <input required type="email" className={inputCls} value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wide">Số điện thoại <span className="text-error">*</span></label>
                      <input required type="tel" className={inputCls} value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wide">Nội dung yêu cầu</label>
                    <textarea rows={4} className={`${inputCls} resize-none`} placeholder="Số lượng dự kiến, ngày cần, yêu cầu đặc biệt..."
                      value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-4 bg-[hsl(var(--color-cta))] hover:bg-[hsl(var(--color-cta-hover))] text-white font-black rounded-2xl transition-colors disabled:opacity-60 shadow-sm text-sm">
                    {loading ? "Đang gửi..." : "Gửi Yêu Cầu →"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

