"use client";

import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { CreateBusinessInquiryRequestContract } from "@lego-shop/shared";

import { BUSINESS_BENEFITS, BUSINESS_USE_CASES } from "@/modules/business/data/business-page.data";
import { publicApiClient } from "@/lib/api/public-client";

export function BusinessPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<CreateBusinessInquiryRequestContract>(
    {
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      message: "",
    },
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await publicApiClient.inquiries.createBusinessInquiry(formData);
      setSuccess(true);
    } catch {
      alert("Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-surface py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <nav className="mb-8 flex items-center gap-1.5 text-xs text-text-muted">
            <Link href="/" className="hover:text-primary">
              Trang chủ
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-text-secondary">
              Doanh nghiệp
            </span>
          </nav>
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Dành cho Doanh nghiệp
            </span>
            <h1 className="mt-3 mb-5 text-4xl font-black leading-tight text-text-primary md:text-5xl">
              Quà Tặng Khách Hàng
              <br />& Đối Tác
            </h1>
            <p className="text-lg font-light leading-relaxed text-text-secondary">
              Khung LEGO thiết kế độc quyền là món quà hoàn hảo mang đậm dấu ấn
              cá nhân và văn hóa doanh nghiệp của bạn.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-16">
        <div className="grid items-start gap-12 md:grid-cols-2">
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
              {BUSINESS_BENEFITS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-surface p-5"
                >
                  <div
                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1 text-sm font-bold text-text-primary">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-text-secondary">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-text-secondary">
                Phù hợp cho
              </p>
              <div className="flex flex-wrap gap-2">
                {BUSINESS_USE_CASES.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-8 shadow-sm">
            {success ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-text-primary">
                  Đã Gửi Yêu Cầu!
                </h3>
                <p className="mb-8 leading-relaxed text-text-secondary">
                  Cảm ơn bạn đã quan tâm. Đội ngũ Figure Lab sẽ liên hệ tư vấn
                  trong thời gian sớm nhất.
                </p>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setFormData({
                      companyName: "",
                      contactName: "",
                      email: "",
                      phone: "",
                      message: "",
                    });
                  }}
                  className="font-bold text-primary hover:underline"
                >
                  Gửi yêu cầu khác
                </button>
              </div>
            ) : (
              <>
                <h3 className="mb-6 text-2xl font-black text-text-primary">
                  Liên Hệ Tư Vấn
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-text-secondary">
                      Tên Công Ty / Tổ chức <span className="text-error">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      className={inputCls}
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          companyName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-text-secondary">
                      Người liên hệ <span className="text-error">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      className={inputCls}
                      value={formData.contactName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          contactName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-text-secondary">
                        Email <span className="text-error">*</span>
                      </label>
                      <input
                        required
                        type="email"
                        className={inputCls}
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-text-secondary">
                        Số điện thoại <span className="text-error">*</span>
                      </label>
                      <input
                        required
                        type="tel"
                        className={inputCls}
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-text-secondary">
                      Nội dung yêu cầu
                    </label>
                    <textarea
                      rows={4}
                      className={`${inputCls} resize-none`}
                      placeholder="Số lượng dự kiến, ngày cần, yêu cầu đặc biệt..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-[hsl(var(--color-cta))] py-4 text-sm font-black text-white shadow-sm transition-colors hover:bg-[hsl(var(--color-cta-hover))] disabled:opacity-60"
                  >
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
