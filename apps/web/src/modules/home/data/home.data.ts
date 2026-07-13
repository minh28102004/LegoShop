import { ROUTES } from '@/config/routes'

import type {
  HomeCategory,
  HomeFeaturedProduct,
  HomeFinalCta,
  HomeHero,
  HomeOrderStep,
  HomeSocialPost,
  HomeStat,
  HomeStory,
  HomeTestimonial,
  HomeValueProp,
} from '@/modules/home/types/home.types'

export const HOME_HERO: HomeHero = {
  eyebrow: 'Modern creation',
  title: 'Biến những viên gạch thành tác phẩm nghệ thuật.',
  description:
    'Nâng tầm đam mê lắp ráp của bạn. Khung tranh cao cấp, thiết kế riêng để biến mỗi mô hình thành điểm nhấn nội thất sang trọng.',
  image:
    'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80',
  primaryCta: {
    label: 'Bắt đầu thiết kế',
    href: ROUTES.studio,
  },
  secondaryCta: {
    label: 'Khám phá bộ sưu tập',
    href: ROUTES.collection,
  },
  socialProof: 'đánh giá • 2.400+ đơn hàng',
  customerName: 'Khung Winston Nguyễn Khải',
  customerMeta: 'Khách couple kỷ niệm',
}

export const HOME_STATS: HomeStat[] = [
  { value: '2400+', label: 'Tác phẩm hoàn thiện' },
  { value: '4.9', label: 'Đánh giá trung bình' },
  { value: '75+', label: 'Mẫu thiết kế độc quyền' },
  { value: '98%', label: 'Khách hàng hài lòng' },
]

export const HOME_STORY: HomeStory = {
  eyebrow: 'Từ bộ sưu tập đến không gian sống',
  title: 'Một mô hình không nên nằm mãi trong tủ kính.',
  lead:
    'Chúng tôi tin rằng đam mê lắp ráp xứng đáng được tôn vinh như những tác phẩm nghệ thuật thực thụ.',
  paragraphs: [
    'Khung tranh BrickFrames không chỉ bảo vệ mô hình của bạn khỏi bụi bẩn, mà còn nâng tầm không gian sống, tạo điểm nhấn đầy cá tính cho căn phòng.',
    'Được chế tác thủ công từ các loại gỗ quý, kết hợp cùng kính chống lóa cao cấp, mỗi khung tranh là một tuyên ngôn về gu thẩm mỹ tinh tế của người sưu tầm.',
  ],
  image:
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=1200&q=80',
  cta: {
    label: 'Khám phá các chuyển tác dành riêng',
    href: ROUTES.collection,
  },
}

export const HOME_CATEGORIES: HomeCategory[] = [
  {
    title: 'Khung tranh Lego',
    description:
      'Lưu giữ kỷ niệm bằng khung tranh figure được thiết kế riêng theo câu chuyện của bạn.',
    href: ROUTES.collection,
    image:
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Love Notes',
    description:
      'Những lời nhắn dịu dàng được cất trong hộp quà tinh tế và đầy dụng ý.',
    href: ROUTES.collection,
    image:
      'https://images.unsplash.com/photo-1519222970733-f546218fa6d7?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Museum Box',
    description:
      'Mô hình mini trưng bày như một chiếc hộp kỷ niệm dành riêng cho khoảnh khắc đáng nhớ.',
    href: ROUTES.collection,
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Quà sinh nhật',
    description:
      'Từ thiệp, figure đến gift box theo concept riêng của người nhận.',
    href: ROUTES.occasions,
    image:
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Quà tốt nghiệp',
    description:
      'Món quà đánh dấu hành trình trưởng thành và khởi đầu mới thật tự hào.',
    href: ROUTES.occasions,
    image:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Quà kỷ niệm',
    description:
      'Tái hiện những cột mốc đáng nhớ để món quà vừa đẹp vừa mang nhiều cảm xúc.',
    href: ROUTES.occasions,
    image:
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=80',
  },
]

export const HOME_FEATURED_PRODUCTS: HomeFeaturedProduct[] = [
  {
    id: 'frame-figure',
    title: 'Khung tranh Lego cá nhân hóa',
    description:
      'Thiết kế figure theo trang phục, màu sắc và thông điệp riêng để món quà thật khác biệt.',
    priceLabel: 'Từ 1.250.000đ',
    image:
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=900&q=80',
    badge: 'Best seller',
    href: ROUTES.studio,
  },
  {
    id: 'love-notes',
    title: 'Love Notes Box',
    description:
      'Hộp quà lưu giữ lời nhắn, ảnh và những chi tiết rất riêng tư dành cho người nhận.',
    priceLabel: 'Từ 1.390.000đ',
    image:
      'https://images.unsplash.com/photo-1519222970733-f546218fa6d7?auto=format&fit=crop&w=900&q=80',
    badge: 'Signature',
    href: ROUTES.studio,
  },
  {
    id: 'museum-box',
    title: 'Museum Box kỷ niệm',
    description:
      'Một không gian trưng bày thu nhỏ để cất giữ ngày đáng nhớ theo cách thật đẹp.',
    priceLabel: 'Từ 1.590.000đ',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    badge: 'New',
    href: ROUTES.studio,
  },
  {
    id: 'graduation-figure',
    title: 'Quà tốt nghiệp mini figure',
    description:
      'Mini figure dành riêng cho cột mốc tốt nghiệp, gói trọn niềm tự hào của người nhận.',
    priceLabel: 'Từ 1.090.000đ',
    image:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80',
    badge: 'Gift idea',
    href: ROUTES.studio,
  },
  {
    id: 'couple-frame',
    title: 'Khung ảnh couple',
    description:
      'Khung kỷ niệm dành cho những khoảnh khắc bình yên và sâu sắc của hai người.',
    priceLabel: 'Từ 1.290.000đ',
    image:
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=80',
    badge: 'Romance',
    href: ROUTES.studio,
  },
  {
    id: 'birthday-box',
    title: 'Gift box sinh nhật',
    description:
      'Hộp quà sinh nhật cá nhân hóa, chỉn chu từ ảnh, lời chúc đến từng lớp mở quà.',
    priceLabel: 'Từ 1.750.000đ',
    image:
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80',
    badge: 'Limited',
    href: ROUTES.studio,
  },
  {
    id: 'classroom-appreciation',
    title: 'Quà tri ân lớp học',
    description:
      'Thiết kế đồng bộ cho cô giáo, lớp học và những dịp tổng kết giàu cảm xúc.',
    priceLabel: 'Liên hệ',
    image:
      'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=900&q=80',
    badge: 'Popular',
    href: ROUTES.business,
  },
  {
    id: 'corporate-kit',
    title: 'Set quà doanh nghiệp',
    description:
      'Bộ quà dành cho sự kiện, khách hàng VIP và những chiến dịch nội bộ cần độ chỉn chu cao.',
    priceLabel: 'Liên hệ',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    badge: 'B2B',
    href: ROUTES.business,
  },
]

export const HOME_VALUE_PROPS: HomeValueProp[] = [
  {
    title: 'Cá nhân hóa theo câu chuyện riêng',
    description:
      'Mỗi món quà được tinh chỉnh theo ảnh, lời nhắn và cảm xúc mà bạn muốn gửi trao.',
    icon: 'sparkles',
  },
  {
    title: 'Duyệt thiết kế trước khi sản xuất',
    description:
      'Bạn luôn được xem trước layout và góp ý chỉnh sửa trước khi chốt thành phẩm.',
    icon: 'drafting',
  },
  {
    title: 'Đóng gói tinh tế',
    description:
      'Bao bì, thiệp và cách trình bày đều được chăm chút để món quà thật trọn vẹn.',
    icon: 'gift',
  },
  {
    title: 'Hỗ trợ đơn số lượng lớn',
    description:
      'Phù hợp cho lớp học, công ty, workshop và các chiến dịch quà tặng đồng bộ.',
    icon: 'briefcase',
  },
]

export const HOME_ORDER_STEPS: HomeOrderStep[] = [
  {
    step: '1',
    title: 'Chọn sản phẩm',
    description:
      'Chọn concept quà, kích thước và phong cách phù hợp với dịp bạn muốn gửi gắm.',
  },
  {
    step: '2',
    title: 'Gửi ảnh & nội dung',
    description:
      'Chia sẻ hình ảnh, lời nhắn và những chi tiết cần cá nhân hóa cho đội ngũ thiết kế.',
  },
  {
    step: '3',
    title: 'Duyệt thiết kế',
    description:
      'Figure Lab gửi demo để bạn xác nhận trước khi bước vào giai đoạn hoàn thiện.',
  },
  {
    step: '4',
    title: 'Nhận món quà hoàn thiện',
    description:
      'Sản phẩm được hoàn thiện, đóng gói chỉn chu và giao đến tận tay người nhận.',
  },
]

export const HOME_TESTIMONIALS: HomeTestimonial[] = [
  {
    name: 'Ngọc Mai',
    role: 'Khung kỷ niệm 3 năm',
    quote:
      'Thiết kế rất tinh tế, lên màu đẹp và kể đúng câu chuyện của tụi mình hơn cả mong đợi.',
    rating: 5,
  },
  {
    name: 'Phúc An',
    role: 'Quà tốt nghiệp',
    quote:
      'Đội ngũ hỗ trợ chỉnh sửa demo rất nhanh. Thành phẩm nhận về chỉn chu và sang hơn ảnh mẫu.',
    rating: 5,
  },
  {
    name: 'Linh Chi',
    role: 'Quà doanh nghiệp',
    quote:
      'Bên mình đặt số lượng lớn cho sự kiện nội bộ và được hỗ trợ từ concept đến đóng gói rất ổn.',
    rating: 5,
  },
]

export const HOME_SOCIAL_POSTS: HomeSocialPost[] = [
  {
    id: 'social-1',
    image:
      'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80',
    alt: 'Figure Lab unboxing moment',
  },
  {
    id: 'social-2',
    image:
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=900&q=80',
    alt: 'Figure Lab frame gift',
  },
  {
    id: 'social-3',
    image:
      'https://images.unsplash.com/photo-1519222970733-f546218fa6d7?auto=format&fit=crop&w=900&q=80',
    alt: 'Figure Lab gift box detail',
  },
  {
    id: 'social-4',
    image:
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=80',
    alt: 'Figure Lab couple keepsake',
  },
]

export const HOME_FINAL_CTA: HomeFinalCta = {
  eyebrow: '@figurelab.vn',
  title: 'Khi món quà được kể bằng gu thẩm mỹ của riêng bạn.',
  description:
    'Từ tranh khung, museum box đến set quà theo concept, Figure Lab đồng hành cùng bạn để biến kỷ niệm thành một tác phẩm đáng giữ lâu dài.',
  primaryCta: {
    label: 'Bắt đầu thiết kế quà',
    href: ROUTES.studio,
  },
  secondaryCta: {
    label: 'Nhận tư vấn doanh nghiệp',
    href: ROUTES.business,
  },
}
