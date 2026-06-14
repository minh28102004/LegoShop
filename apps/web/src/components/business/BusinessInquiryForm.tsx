"use client";

import { useState } from "react";
import { Building2, User, Mail, Phone, MessageSquare, Send } from "lucide-react";
import { fetchApi } from "@/lib/api";

export function BusinessInquiryForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await fetchApi("/business-inquiries", {
        method: "POST",
        body: JSON.stringify(formData)
      });
      setSuccess(true);
      setFormData({ companyName: "", contactName: "", email: "", phone: "", message: "" });
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Có lỗi xảy ra, vui lòng thử lại!");
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="bg-green-50 text-green-800 p-8 rounded-2xl border border-green-200 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Gửi Yêu Cầu Thành Công!</h3>
        <p className="text-green-700">
          Cảm ơn bạn đã quan tâm. Đội ngũ của chúng tôi sẽ liên hệ lại với bạn trong vòng 24h làm việc.
        </p>
        <button 
          onClick={() => setSuccess(false)}
          className="mt-6 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-full transition-colors"
        >
          Gửi yêu cầu khác
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Đăng Ký Tư Vấn</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Tên công ty</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 className="h-5 w-5 text-zinc-400" />
            </div>
            <input 
              type="text" 
              required
              value={formData.companyName}
              onChange={e => setFormData({...formData, companyName: e.target.value})}
              className="block w-full pl-10 pr-3 py-2.5 border border-zinc-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-sm" 
              placeholder="Công ty TNHH ABC"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Người liên hệ</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-zinc-400" />
            </div>
            <input 
              type="text" 
              required
              value={formData.contactName}
              onChange={e => setFormData({...formData, contactName: e.target.value})}
              className="block w-full pl-10 pr-3 py-2.5 border border-zinc-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-sm" 
              placeholder="Họ và tên"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-zinc-400" />
              </div>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="block w-full pl-10 pr-3 py-2.5 border border-zinc-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-sm" 
                placeholder="email@congty.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Số điện thoại</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-zinc-400" />
              </div>
              <input 
                type="tel" 
                required
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="block w-full pl-10 pr-3 py-2.5 border border-zinc-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-sm" 
                placeholder="0909 123 456"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Nội dung yêu cầu</label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <MessageSquare className="h-5 w-5 text-zinc-400" />
            </div>
            <textarea 
              required
              rows={4}
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
              className="block w-full pl-10 pr-3 py-2.5 border border-zinc-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-sm" 
              placeholder="Mô tả số lượng, yêu cầu cá nhân hóa, thời gian cần hàng..."
            />
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="mt-6 w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          "Đang gửi..."
        ) : (
          <>
            <Send className="w-4 h-4" /> Gửi Yêu Cầu
          </>
        )}
      </button>
    </form>
  );
}
