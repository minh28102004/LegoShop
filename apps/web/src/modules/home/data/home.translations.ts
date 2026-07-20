import { ROUTES } from "@/config/routes";
import type { Locale } from "@/lib/i18n/config";
import type { HomePageTranslation } from "@/modules/home/types/home.types";

const TESTIMONIAL_SAMPLE_SEED = "homepage-testimonials-sample-20260717";

export const HOME_TRANSLATIONS = {
  vi: {
    hero: {
      eyebrow: "Minifigure cá nhân hóa",
      title:
        "Lưu giữ khoảnh khắc chuyển giao bằng một món quà chỉ thuộc về người ấy.",
      description:
        "Từ ảnh thật, ngành học, nghề nghiệp đến những sở thích rất riêng, Figure Lab biến câu chuyện của mỗi người thành một khung tranh minifigure được thiết kế riêng.",
      primaryCta: { label: "Tạo khung của bạn", href: ROUTES.studio },
      secondaryCta: {
        label: "Khám phá mẫu quà",
        href: ROUTES.collection,
      },
      trustPoints: [
        "Thiết kế riêng",
        "Duyệt mẫu trước",
        "Giao hàng toàn quốc",
      ],
      chips: [
        "Thiết kế theo ảnh",
        "Tùy chỉnh phụ kiện",
        "Thêm lời nhắn riêng",
      ],
      features: [
        {
          title: "Thiết kế nhanh",
          description: "Bắt đầu từ mẫu có sẵn.",
          icon: "highVoltage",
        },
        {
          title: "Tự do sáng tạo",
          description: "Tùy chỉnh từng chi tiết.",
          icon: "artistPalette",
        },
        {
          title: "Món quà độc nhất",
          description: "Được làm riêng cho người nhận.",
          icon: "wrappedGift",
        },
        {
          title: "Duyệt mẫu an tâm",
          description: "Kiểm tra trước khi hoàn thiện.",
          icon: "shield",
        },
      ],
      commitmentsLabel: "Cam kết dịch vụ",
      sliderLabels: {
        gallery: "Bộ sưu tập hình ảnh Figure Lab",
        previous: "Ảnh trước",
        next: "Ảnh tiếp theo",
        viewSlide: "Xem ảnh",
      },
    },
    story: {
      eyebrow: "Câu chuyện được đóng khung",
      title: "Lưu giữ khoảnh khắc chuyển giao của cuộc đời.",
      highlightedPhrase: "khoảnh khắc chuyển giao",
      paragraphs: [
        "Tốt nghiệp không chỉ là ngày khép lại những năm tháng học tập. Đó còn là lúc mỗi người bước sang một hành trình mới, mang theo bạn bè, kỷ niệm và ước mơ của tuổi trẻ.",
        "Figure Lab lưu lại dấu mốc ấy bằng một khung tranh được tạo nên từ những chi tiết rất riêng: lễ phục, ngành học, sở thích, phụ kiện và lời nhắn dành riêng cho người nhận.",
      ],
      quote: "Một khung tranh nhỏ, lưu giữ cả một chặng đường.",
      visualBadge: "Kỷ niệm được thiết kế riêng",
      cta: {
        label: "Xem bộ sưu tập tốt nghiệp",
        href: ROUTES.collection,
      },
    },
    friendship: {
      eyebrow: "Quà cho đứa bạn thân",
      title: "Bạn đã nghĩ ra món quà tốt nghiệp cho đứa bạn thân chưa?",
      subtitle:
        "Đừng chỉ tặng một món đồ. Hãy tặng lại cho họ một phần ký ức tuổi thanh xuân, được kể bằng những chi tiết chỉ hai người hiểu.",
      details: [
        {
          title: "Ngành học của họ",
          description:
            "Áo blouse, máy ảnh, laptop, sách, bảng vẽ hoặc dụng cụ nghề nghiệp.",
          icon: "graduation",
        },
        {
          title: "Sở thích rất riêng",
          description:
            "Âm nhạc, thể thao, du lịch, game hay món đồ họ luôn mang theo.",
          icon: "sparkles",
        },
        {
          title: "Câu chuyện của hai người",
          description:
            "Biệt danh, ngày kỷ niệm và lời nhắn chỉ dành riêng cho người nhận.",
          icon: "gift",
        },
      ],
      cta: { label: "Thiết kế quà cho bạn thân", href: ROUTES.studio },
    },
    transformation: {
      eyebrow: "Từ câu chuyện đến thành phẩm",
      title: "Biến người bạn của bạn thành minifigure.",
      description:
        "Bắt đầu từ một bức ảnh thật. Figure Lab chọn lọc những đặc điểm nhận diện, trang phục và phụ kiện để tạo nên phiên bản minifigure mang đúng tinh thần của người nhận.",
      statement:
        "Mỗi thiết kế được tạo riêng dựa trên câu chuyện thật, không phải một món quà sản xuất hàng loạt.",
      items: [
        {
          title: "Khuôn mặt & kiểu tóc",
          description: "Gợi lại những nét nhận diện thân quen nhất.",
          icon: "face",
        },
        {
          title: "Trang phục",
          description: "Lễ phục, đồng phục hoặc phong cách thường ngày.",
          icon: "shirt",
        },
        {
          title: "Phụ kiện",
          description: "Đồ nghề, sở thích và những vật luôn mang theo.",
          icon: "accessory",
        },
        {
          title: "Tên & thông điệp",
          description: "Tên, ngày đáng nhớ và lời nhắn dành riêng.",
          icon: "message",
        },
      ],
      primaryCta: { label: "Bắt đầu thiết kế", href: ROUTES.studio },
      secondaryCta: { label: "Xem quy trình", href: ROUTES.howToOrder },
      sourceBadge: "Ảnh thật",
      sourceTitle: "Ảnh chân dung của người nhận",
      sourceDescription:
        "Vị trí dành cho ảnh khách hàng khi bắt đầu thiết kế.",
      resultBadge: "Minifigure mô phỏng",
    },
    products: {
      eyebrow: "Thiết kế nổi bật",
      title: "Những thiết kế được yêu thích",
      subtitle:
        "Chọn một mẫu có sẵn làm điểm bắt đầu, sau đó tùy chỉnh theo câu chuyện của bạn.",
      cta: { label: "Xem toàn bộ sưu tập", href: ROUTES.collection },
      emptyTitle: "Các thiết kế nổi bật đang được cập nhật.",
      errorDescription:
        "Kết nối dữ liệu tạm thời gián đoạn. Bạn vẫn có thể bắt đầu một thiết kế mới trong Studio.",
      emptyDescription:
        "Sản phẩm sẽ xuất hiện tại đây ngay khi dữ liệu Figure Lab được đồng bộ.",
      card: {
        featuredBadge: "Nổi bật",
        customDesignBadge: "Thiết kế riêng",
        fallbackDescription:
          "Khung minifigure được cá nhân hóa từ câu chuyện và những chi tiết riêng của người nhận.",
        view: "Xem",
        from: "Từ",
        customize: "Tùy chỉnh",
      },
    },
    process: {
      eyebrow: "Quy trình thiết kế",
      title: "Từ một bức ảnh đến món quà dành riêng cho họ",
      subtitle:
        "Bạn gửi câu chuyện, Figure Lab đồng hành từ bản xem trước đến khi món quà được giao tận tay.",
      steps: [
        {
          step: "01",
          title: "Chọn mẫu",
          description: "Chọn loại khung và phong cách bạn muốn.",
        },
        {
          step: "02",
          title: "Gửi thông tin",
          description: "Gửi ảnh, trang phục, sở thích và thông điệp.",
        },
        {
          step: "03",
          title: "Duyệt thiết kế",
          description: "Figure Lab gửi bản xem trước để bạn kiểm tra.",
        },
        {
          step: "04",
          title: "Nhận thành phẩm",
          description: "Sản phẩm được hoàn thiện, đóng gói và giao tận tay.",
        },
      ],
    },
    categories: {
      eyebrow: "Quà cho mọi dấu mốc",
      title: "Không chỉ là quà tốt nghiệp",
      subtitle:
        "Mỗi câu chuyện đều có thể trở thành một khung minifigure được thiết kế riêng cho đúng người, đúng dịp.",
      emptyTitle: "Bộ sưu tập đang được cập nhật.",
      errorDescription:
        "Kết nối dữ liệu tạm thời gián đoạn. Vui lòng quay lại sau hoặc mở Studio để bắt đầu từ đầu.",
      emptyDescription:
        "Các chủ đề quà tặng sẽ xuất hiện khi dữ liệu Figure Lab được đồng bộ.",
      card: {
        occasion: "Theo dịp",
        explore: "Khám phá",
        fallbackDescription:
          "Khám phá các thiết kế minifigure dành riêng cho dấu mốc này.",
      },
    },
    testimonials: {
      eyebrow: "Phản hồi mẫu",
      title: "Những câu chuyện có thể được Figure Lab đóng khung",
      subtitle:
        "Bốn tình huống minh họa dùng để trải nghiệm bố cục; đây không phải đánh giá khách hàng production.",
      sampleLabel: "Dữ liệu mẫu",
      ratingSuffix: "trên 5 sao",
      items: [
        {
          name: "Ngọc Mai",
          productType: "Khung đôi tốt nghiệp",
          quote:
            "Nhìn vào là nhận ra hai đứa ngay. Từ màu áo đến chiếc máy ảnh nhỏ đều đúng với câu chuyện mình gửi.",
          rating: 5,
          isSample: true,
          seedTag: TESTIMONIAL_SAMPLE_SEED,
        },
        {
          name: "Phúc An",
          productType: "Quà tốt nghiệp cho bạn thân",
          quote:
            "Bản xem trước được chỉnh rất nhanh. Thành phẩm gọn, chắc và lời nhắn khiến bạn mình xúc động thật sự.",
          rating: 5,
          isSample: true,
          seedTag: TESTIMONIAL_SAMPLE_SEED,
        },
        {
          name: "Linh Chi",
          productType: "Khung tri ân đội ngũ",
          quote:
            "Mỗi nhân vật có một chi tiết riêng nhưng cả bộ vẫn đồng nhất. Đây là món quà nội bộ được mọi người nhắc lại nhiều nhất.",
          rating: 5,
          isSample: true,
          seedTag: TESTIMONIAL_SAMPLE_SEED,
        },
        {
          name: "Bảo Trâm",
          productType: "Khung sinh nhật cá nhân hóa",
          quote:
            "Mẫu minh họa cho thấy màu sắc, phụ kiện và lời nhắn có thể được phối thành một món quà rất riêng cho người nhận.",
          rating: 5,
          isSample: true,
          seedTag: TESTIMONIAL_SAMPLE_SEED,
        },
      ],
    },
    finalCta: {
      eyebrow: "Bắt đầu từ câu chuyện của bạn",
      title: "Có một người xứng đáng nhận món quà chỉ dành riêng cho họ.",
      description:
        "Hãy kể Figure Lab nghe về người bạn muốn tặng. Chúng tôi sẽ giúp bạn biến câu chuyện ấy thành một khung tranh minifigure.",
      primaryCta: { label: "Tạo thiết kế ngay", href: ROUTES.studio },
      secondaryCta: { label: "Nhận tư vấn", href: ROUTES.business },
    },
    media: {
      alt: {
        hero: "Thiết kế minifigure cá nhân hóa nổi bật của Figure Lab",
        story: "Một câu chuyện kỷ niệm được Figure Lab đóng khung",
        friendship: "Khung minifigure được thiết kế riêng cho bạn thân",
        transformation: "Thành phẩm minifigure được tạo từ câu chuyện thật",
        "final-cta": "Mẫu quà minifigure cá nhân hóa của Figure Lab",
      },
      developmentBadge: "Ảnh mẫu phát triển",
      unavailableLabel: "Hình ảnh Figure Lab đang được cập nhật",
      unavailableText: "Hình ảnh đang được đồng bộ từ Figure Lab",
    },
  },
  en: {
    hero: {
      eyebrow: "Personalized minifigure keepsakes",
      title:
        "Preserve a life-changing moment with a gift made for one person only.",
      description:
        "From a real photo, field of study and career to the details they love most, Figure Lab turns each story into a one-of-a-kind minifigure frame.",
      primaryCta: { label: "Create your frame", href: ROUTES.studio },
      secondaryCta: {
        label: "Explore gift designs",
        href: ROUTES.collection,
      },
      trustPoints: [
        "Made to order",
        "Preview before production",
        "Nationwide delivery",
      ],
      chips: [
        "Designed from a photo",
        "Custom accessories",
        "Personal message",
      ],
      features: [
        {
          title: "Quick to begin",
          description: "Start with a ready-made design.",
          icon: "highVoltage",
        },
        {
          title: "Freedom to create",
          description: "Personalize every detail.",
          icon: "artistPalette",
        },
        {
          title: "A truly unique gift",
          description: "Created for one special person.",
          icon: "wrappedGift",
        },
        {
          title: "Preview with confidence",
          description: "Review it before completion.",
          icon: "shield",
        },
      ],
      commitmentsLabel: "Service commitments",
      sliderLabels: {
        gallery: "Figure Lab image collection",
        previous: "Previous image",
        next: "Next image",
        viewSlide: "View image",
      },
    },
    story: {
      eyebrow: "A story worth framing",
      title: "Preserve the turning points that shape a life.",
      highlightedPhrase: "turning points",
      paragraphs: [
        "Graduation is more than the end of years spent studying. It is the beginning of a new journey, carrying friendships, memories and youthful dreams forward.",
        "Figure Lab preserves that milestone in a frame built from personal details: graduation attire, field of study, interests, accessories and a message written for the recipient.",
      ],
      quote: "One small frame can hold an entire journey.",
      visualBadge: "A keepsake designed around them",
      cta: {
        label: "Explore graduation gifts",
        href: ROUTES.collection,
      },
    },
    friendship: {
      eyebrow: "A gift for your best friend",
      title: "Have you found the right graduation gift for your best friend?",
      subtitle:
        "Give them more than an object. Bring back a piece of your shared youth through details that only the two of you understand.",
      details: [
        {
          title: "Their field of study",
          description:
            "A lab coat, camera, laptop, books, drawing board or tools of the trade.",
          icon: "graduation",
        },
        {
          title: "Their favorite things",
          description:
            "Music, sports, travel, games or the object they always carry.",
          icon: "sparkles",
        },
        {
          title: "The story you share",
          description:
            "A nickname, anniversary and message meant only for the recipient.",
          icon: "gift",
        },
      ],
      cta: { label: "Design a gift for a friend", href: ROUTES.studio },
    },
    transformation: {
      eyebrow: "From story to finished piece",
      title: "Turn your friend into a minifigure.",
      description:
        "Begin with a real photo. Figure Lab selects the most recognizable features, outfit and accessories to create a minifigure that captures the recipient’s personality.",
      statement:
        "Every design is made around a real story, never as a mass-produced gift.",
      items: [
        {
          title: "Face & hairstyle",
          description: "Capture the features that feel most familiar.",
          icon: "face",
        },
        {
          title: "Outfit",
          description: "Graduation attire, uniforms or everyday style.",
          icon: "shirt",
        },
        {
          title: "Accessories",
          description: "Tools, interests and the things they always carry.",
          icon: "accessory",
        },
        {
          title: "Name & message",
          description: "A name, meaningful date and personal note.",
          icon: "message",
        },
      ],
      primaryCta: { label: "Start designing", href: ROUTES.studio },
      secondaryCta: { label: "View the process", href: ROUTES.howToOrder },
      sourceBadge: "Original photo",
      sourceTitle: "A portrait of the recipient",
      sourceDescription: "Your photo will appear here when you begin designing.",
      resultBadge: "Minifigure interpretation",
    },
    products: {
      eyebrow: "Featured designs",
      title: "Most-loved designs",
      subtitle:
        "Choose a ready-made design as your starting point, then personalize it around your story.",
      cta: { label: "Browse the full collection", href: ROUTES.collection },
      emptyTitle: "Featured designs are being updated.",
      errorDescription:
        "The catalog is temporarily unavailable. You can still begin a new design in the Studio.",
      emptyDescription:
        "Products will appear here as soon as Figure Lab data is synchronized.",
      card: {
        featuredBadge: "Featured",
        customDesignBadge: "Custom design",
        fallbackDescription:
          "A personalized minifigure frame inspired by the recipient’s story and unique details.",
        view: "View",
        from: "From",
        customize: "Customize",
      },
    },
    process: {
      eyebrow: "Design process",
      title: "From one photo to a gift made just for them",
      subtitle:
        "You share the story, and Figure Lab supports you from the first preview through final delivery.",
      steps: [
        {
          step: "01",
          title: "Choose a design",
          description: "Select the frame and style you would like.",
        },
        {
          step: "02",
          title: "Share the details",
          description: "Send photos, outfits, interests and your message.",
        },
        {
          step: "03",
          title: "Review the preview",
          description: "Figure Lab sends a preview for your approval.",
        },
        {
          step: "04",
          title: "Receive the finished gift",
          description: "Your piece is completed, packaged and delivered.",
        },
      ],
    },
    categories: {
      eyebrow: "Gifts for every milestone",
      title: "More than graduation gifts",
      subtitle:
        "Every story can become a personalized minifigure frame made for the right person and occasion.",
      emptyTitle: "The collection is being updated.",
      errorDescription:
        "The catalog is temporarily unavailable. Please return later or open the Studio to start from scratch.",
      emptyDescription:
        "Gift themes will appear here as soon as Figure Lab data is synchronized.",
      card: {
        occasion: "By occasion",
        explore: "Explore",
        fallbackDescription:
          "Explore minifigure designs created especially for this milestone.",
      },
    },
    testimonials: {
      eyebrow: "Sample stories",
      title: "Stories Figure Lab can bring to life in a frame",
      subtitle:
        "Four illustrative scenarios used to preview the layout; these are not production customer reviews.",
      sampleLabel: "Sample content",
      ratingSuffix: "out of 5 stars",
      items: [
        {
          name: "Ngọc Mai",
          productType: "Graduation duo frame",
          quote:
            "You can recognize both of us instantly. From the outfit colors to the tiny camera, every detail reflects the story I shared.",
          rating: 5,
          isSample: true,
          seedTag: TESTIMONIAL_SAMPLE_SEED,
        },
        {
          name: "Phúc An",
          productType: "Graduation gift for a friend",
          quote:
            "The preview was adjusted very quickly. The finished frame feels refined and sturdy, and the message genuinely moved my friend.",
          rating: 5,
          isSample: true,
          seedTag: TESTIMONIAL_SAMPLE_SEED,
        },
        {
          name: "Linh Chi",
          productType: "Team appreciation frame",
          quote:
            "Every character has a personal detail while the whole piece still feels cohesive. It became our most memorable team gift.",
          rating: 5,
          isSample: true,
          seedTag: TESTIMONIAL_SAMPLE_SEED,
        },
        {
          name: "Bảo Trâm",
          productType: "Personalized birthday frame",
          quote:
            "The concept shows how colors, accessories and a personal note can come together in a gift made specifically for someone.",
          rating: 5,
          isSample: true,
          seedTag: TESTIMONIAL_SAMPLE_SEED,
        },
      ],
    },
    finalCta: {
      eyebrow: "Begin with your story",
      title: "Someone deserves a gift created only for them.",
      description:
        "Tell Figure Lab about the person you want to celebrate. We will help turn their story into a personalized minifigure frame.",
      primaryCta: { label: "Create a design", href: ROUTES.studio },
      secondaryCta: { label: "Talk to our team", href: ROUTES.business },
    },
    media: {
      alt: {
        hero: "Featured personalized minifigure design by Figure Lab",
        story: "A meaningful memory framed by Figure Lab",
        friendship: "A minifigure frame designed for a best friend",
        transformation: "A minifigure keepsake inspired by a real story",
        "final-cta": "A personalized minifigure gift by Figure Lab",
      },
      developmentBadge: "Development sample",
      unavailableLabel: "Figure Lab imagery is being updated",
      unavailableText: "This image is being synchronized from Figure Lab",
    },
  },
} satisfies Record<Locale, HomePageTranslation>;
