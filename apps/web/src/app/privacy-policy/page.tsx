import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { ROUTES } from "@/config/routes";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Chính sách bảo mật",
  description:
    "Chính sách bảo mật của Figure Lab về cách thu thập, sử dụng và bảo vệ thông tin khách hàng.",
};

const sections = [
  {
    id: "thong-tin-thu-thap",
    title: "1. Thông tin chúng tôi thu thập",
    paragraphs: [
      "Khi bạn sử dụng Figure Lab, chúng tôi có thể nhận thông tin liên hệ và giao hàng như họ tên, số điện thoại, email, địa chỉ, thông tin đơn hàng và nội dung bạn chủ động gửi trong quá trình thiết kế sản phẩm.",
      "Website cũng có thể lưu dữ liệu kỹ thuật cần thiết cho phiên làm việc, giỏ hàng và tùy chọn hiển thị trên thiết bị của bạn.",
    ],
  },
  {
    id: "muc-dich-su-dung",
    title: "2. Mục đích sử dụng thông tin",
    paragraphs: [
      "Thông tin được sử dụng để tạo và xử lý đơn hàng, xác nhận thiết kế, hỗ trợ giao hàng, thanh toán, chăm sóc khách hàng, phòng chống gian lận và cải thiện chất lượng dịch vụ.",
      "Figure Lab không bán thông tin cá nhân của khách hàng cho bên thứ ba.",
    ],
  },
  {
    id: "don-vi-cung-cap-dich-vu",
    title: "3. Chia sẻ với đơn vị cung cấp dịch vụ",
    paragraphs: [
      "Trong phạm vi cần thiết để vận hành dịch vụ, dữ liệu có thể được xử lý bởi các đối tác hạ tầng, lưu trữ, thanh toán hoặc giao nhận. Các đối tác này chỉ nhận thông tin cần thiết để thực hiện phần việc tương ứng.",
      "Giao dịch thanh toán trực tuyến được chuyển đến cổng thanh toán được hiển thị tại bước thanh toán; Figure Lab không lưu toàn bộ thông tin thẻ ngân hàng của bạn.",
    ],
  },
  {
    id: "hinh-anh-thiet-ke",
    title: "4. Hình ảnh và nội dung thiết kế",
    paragraphs: [
      "Hình ảnh bạn tải lên được dùng để tạo bản xem trước, hoàn thiện sản phẩm và hỗ trợ đơn hàng. Bạn cần bảo đảm mình có quyền sử dụng nội dung đã cung cấp.",
      "Không tải lên giấy tờ định danh, thông tin tài chính, mật khẩu hoặc nội dung nhạy cảm không cần thiết cho thiết kế.",
    ],
  },
  {
    id: "luu-tru-bao-ve",
    title: "5. Lưu trữ và bảo vệ dữ liệu",
    paragraphs: [
      "Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức phù hợp để hạn chế truy cập trái phép, thất thoát hoặc sử dụng sai mục đích. Dữ liệu được lưu trong thời gian cần thiết để xử lý đơn hàng, hỗ trợ khách hàng và đáp ứng nghĩa vụ pháp lý liên quan.",
    ],
  },
  {
    id: "quyen-cua-ban",
    title: "6. Quyền của bạn",
    paragraphs: [
      "Bạn có thể yêu cầu xem, cập nhật hoặc đề nghị xóa thông tin cá nhân do mình cung cấp, trong giới hạn pháp luật và nghĩa vụ lưu trữ đơn hàng cho phép.",
      `Để gửi yêu cầu, vui lòng liên hệ ${SITE.email}. Chúng tôi có thể cần xác minh danh tính trước khi xử lý yêu cầu.`,
    ],
  },
  {
    id: "thay-doi-chinh-sach",
    title: "7. Thay đổi chính sách",
    paragraphs: [
      "Chính sách có thể được cập nhật khi sản phẩm, quy trình vận hành hoặc yêu cầu pháp lý thay đổi. Phiên bản mới sẽ được công bố tại trang này cùng ngày cập nhật.",
    ],
  },
] as const;

export default function PrivacyPolicyPage() {
  return (
    <section className="bg-[#f5f9fc] py-12 sm:py-16 lg:py-20">
      <Container size="narrow">
        <div className="overflow-hidden rounded-[28px] border border-[#dbe8f1] bg-white shadow-[0_24px_70px_-45px_rgba(16,37,63,0.32)]">
          <header className="border-b border-[#dbe8f1] bg-gradient-to-br from-[#eef8fd] via-white to-[#fff9df] px-6 py-10 sm:px-10 sm:py-12">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#2488c7]">
              Figure Lab
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#10253f] sm:text-4xl">
              Chính sách bảo mật
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Chính sách này giải thích cách Figure Lab tiếp nhận, sử dụng và
              bảo vệ thông tin khi bạn truy cập website hoặc đặt sản phẩm.
            </p>
            <p className="mt-4 text-xs font-semibold text-slate-500">
              Cập nhật lần cuối: 24/07/2026
            </p>
          </header>

          <div className="space-y-9 px-6 py-10 sm:px-10 sm:py-12">
            {sections.map((section) => (
              <section key={section.id} aria-labelledby={section.id}>
                <h2
                  id={section.id}
                  className="text-xl font-bold tracking-tight text-[#10253f]"
                >
                  {section.title}
                </h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}

            <div className="rounded-2xl border border-[#cfe5f3] bg-[#eef8fd] p-5 text-sm leading-7 text-slate-700">
              <p className="font-bold text-[#10253f]">Liên hệ về quyền riêng tư</p>
              <a
                href={`mailto:${SITE.email}`}
                className="mt-1 inline-flex font-semibold text-[#197fc0] underline decoration-[#8fc9e9] underline-offset-4"
              >
                {SITE.email}
              </a>
            </div>

            <Link
              href={ROUTES.home}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#2488c7] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1976ae] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9def3]"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
