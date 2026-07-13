import { BusinessInquiryForm } from "@/components/business/BusinessInquiryForm";

export default function BusinessPage() {
  return (
    <div className="flex flex-col flex-1 bg-white">
      {/* Header Section */}
      <section className="bg-zinc-950 text-white py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-black mb-6">Giải Pháp Quà Tặng Doanh Nghiệp</h1>
          <p className="text-lg text-zinc-400">
            Nâng tầm thương hiệu của bạn với các sản phẩm quà tặng cá nhân hóa cao cấp. 
            Thiết kế riêng biệt mang đậm dấu ấn doanh nghiệp.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            
            {/* Info */}
            <div className="space-y-10">
              <div>
                <h2 className="text-3xl font-bold mb-4">Tại sao chọn LegoShop?</h2>
                <p className="text-zinc-600 leading-relaxed">
                  Chúng tôi cung cấp giải pháp quà tặng toàn diện, từ khâu thiết kế đến sản xuất hàng loạt. 
                  Sản phẩm của LegoShop không chỉ là món quà, mà là một trải nghiệm sáng tạo tuyệt vời.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <h3 className="font-bold text-lg mb-2 text-red-600">Thiết kế độc bản</h3>
                  <p className="text-sm text-zinc-600">Đội ngũ thiết kế hỗ trợ tạo ra những mẫu khung ảnh mang đậm màu sắc thương hiệu.</p>
                </div>
                <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <h3 className="font-bold text-lg mb-2 text-red-600">Chiết khấu hấp dẫn</h3>
                  <p className="text-sm text-zinc-600">Chính sách giá đặc biệt ưu đãi cho đơn hàng số lượng lớn của doanh nghiệp.</p>
                </div>
                <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <h3 className="font-bold text-lg mb-2 text-red-600">Đóng gói cao cấp</h3>
                  <p className="text-sm text-zinc-600">Bao bì sang trọng, có thể in ấn logo công ty theo yêu cầu riêng.</p>
                </div>
                <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <h3 className="font-bold text-lg mb-2 text-red-600">Giao hàng đúng hẹn</h3>
                  <p className="text-sm text-zinc-600">Cam kết thời gian hoàn thành và chất lượng sản phẩm như đã thỏa thuận.</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="sticky top-24">
              <BusinessInquiryForm />
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
