import type { Locale } from "@/lib/i18n/config";

export type ProductDetailLabels = {
  customBadge: string;
  orders: string;
  characters: string;
  charms: string;
  basePrice: string;
  chooseTemplate: string;
  consultation: string;
  consultationMessage: (productName: string) => string;
  frameColorTemplate: string;
  previousImage: string;
  nextImage: string;
  close: string;
  loading: string;
  loadError: string;
  retry: string;
  chooseSize: string;
  recommended: string;
  framePriceNote: string;
  included: string;
  includedEmpty: string;
  customizable: string;
  customizableEmpty: string;
  characterSection: string;
  characterEmpty: string;
  accessorySection: string;
  accessoryEmpty: string;
  addAccessory: string;
  removeAccessory: string;
  orderNote: string;
  notePlaceholder: string;
  total: string;
  addToCart: string;
  buyNow: string;
  addedToCart: string;
  noteRequired: string;
  noFrameSize: string;
  quantity: string;
};

export const PRODUCT_DETAIL_TRANSLATIONS: Record<
  Locale,
  ProductDetailLabels
> = {
  vi: {
    customBadge: "100% tùy chỉnh",
    orders: "lượt đặt hàng",
    characters: "nhân vật",
    charms: "charm",
    basePrice: "Giá cơ bản",
    chooseTemplate: "Chọn mẫu này",
    consultation: "Tư vấn mẫu này",
    consultationMessage: (productName) => `Tôi cần tư vấn mẫu ${productName}`,
    frameColorTemplate: "Theo mẫu",
    previousImage: "Ảnh trước",
    nextImage: "Ảnh tiếp theo",
    close: "Đóng chi tiết mẫu",
    loading: "Đang tải cấu hình mẫu...",
    loadError: "Không tải được chi tiết mẫu.",
    retry: "Thử lại",
    chooseSize: "Chọn kích thước",
    recommended: "Khuyên dùng",
    framePriceNote:
      "Giá hiển thị là giá ước tính theo kích thước. Giá cuối cùng được xác nhận khi duyệt thiết kế.",
    included: "Sản phẩm bao gồm",
    includedEmpty: "Các hạng mục đi kèm sẽ được xác nhận khi duyệt mẫu.",
    customizable: "Thông tin có thể tùy chỉnh",
    customizableEmpty:
      "Figure Lab sẽ liên hệ để xác nhận tên, ngày, ảnh và lời nhắn theo mẫu.",
    characterSection: "Nhân vật theo mẫu",
    characterEmpty:
      "Mẫu chưa gắn nhân vật mặc định. Bạn có thể bổ sung trong Studio.",
    accessorySection: "Charm / phụ kiện theo mẫu",
    accessoryEmpty: "Mẫu chưa có phụ kiện mặc định.",
    addAccessory: "Thêm phụ kiện",
    removeAccessory: "Bỏ phụ kiện",
    orderNote: "Ghi chú đơn hàng",
    notePlaceholder: "Ví dụ: đổi tên, ngày, màu sắc hoặc lời nhắn...",
    total: "Tổng cộng",
    addToCart: "Thêm vào giỏ hàng",
    buyNow: "Mua ngay",
    addedToCart: "Đã thêm mẫu vào giỏ hàng",
    noteRequired: "Vui lòng nhập ghi chú tùy chỉnh trước khi tiếp tục.",
    noFrameSize: "Sản phẩm chưa có kích thước khung khả dụng.",
    quantity: "Số lượng",
  },
  en: {
    customBadge: "100% customizable",
    orders: "orders",
    characters: "characters",
    charms: "charms",
    basePrice: "Base price",
    chooseTemplate: "Choose this template",
    consultation: "Get template advice",
    consultationMessage: (productName) =>
      `I need advice about the ${productName} template`,
    frameColorTemplate: "As shown",
    previousImage: "Previous image",
    nextImage: "Next image",
    close: "Close template details",
    loading: "Loading template configuration...",
    loadError: "Unable to load template details.",
    retry: "Try again",
    chooseSize: "Choose a frame size",
    recommended: "Recommended",
    framePriceNote:
      "Displayed prices are estimates by size. The final price is confirmed during design approval.",
    included: "What is included",
    includedEmpty: "Included items will be confirmed during design approval.",
    customizable: "Customizable information",
    customizableEmpty:
      "Figure Lab will contact you to confirm names, dates, photos and messages for this template.",
    characterSection: "Template characters",
    characterEmpty:
      "This template has no default character yet. You can add one in the Studio.",
    accessorySection: "Template charms / accessories",
    accessoryEmpty: "This template has no default accessory.",
    addAccessory: "Add accessory",
    removeAccessory: "Remove accessory",
    orderNote: "Order note",
    notePlaceholder: "For example: change the name, date, colors or message...",
    total: "Total",
    addToCart: "Add to cart",
    buyNow: "Buy now",
    addedToCart: "Template added to cart",
    noteRequired: "Please add a customization note before continuing.",
    noFrameSize: "No frame size is currently available for this product.",
    quantity: "Quantity",
  },
};
