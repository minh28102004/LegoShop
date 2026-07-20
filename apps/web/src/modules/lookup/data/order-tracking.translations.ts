import type { Locale } from "@/lib/i18n/config";

export const ORDER_TRACKING_COPY = {
  vi: {
    hero: {
      eyebrow: "Tra cứu đơn hàng",
      title: "Theo dõi hành trình món quà của bạn",
      description:
        "Từ lúc tiếp nhận câu chuyện đến khi món quà được giao tận tay, mọi cập nhật quan trọng đều có ở đây.",
      trust: [
        "Cập nhật rõ ràng",
        "Bảo mật bằng số điện thoại",
        "Hỗ trợ khi bạn cần",
      ],
      visualCode: "FL-2026-0719",
      visualStatus: "Đang hoàn thiện món quà",
      visualHint: "Dự kiến giao trong 2–3 ngày",
    },
    lookup: {
      eyebrow: "Kiểm tra trong vài giây",
      title: "Món quà của bạn đang ở đâu?",
      description: "Nhập đúng mã đơn và số điện thoại đã dùng khi đặt hàng.",
      orderCodeLabel: "Mã đơn hàng",
      orderCodePlaceholder: "Ví dụ: LS202607190001",
      phoneLabel: "Số điện thoại",
      phonePlaceholder: "Ví dụ: 0901 234 567",
      submit: "Tra cứu đơn hàng",
      submitting: "Đang tra cứu...",
      codeHint: "Mã đơn có trong email hoặc tin nhắn xác nhận.",
      phoneHint: "Dùng số điện thoại đã đặt hàng để bảo vệ thông tin đơn.",
      forgotCode: "Không nhớ mã đơn?",
      needSupport: "Cần hỗ trợ?",
      requiredError: "Vui lòng nhập đầy đủ mã đơn hàng và số điện thoại.",
      phoneError: "Số điện thoại cần có ít nhất 8 chữ số.",
      notFoundError: "Không tìm thấy đơn hàng khớp với thông tin bạn cung cấp.",
      networkError: "Chưa thể kết nối hệ thống. Vui lòng thử lại sau ít phút.",
      success: "Đã tìm thấy đơn hàng. Đang đưa bạn đến phần kết quả.",
    },
    guide: {
      eyebrow: "Tra cứu thật đơn giản",
      title: "Ba bước để theo dõi món quà",
      description: "Không cần đăng nhập, chỉ cần thông tin xác nhận đơn.",
      items: [
        {
          title: "Nhập thông tin",
          description: "Điền mã đơn và số điện thoại đã dùng khi đặt hàng.",
        },
        {
          title: "Xem trạng thái",
          description:
            "Biết món quà đang ở bước thiết kế, sản xuất hay giao hàng.",
        },
        {
          title: "Theo dõi tiếp theo",
          description: "Xem mốc dự kiến và cập nhật mới nhất của đơn.",
        },
      ],
    },
    statuses: {
      eyebrow: "Hành trình minh bạch",
      title: "Mỗi món quà đi qua những bước nào?",
      description:
        "Tiến độ thực tế có thể thay đổi đôi chút tùy mức độ cá nhân hóa của thiết kế.",
      items: [
        {
          key: "received",
          title: "Đã tiếp nhận",
          description: "Hệ thống đã ghi nhận đơn hàng.",
        },
        {
          key: "confirming",
          title: "Đang xác nhận",
          description: "Figure Lab kiểm tra thông tin.",
        },
        {
          key: "design",
          title: "Thiết kế & duyệt mẫu",
          description: "Tạo và gửi bản xem trước.",
        },
        {
          key: "production",
          title: "Đang sản xuất",
          description: "Hiện thực hóa thiết kế đã duyệt.",
        },
        {
          key: "packing",
          title: "Đang đóng gói",
          description: "Kiểm tra và hoàn thiện gói quà.",
        },
        {
          key: "shipping",
          title: "Đang giao hàng",
          description: "Món quà đang trên đường đến bạn.",
        },
        {
          key: "complete",
          title: "Hoàn tất",
          description: "Đơn đã được giao thành công.",
        },
      ],
      cancelled: "Đơn hàng đã hủy",
    },
    where: {
      eyebrow: "Thông tin hữu ích",
      title: "Tìm mã đơn hàng ở đâu?",
      description:
        "Mã đơn thường bắt đầu bằng “LS” và được gửi ngay sau khi đặt hàng.",
      items: [
        {
          title: "Email xác nhận",
          description: "Kiểm tra hộp thư chính và cả mục thư rác.",
        },
        {
          title: "Tin nhắn hoặc Zalo",
          description: "Xem lại cuộc trò chuyện xác nhận từ Figure Lab.",
        },
        {
          title: "Hóa đơn & lịch sử",
          description:
            "Mã đơn nằm ở đầu hóa đơn hoặc trang đặt hàng thành công.",
        },
      ],
      sampleLabel: "Mã đơn mẫu",
      sampleCode: "LS202607190001",
    },
    faq: {
      eyebrow: "Câu hỏi thường gặp",
      title: "Bạn cần thêm thông tin?",
      items: [
        {
          question: "Không nhớ mã đơn phải làm gì?",
          answer:
            "Kiểm tra email, tin nhắn xác nhận hoặc liên hệ Figure Lab bằng số điện thoại đã đặt hàng.",
        },
        {
          question: "Vì sao không tìm thấy đơn hàng?",
          answer:
            "Hãy kiểm tra đúng mã đơn, số điện thoại và thử lại không có khoảng trắng ở đầu hoặc cuối.",
        },
        {
          question: "Bao lâu trạng thái được cập nhật?",
          answer:
            "Trạng thái được cập nhật sau mỗi mốc xử lý quan trọng của thiết kế, sản xuất và giao hàng.",
        },
        {
          question: "Khi nào nên liên hệ hỗ trợ?",
          answer:
            "Hãy liên hệ nếu trạng thái không đổi quá lâu, cần sửa thông tin nhận hàng hoặc có thay đổi gấp.",
        },
      ],
    },
    support: {
      eyebrow: "Figure Lab luôn đồng hành",
      title: "Chưa tìm thấy thông tin bạn cần?",
      description:
        "Gửi mã đơn và số điện thoại, đội ngũ Figure Lab sẽ hỗ trợ kiểm tra nhanh nhất.",
      button: "Liên hệ tư vấn",
    },
    result: {
      eyebrow: "Kết quả tra cứu",
      title: "Hành trình món quà của bạn",
      orderCode: "Mã đơn",
      customer: "Khách hàng",
      orderDate: "Ngày đặt",
      total: "Tổng tiền",
      currentStatus: "Trạng thái hiện tại",
      paymentStatus: "Thanh toán",
      delivery: "Thông tin giao nhận",
      estimatedDelivery: "Dự kiến giao",
      trackingCode: "Mã vận đơn",
      provider: "Đơn vị vận chuyển",
      note: "Ghi chú",
      contact: "Liên hệ hỗ trợ",
      collection: "Xem bộ sưu tập",
      home: "Về trang chủ",
      products: "Sản phẩm trong đơn",
      latestUpdate: "Cập nhật gần nhất",
      noData: "Chưa có thông tin",
      hiddenCustomer: "Thông tin đã được bảo vệ",
      quantity: "SL",
    },
    orderStatusLabels: {
      pending: "Đã tiếp nhận",
      confirmed: "Đã xác nhận",
      processing: "Thiết kế / sản xuất",
      shipping: "Đang giao hàng",
      completed: "Hoàn tất",
      cancelled: "Đã hủy",
    },
    paymentStatusLabels: {
      unpaid: "Chưa thanh toán",
      pending: "Chờ thanh toán",
      deposit_pending: "Chờ đặt cọc",
      deposit_paid: "Đã đặt cọc",
      paid: "Đã thanh toán",
      failed: "Thanh toán thất bại",
      cancelled: "Đã hủy thanh toán",
      refunded: "Đã hoàn tiền",
    },
    shippingLabels: {
      shop_support: "Figure Lab hỗ trợ giao",
      standard: "Giao tiêu chuẩn",
      fast: "Giao nhanh",
      self: "Tự nhận / tự đặt giao",
    },
  },
  en: {
    hero: {
      eyebrow: "Order tracking",
      title: "Follow your gift on every step of its journey",
      description:
        "From the first story we receive to the moment your gift arrives, every important update is right here.",
      trust: ["Clear updates", "Phone-protected lookup", "Support when needed"],
      visualCode: "FL-2026-0719",
      visualStatus: "Finishing your gift",
      visualHint: "Estimated delivery in 2–3 days",
    },
    lookup: {
      eyebrow: "Check in seconds",
      title: "Where is your gift now?",
      description: "Enter the order code and phone number used at checkout.",
      orderCodeLabel: "Order code",
      orderCodePlaceholder: "Example: LS202607190001",
      phoneLabel: "Phone number",
      phonePlaceholder: "Example: 0901 234 567",
      submit: "Track order",
      submitting: "Looking up...",
      codeHint: "Find the code in your confirmation email or message.",
      phoneHint: "Use the checkout phone number to protect order details.",
      forgotCode: "Forgot the code?",
      needSupport: "Need support?",
      requiredError: "Please enter both the order code and phone number.",
      phoneError: "The phone number must contain at least 8 digits.",
      notFoundError: "No order matched the information you provided.",
      networkError:
        "We cannot connect right now. Please try again in a few minutes.",
      success: "Order found. Taking you to the result now.",
    },
    guide: {
      eyebrow: "Simple lookup",
      title: "Three steps to follow your gift",
      description: "No account required, just your confirmation details.",
      items: [
        {
          title: "Enter details",
          description: "Use the order code and checkout phone number.",
        },
        {
          title: "View status",
          description:
            "See whether the gift is in design, production or delivery.",
        },
        {
          title: "Follow next steps",
          description: "Review estimated milestones and the latest updates.",
        },
      ],
    },
    statuses: {
      eyebrow: "A transparent journey",
      title: "What steps does every gift go through?",
      description:
        "Timing may vary slightly depending on the level of personalization.",
      items: [
        {
          key: "received",
          title: "Received",
          description: "Your order is in our system.",
        },
        {
          key: "confirming",
          title: "Confirming",
          description: "Figure Lab verifies the details.",
        },
        {
          key: "design",
          title: "Design & approval",
          description: "We prepare and share a preview.",
        },
        {
          key: "production",
          title: "In production",
          description: "The approved design comes to life.",
        },
        {
          key: "packing",
          title: "Packing",
          description: "Final checks and gift wrapping.",
        },
        {
          key: "shipping",
          title: "Shipping",
          description: "Your gift is on its way.",
        },
        {
          key: "complete",
          title: "Complete",
          description: "The order has been delivered.",
        },
      ],
      cancelled: "Order cancelled",
    },
    where: {
      eyebrow: "Helpful information",
      title: "Where can you find the order code?",
      description:
        "It usually starts with “LS” and is sent right after checkout.",
      items: [
        {
          title: "Confirmation email",
          description: "Check your inbox and spam folder.",
        },
        {
          title: "Message or Zalo",
          description: "Review the confirmation chat from Figure Lab.",
        },
        {
          title: "Receipt & history",
          description: "Find it at the top of your receipt or success page.",
        },
      ],
      sampleLabel: "Sample code",
      sampleCode: "LS202607190001",
    },
    faq: {
      eyebrow: "Frequently asked questions",
      title: "Need a little more information?",
      items: [
        {
          question: "What if I forgot the order code?",
          answer:
            "Check your confirmation email or message, or contact us using the checkout phone number.",
        },
        {
          question: "Why can’t I find my order?",
          answer:
            "Check both fields and remove accidental spaces before trying again.",
        },
        {
          question: "How often is the status updated?",
          answer:
            "We update it after each important design, production and delivery milestone.",
        },
        {
          question: "When should I contact support?",
          answer:
            "Reach out if the status has not changed for too long or you need to update delivery details.",
        },
      ],
    },
    support: {
      eyebrow: "Figure Lab is here",
      title: "Still looking for an answer?",
      description:
        "Share your code and phone number and our team will help check the order.",
      button: "Contact support",
    },
    result: {
      eyebrow: "Tracking result",
      title: "Your gift journey",
      orderCode: "Order code",
      customer: "Customer",
      orderDate: "Order date",
      total: "Total",
      currentStatus: "Current status",
      paymentStatus: "Payment",
      delivery: "Delivery details",
      estimatedDelivery: "Estimated delivery",
      trackingCode: "Tracking code",
      provider: "Shipping provider",
      note: "Notes",
      contact: "Contact support",
      collection: "View collection",
      home: "Back home",
      products: "Order items",
      latestUpdate: "Latest update",
      noData: "Not available yet",
      hiddenCustomer: "Details are protected",
      quantity: "Qty",
    },
    orderStatusLabels: {
      pending: "Received",
      confirmed: "Confirmed",
      processing: "Design / production",
      shipping: "Shipping",
      completed: "Complete",
      cancelled: "Cancelled",
    },
    paymentStatusLabels: {
      unpaid: "Unpaid",
      pending: "Awaiting payment",
      deposit_pending: "Awaiting deposit",
      deposit_paid: "Deposit paid",
      paid: "Paid",
      failed: "Payment failed",
      cancelled: "Payment cancelled",
      refunded: "Refunded",
    },
    shippingLabels: {
      shop_support: "Figure Lab arranged delivery",
      standard: "Standard delivery",
      fast: "Express delivery",
      self: "Store pickup / self-arranged",
    },
  },
} as const satisfies Record<Locale, object>;
