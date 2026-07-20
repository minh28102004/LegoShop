import type { Locale } from "@/lib/i18n/config";
import { DECORATIVE_ICON_PATHS } from "@/config/icons";
import type { BusinessPageCopy } from "@/modules/business/types/business-page.types";

export const BUSINESS_HERO_IMAGES = [
  "/home/graduation-celebration.png",
  "/home/love-frame.png",
  "/home/graduation-frame.png",
  "/home/birthday-frame.png",
] as const;

export const BUSINESS_SHOWCASE_IMAGES = [
  "/home/graduation-frame.png",
  "/home/love-frame.png",
  "/home/graduation-celebration.png",
  "/home/birthday-frame.png",
] as const;

export const BUSINESS_METRIC_ICONS = [
  DECORATIVE_ICON_PATHS.telephoneReceiver,
  DECORATIVE_ICON_PATHS.chartIncreasing,
  DECORATIVE_ICON_PATHS.receipt,
  DECORATIVE_ICON_PATHS.deliveryTruck,
] as const;

export const BUSINESS_USE_CASE_ICONS = [
  DECORATIVE_ICON_PATHS.trophy,
  DECORATIVE_ICON_PATHS.identificationCard,
  DECORATIVE_ICON_PATHS.handshake,
  DECORATIVE_ICON_PATHS.calendar,
  DECORATIVE_ICON_PATHS.officeBuilding,
  DECORATIVE_ICON_PATHS.megaphone,
] as const;

export const BUSINESS_BENEFIT_ICONS = [
  DECORATIVE_ICON_PATHS.chartIncreasing,
  DECORATIVE_ICON_PATHS.artistPalette,
  DECORATIVE_ICON_PATHS.receipt,
  DECORATIVE_ICON_PATHS.deliveryTruck,
] as const;

export const BUSINESS_PROCESS_ICONS = [
  DECORATIVE_ICON_PATHS.envelope,
  DECORATIVE_ICON_PATHS.telephoneReceiver,
  DECORATIVE_ICON_PATHS.checkMark,
  DECORATIVE_ICON_PATHS.package,
] as const;

export const BUSINESS_PAGE_COPY: Record<Locale, BusinessPageCopy> = {
  vi: {
    hero: {
      eyebrow: "GIẢI PHÁP QUÀ TẶNG DOANH NGHIỆP",
      title: "Biến mỗi món quà thành dấu ấn của doanh nghiệp.",
      description:
        "Figure Lab thiết kế quà tặng cá nhân hóa cho nhân viên, khách hàng và đối tác, từ ý tưởng thương hiệu đến thành phẩm được giao tận nơi.",
      primaryCta: "Nhận tư vấn",
      secondaryCta: "Xem mẫu doanh nghiệp",
      commitments: [
        "Thiết kế theo thương hiệu",
        "Duyệt mẫu trước",
        "Giao hàng toàn quốc",
      ],
      imageAlts: [
        "Khung quà tặng vinh danh nhân viên",
        "Khung quà tặng đối tác cá nhân hóa",
        "Mẫu quà kỷ niệm doanh nghiệp",
        "Mẫu quà sự kiện Figure Lab",
      ],
      floatingLabel: "Duyệt mẫu trước khi sản xuất",
    },
    metrics: [
      {
        title: "Phản hồi trong 2 giờ",
        description: "Trong giờ làm việc",
      },
      {
        title: "Hỗ trợ đơn số lượng lớn",
        description: "Tư vấn theo ngân sách",
      },
      {
        title: "Duyệt mẫu trước sản xuất",
        description: "Minh bạch từng chi tiết",
      },
      {
        title: "Giao hàng toàn quốc",
        description: "Theo dõi tiến độ rõ ràng",
      },
    ],
    useCases: {
      eyebrow: "QUÀ TẶNG ĐÚNG NGƯỜI, ĐÚNG DỊP",
      title: "Giải pháp linh hoạt cho mọi dấu mốc doanh nghiệp",
      description:
        "Mỗi chương trình có một mục tiêu khác nhau. Figure Lab giúp bạn chuyển mục tiêu đó thành món quà có câu chuyện và nhận diện riêng.",
      items: [
        {
          title: "Tri ân nhân viên",
          description: "Vinh danh hành trình, thành tích và đóng góp đáng nhớ.",
          example: "Phù hợp: thâm niên, nhân viên xuất sắc, chia tay đồng nghiệp.",
        },
        {
          title: "Quà khách hàng VIP",
          description: "Tạo trải nghiệm riêng cho nhóm khách hàng quan trọng.",
          example: "Phù hợp: chăm sóc VIP, tái ký, dịp lễ cuối năm.",
        },
        {
          title: "Quà đối tác",
          description: "Ghi dấu mối quan hệ hợp tác bằng thiết kế tinh tế.",
          example: "Phù hợp: ký kết, khai trương, kỷ niệm hợp tác.",
        },
        {
          title: "Sự kiện và hội nghị",
          description: "Quà đồng bộ concept, dễ phân phối và lưu giữ lâu dài.",
          example: "Phù hợp: hội nghị, workshop, team building.",
        },
        {
          title: "Onboarding nhân viên mới",
          description: "Chào đón thành viên mới bằng câu chuyện thương hiệu gần gũi.",
          example: "Phù hợp: welcome kit, ngày đầu nhận việc, trainee program.",
        },
        {
          title: "Ra mắt và kỷ niệm thành lập",
          description: "Biến cột mốc thương hiệu thành phiên bản quà giới hạn.",
          example: "Phù hợp: product launch, sinh nhật công ty, activation.",
        },
      ],
    },
    benefits: {
      eyebrow: "ĐỒNG HÀNH TỪ BRIEF ĐẾN THÀNH PHẨM",
      title: "Một quy trình B2B rõ ràng, không đánh đổi sự tinh tế",
      description:
        "Đội ngũ Figure Lab cân bằng nhận diện thương hiệu, ngân sách và tiến độ để mỗi lô quà đạt chất lượng đồng đều.",
      imageAlt: "Bộ quà doanh nghiệp được cá nhân hóa bởi Figure Lab",
      items: [
        {
          title: "Chiết khấu theo số lượng",
          description: "Báo giá minh bạch theo quy mô và cấu hình sản phẩm.",
        },
        {
          title: "Thiết kế theo bộ nhận diện",
          description: "Tùy chỉnh màu sắc, logo, thông điệp và packaging.",
        },
        {
          title: "Duyệt mẫu trước sản xuất",
          description: "Xem trước thiết kế và điều chỉnh trước khi chốt lô hàng.",
        },
        {
          title: "Theo dõi tiến độ, giao đúng hẹn",
          description: "Một đầu mối hỗ trợ xuyên suốt từ brief đến bàn giao.",
        },
      ],
    },
    process: {
      eyebrow: "QUY TRÌNH 4 BƯỚC",
      title: "Dễ bắt đầu, dễ kiểm soát, dễ mở rộng",
      description:
        "Bạn luôn biết dự án đang ở đâu và bước tiếp theo cần xác nhận điều gì.",
      items: [
        {
          title: "Gửi yêu cầu",
          description: "Chia sẻ mục tiêu, số lượng, ngân sách và thời gian cần hàng.",
        },
        {
          title: "Nhận tư vấn và báo giá",
          description: "Chúng tôi đề xuất cấu hình phù hợp và báo giá rõ ràng.",
        },
        {
          title: "Duyệt thiết kế",
          description: "Kiểm tra demo, nội dung và nhận diện trước khi sản xuất.",
        },
        {
          title: "Sản xuất và giao hàng",
          description: "Hoàn thiện đồng bộ, đóng gói và bàn giao theo kế hoạch.",
        },
      ],
    },
    showcase: {
      eyebrow: "MẪU DOANH NGHIỆP",
      title: "Ý tưởng thật để khởi động brief nhanh hơn",
      description:
        "Tham khảo các thiết kế nổi bật rồi cùng Figure Lab tùy chỉnh theo câu chuyện và nhận diện của doanh nghiệp bạn.",
      viewCollection: "Xem toàn bộ sưu tập",
      consult: "Tư vấn mẫu này",
      viewDetail: "Xem chi tiết",
      priceFrom: "Từ",
      fallbackItems: [
        {
          title: "Dấu ấn nhân viên xuất sắc",
          occasion: "Vinh danh nhân viên",
          description: "Thiết kế theo vai trò, thành tích và cột mốc riêng.",
        },
        {
          title: "Kết nối đối tác bền vững",
          occasion: "Quà đối tác",
          description: "Phiên bản quà trang trọng cho những mối quan hệ quan trọng.",
        },
        {
          title: "Hành trình một thập kỷ",
          occasion: "Kỷ niệm thành lập",
          description: "Lưu lại cột mốc thương hiệu bằng một khung kể chuyện.",
        },
        {
          title: "Khoảnh khắc sự kiện",
          occasion: "Quà hội nghị",
          description: "Quà đồng bộ concept, gọn nhẹ và dễ trao tặng.",
        },
      ],
    },
    form: {
      eyebrow: "NHẬN TƯ VẤN B2B",
      title: "Cùng tạo một món quà mang dấu ấn thương hiệu của bạn.",
      description:
        "Gửi brief ban đầu, đội ngũ Figure Lab sẽ liên hệ để làm rõ nhu cầu và đề xuất phương án phù hợp.",
      responseTime: "Phản hồi trong vòng 2 giờ làm việc.",
      contactTitle: "Kết nối trực tiếp",
      emailLabel: "Email",
      emailValue: "hello@figurelab.vn",
      phoneLabel: "Điện thoại",
      phoneValue: "0901 234 567",
      hoursLabel: "Thời gian làm việc",
      hoursValue: "Thứ 2 - Thứ 7, 08:30 - 18:00",
      commitments: [
        "Không ràng buộc sau tư vấn",
        "Báo giá minh bạch",
        "Bảo mật thông tin doanh nghiệp",
      ],
      cardEyebrow: "BƯỚC 1 / GỬI BRIEF",
      cardTitle: "Cho chúng tôi biết nhu cầu của bạn",
      cardDescription: "Các trường có dấu * là bắt buộc.",
      fields: {
        companyName: "Tên công ty / tổ chức",
        contactName: "Người liên hệ",
        email: "Email công việc",
        phone: "Số điện thoại",
        inquiryType: "Loại nhu cầu",
        quantity: "Số lượng dự kiến",
        budget: "Ngân sách dự kiến",
        requiredDate: "Ngày cần nhận hàng",
        preferredContact: "Phương thức liên hệ ưu tiên",
        message: "Nội dung yêu cầu",
        consent: "Tôi đồng ý để Figure Lab liên hệ tư vấn",
        consentDescription: "Thông tin chỉ được dùng để phản hồi yêu cầu này.",
      },
      placeholders: {
        companyName: "Ví dụ: Công ty Figure Lab",
        contactName: "Họ và tên",
        email: "name@company.com",
        phone: "0901 234 567",
        select: "Chọn một phương án",
        message: "Mục tiêu chương trình, đối tượng nhận quà, concept hoặc yêu cầu đặc biệt...",
      },
      inquiryOptions: [
        { value: "employee", label: "Tri ân / vinh danh nhân viên" },
        { value: "vip", label: "Quà khách hàng VIP" },
        { value: "partner", label: "Quà đối tác" },
        { value: "event", label: "Sự kiện / hội nghị" },
        { value: "onboarding", label: "Onboarding nhân viên" },
        { value: "anniversary", label: "Kỷ niệm / ra mắt sản phẩm" },
        { value: "other", label: "Nhu cầu khác" },
      ],
      quantityOptions: [
        { value: "10-29", label: "10 - 29 sản phẩm" },
        { value: "30-49", label: "30 - 49 sản phẩm" },
        { value: "50-99", label: "50 - 99 sản phẩm" },
        { value: "100-299", label: "100 - 299 sản phẩm" },
        { value: "300+", label: "Từ 300 sản phẩm" },
      ],
      budgetOptions: [
        { value: "under-10m", label: "Dưới 10 triệu" },
        { value: "10m-30m", label: "10 - 30 triệu" },
        { value: "30m-70m", label: "30 - 70 triệu" },
        { value: "70m+", label: "Trên 70 triệu" },
        { value: "consult", label: "Cần tư vấn ngân sách" },
      ],
      contactOptions: [
        { value: "phone", label: "Điện thoại" },
        { value: "email", label: "Email" },
        { value: "zalo", label: "Zalo" },
      ],
      submit: "Gửi yêu cầu tư vấn",
      submitting: "Đang gửi yêu cầu...",
      successTitle: "Figure Lab đã nhận được brief của bạn",
      successDescription: "Đội ngũ tư vấn sẽ liên hệ trong giờ làm việc gần nhất.",
      requestCodeLabel: "Mã yêu cầu",
      sendAnother: "Gửi một yêu cầu khác",
      errors: {
        required: "Vui lòng nhập thông tin này.",
        email: "Email chưa đúng định dạng.",
        phone: "Số điện thoại chưa hợp lệ.",
        consent: "Vui lòng đồng ý để chúng tôi liên hệ.",
        submit: "Chưa thể gửi yêu cầu. Vui lòng thử lại hoặc liên hệ trực tiếp.",
      },
    },
    finalCta: {
      eyebrow: "SẴN SÀNG KHỞI ĐỘNG?",
      title: "Một brief tốt hôm nay, một món quà đáng nhớ ngày mai.",
      description:
        "Bắt đầu bằng vài thông tin cơ bản. Figure Lab sẽ giúp bạn hoàn thiện phần còn lại.",
      primaryCta: "Nhận tư vấn ngay",
      secondaryCta: "Khám phá bộ sưu tập",
    },
  },
  en: {
    hero: {
      eyebrow: "CORPORATE GIFTING SOLUTIONS",
      title: "Turn every gift into a lasting brand impression.",
      description:
        "Figure Lab creates personalized gifts for employees, clients and partners, from the initial brand idea to delivery-ready keepsakes.",
      primaryCta: "Get a consultation",
      secondaryCta: "View corporate designs",
      commitments: ["On-brand design", "Pre-production approval", "Nationwide delivery"],
      imageAlts: [
        "Personalized employee recognition frame",
        "Personalized partner gift frame",
        "Corporate anniversary gift design",
        "Figure Lab event gift sample",
      ],
      floatingLabel: "Approve the design before production",
    },
    metrics: [
      { title: "Reply within 2 hours", description: "During business hours" },
      { title: "Bulk order support", description: "Planned around your budget" },
      { title: "Pre-production approval", description: "Every detail stays transparent" },
      { title: "Nationwide delivery", description: "Clear progress tracking" },
    ],
    useCases: {
      eyebrow: "THE RIGHT GIFT FOR EVERY BUSINESS MOMENT",
      title: "Flexible solutions for every corporate milestone",
      description:
        "Every program has a different goal. Figure Lab turns that goal into a meaningful, on-brand keepsake.",
      items: [
        { title: "Employee appreciation", description: "Celebrate journeys, achievements and meaningful contributions.", example: "Ideal for tenure, awards and team farewells." },
        { title: "VIP client gifts", description: "Create a personal experience for your most important clients.", example: "Ideal for VIP care, renewals and year-end gifting." },
        { title: "Partner gifts", description: "Mark strong partnerships with a thoughtful custom design.", example: "Ideal for signings, openings and partnership anniversaries." },
        { title: "Events and conferences", description: "Concept-ready gifts that are easy to distribute and keep.", example: "Ideal for conferences, workshops and team events." },
        { title: "New-hire onboarding", description: "Welcome new teammates with an approachable brand story.", example: "Ideal for welcome kits, first days and trainee programs." },
        { title: "Launches and anniversaries", description: "Turn brand milestones into limited-edition keepsakes.", example: "Ideal for launches, company birthdays and activations." },
      ],
    },
    benefits: {
      eyebrow: "FROM BRIEF TO FINISHED GIFT",
      title: "A clear B2B process without losing the thoughtful details",
      description:
        "Figure Lab balances brand identity, budget and timing so every gift in the batch arrives with consistent quality.",
      imageAlt: "A corporate gift collection personalized by Figure Lab",
      items: [
        { title: "Volume pricing", description: "Transparent quotes based on quantity and product configuration." },
        { title: "Brand-led design", description: "Customize colors, logos, messages and packaging." },
        { title: "Pre-production approval", description: "Review the design and refine details before production." },
        { title: "Progress tracking and on-time delivery", description: "One point of contact from brief to handover." },
      ],
    },
    process: {
      eyebrow: "A FOUR-STEP PROCESS",
      title: "Easy to start, easy to manage, easy to scale",
      description: "You always know where the project stands and what needs approval next.",
      items: [
        { title: "Share your brief", description: "Tell us the goal, quantity, budget and required delivery date." },
        { title: "Consultation and quote", description: "We recommend the right configuration with a clear quote." },
        { title: "Approve the design", description: "Review the demo, content and brand details before production." },
        { title: "Production and delivery", description: "We produce, pack and deliver the batch to plan." },
      ],
    },
    showcase: {
      eyebrow: "CORPORATE DESIGNS",
      title: "Real ideas to help your brief move faster",
      description:
        "Start with a featured design, then tailor it to your company story and brand identity with Figure Lab.",
      viewCollection: "View the full collection",
      consult: "Ask about this design",
      viewDetail: "View details",
      priceFrom: "From",
      fallbackItems: [
        { title: "Outstanding employee story", occasion: "Employee recognition", description: "Personalized around role, achievement and milestones." },
        { title: "Partners for the long run", occasion: "Partner gift", description: "A polished keepsake for important business relationships." },
        { title: "A decade of progress", occasion: "Company anniversary", description: "Turn a business milestone into a framed story." },
        { title: "Event moments", occasion: "Conference gift", description: "Concept-ready, compact and easy to present." },
      ],
    },
    form: {
      eyebrow: "B2B CONSULTATION",
      title: "Let us create a gift that carries your brand's signature.",
      description:
        "Share an initial brief and the Figure Lab team will clarify your needs and recommend the right approach.",
      responseTime: "We reply within two business hours.",
      contactTitle: "Connect directly",
      emailLabel: "Email",
      emailValue: "hello@figurelab.vn",
      phoneLabel: "Phone",
      phoneValue: "0901 234 567",
      hoursLabel: "Business hours",
      hoursValue: "Monday - Saturday, 08:30 - 18:00",
      commitments: ["No obligation after consultation", "Transparent quotes", "Business information kept private"],
      cardEyebrow: "STEP 1 / SHARE YOUR BRIEF",
      cardTitle: "Tell us what you need",
      cardDescription: "Fields marked * are required.",
      fields: {
        companyName: "Company / organization",
        contactName: "Contact person",
        email: "Work email",
        phone: "Phone number",
        inquiryType: "Inquiry type",
        quantity: "Estimated quantity",
        budget: "Estimated budget",
        requiredDate: "Required delivery date",
        preferredContact: "Preferred contact method",
        message: "Brief and requirements",
        consent: "I agree to be contacted by Figure Lab",
        consentDescription: "Your information is only used to respond to this inquiry.",
      },
      placeholders: {
        companyName: "Example: Figure Lab Company",
        contactName: "Full name",
        email: "name@company.com",
        phone: "0901 234 567",
        select: "Select an option",
        message: "Program goal, recipients, concept or special requirements...",
      },
      inquiryOptions: [
        { value: "employee", label: "Employee appreciation / recognition" },
        { value: "vip", label: "VIP client gifts" },
        { value: "partner", label: "Partner gifts" },
        { value: "event", label: "Events / conferences" },
        { value: "onboarding", label: "Employee onboarding" },
        { value: "anniversary", label: "Anniversary / product launch" },
        { value: "other", label: "Other inquiry" },
      ],
      quantityOptions: [
        { value: "10-29", label: "10 - 29 items" },
        { value: "30-49", label: "30 - 49 items" },
        { value: "50-99", label: "50 - 99 items" },
        { value: "100-299", label: "100 - 299 items" },
        { value: "300+", label: "300 items or more" },
      ],
      budgetOptions: [
        { value: "under-10m", label: "Under VND 10 million" },
        { value: "10m-30m", label: "VND 10 - 30 million" },
        { value: "30m-70m", label: "VND 30 - 70 million" },
        { value: "70m+", label: "Above VND 70 million" },
        { value: "consult", label: "I need budget guidance" },
      ],
      contactOptions: [
        { value: "phone", label: "Phone" },
        { value: "email", label: "Email" },
        { value: "zalo", label: "Zalo" },
      ],
      submit: "Send consultation request",
      submitting: "Sending request...",
      successTitle: "Figure Lab has received your brief",
      successDescription: "Our team will contact you during the next business hours.",
      requestCodeLabel: "Request code",
      sendAnother: "Send another request",
      errors: {
        required: "Please complete this field.",
        email: "Please enter a valid email address.",
        phone: "Please enter a valid phone number.",
        consent: "Please agree to be contacted.",
        submit: "We could not send your request. Please try again or contact us directly.",
      },
    },
    finalCta: {
      eyebrow: "READY TO GET STARTED?",
      title: "A clear brief today. A memorable gift tomorrow.",
      description: "Start with a few basics and Figure Lab will help shape the rest.",
      primaryCta: "Get a consultation",
      secondaryCta: "Explore the collection",
    },
  },
};
