import type { Locale } from "@/lib/i18n/config";

const createStudioTranslations = (locale: Locale) => {
  const vi = locale === "vi";

  return {
    header: {
      saveDesign: vi ? "Lưu thiết kế" : "Save design",
      reviewDesign: vi ? "Xem lại thiết kế" : "Review design",
      saving: vi ? "Đang lưu..." : "Saving...",
    },
    steps: vi
      ? [
          "Chọn khung",
          "Mẫu nền",
          "Nội dung",
          "Nhân vật & phụ kiện",
          "Hoàn tất",
        ]
      : [
          "Choose frame",
          "Background",
          "Content",
          "Characters & accessories",
          "Complete",
        ],
    workflow: {
      frame: vi ? "Chọn khung" : "Choose frame",
      background: vi ? "Mẫu nền" : "Background",
      content: vi ? "Nội dung" : "Content",
      characters: vi ? "Nhân vật & phụ kiện" : "Characters & accessories",
      review: vi ? "Hoàn tất" : "Complete",
    },
    common: {
      retry: vi ? "Thử lại" : "Retry",
      loading: vi ? "Đang tải..." : "Loading...",
      cancel: vi ? "Hủy" : "Cancel",
      close: vi ? "Đóng" : "Close",
      next: vi ? "Tiếp theo" : "Next",
      back: vi ? "Quay lại" : "Back",
      all: vi ? "Tất cả" : "All",
      search: vi ? "Tìm kiếm" : "Search",
      remove: vi ? "Xóa" : "Remove",
      edit: vi ? "Chỉnh sửa" : "Edit",
      free: vi ? "Miễn phí" : "Free",
      selected: vi ? "đã chọn" : "selected",
      optional: vi ? "Không bắt buộc" : "Optional",
      today: vi ? "Hôm nay" : "Today",
      clearDate: vi ? "Xóa ngày" : "Clear date",
      previousMonth: vi ? "Tháng trước" : "Previous month",
      nextMonth: vi ? "Tháng sau" : "Next month",
      chooseUpload: vi ? "Chọn ảnh tải lên" : "Choose an image to upload",
      closePanel: vi ? "Đóng bảng công cụ" : "Close tool panel",
      openPanel: vi ? "Mở bảng công cụ" : "Open tool panel",
      studioTools: vi ? "Công cụ thiết kế" : "Design tools",
    },
    sidebar: {
      tabs: {
        frame: vi ? "Khung" : "Frame",
        background: vi ? "Mẫu nền" : "Background",
        image: vi ? "Hình ảnh" : "Image",
        templates: vi ? "Mẫu thiết kế" : "Templates",
        uploads: vi ? "Tải ảnh lên" : "Upload",
        text: vi ? "Văn bản" : "Text",
        assets: vi ? "Phụ kiện" : "Accessories",
        characters: vi ? "Nhân vật" : "Characters",
        accessories: vi ? "Phụ kiện" : "Accessories",
        layers: vi ? "Lớp thiết kế" : "Layers",
      },
      searchTemplates: vi ? "Tìm mẫu thiết kế..." : "Search templates...",
      searchAccessories: vi ? "Tìm phụ kiện..." : "Search accessories...",
      noTemplates: vi ? "Chưa có mẫu thiết kế nào" : "No templates yet",
      noTemplateMatches: vi
        ? "Không tìm thấy mẫu phù hợp"
        : "No matching templates",
      noTemplatesDescription: vi
        ? "Khi có mẫu mới, danh sách sẽ hiển thị tại đây."
        : "New templates will appear here when available.",
      noMatchesDescription: vi
        ? "Thử nhập từ khóa khác hoặc xóa nội dung tìm kiếm."
        : "Try another keyword or clear the search.",
      loadMore: (visible: number, total: number) =>
        vi
          ? `Xem thêm (${visible}/${total})`
          : `Load more (${visible}/${total})`,
      yourPhoto: vi ? "Ảnh của bạn" : "Your photo",
      uploading: vi ? "Đang tải ảnh..." : "Uploading...",
      uploadBackground: vi ? "Tải ảnh nền lên" : "Upload background",
      uploadFormats: vi
        ? "Hỗ trợ JPG, PNG, WEBP"
        : "JPG, PNG and WEBP supported",
      uploadError: vi ? "Không tải được ảnh lên" : "Could not upload the image",
      titleText: vi ? "Tiêu đề lớn" : "Large title",
      titleTextHint: vi ? "Thêm dòng chữ nổi bật" : "Add a prominent heading",
      bodyText: vi ? "Đoạn văn bản" : "Body text",
      bodyTextHint: vi ? "Thêm đoạn mô tả ngắn" : "Add a short description",
      captionText: vi ? "Chú thích" : "Caption",
      captionTextHint: vi ? "Thêm dòng phụ nhỏ" : "Add small supporting text",
      defaultBodyText: vi ? "Thêm nội dung văn bản" : "Add text content",
      accessoriesLabel: vi ? "Phụ kiện" : "Accessories",
      noAccessories: vi ? "Chưa có phụ kiện nào" : "No accessories yet",
      noAccessoryMatches: vi
        ? "Không tìm thấy phụ kiện phù hợp"
        : "No matching accessories",
      noAccessoriesDescription: vi
        ? "Bạn có thể dùng sticker nhanh bên dưới trong lúc chờ thêm phụ kiện."
        : "You can use the quick stickers below while accessories are added.",
      selectedCharms: (count: number) =>
        vi ? `${count} charm đã chọn` : `${count} charms selected`,
      noLayers: vi ? "Chưa có lớp thiết kế nào" : "No design layers yet",
      noLayersDescription: vi
        ? "Khi bạn thêm chữ, nhân vật hoặc phụ kiện, các lớp sẽ xuất hiện tại đây."
        : "Text, characters and accessories will appear here after you add them.",
      layerTypes: {
        text: vi ? "Văn bản" : "Text",
        character: vi ? "Nhân vật" : "Character",
        accessory: vi ? "Phụ kiện" : "Accessory",
      },
      quickStickers: {
        sparkles: vi ? "Lấp lánh" : "Sparkles",
        gift: vi ? "Hộp quà" : "Gift",
        camera: vi ? "Máy ảnh" : "Camera",
        palette: vi ? "Bảng màu" : "Palette",
        graduation: vi ? "Tốt nghiệp" : "Graduation",
        package: vi ? "Gói quà" : "Package",
      },
      addNamedItem: (name: string) => (vi ? `Thêm ${name}` : `Add ${name}`),
      removeLayer: vi ? "Xóa lớp" : "Remove layer",
      settingsUnavailable: vi
        ? "Cài đặt nâng cao sẽ được hoàn thiện ở Phase 5"
        : "Advanced settings will be completed in Phase 5",
    },
    canvas: {
      preview: vi ? "ẢNH XEM TRƯỚC" : "DESIGN PREVIEW",
      resetZoom: vi ? "Đặt lại thu phóng" : "Reset zoom",
      fitCanvas: vi ? "Vừa khung làm việc" : "Fit canvas",
      actualSize: vi ? "Kích thước 100%" : "Actual size",
      zoomOut: vi ? "Thu nhỏ" : "Zoom out",
      zoomIn: vi ? "Phóng to" : "Zoom in",
      addText: vi ? "Thêm chữ" : "Add text",
      newText: vi ? "Văn bản mới" : "New text",
      addImage: vi ? "Thêm hình ảnh" : "Add image",
      image: vi ? "Hình ảnh" : "Image",
      undo: vi ? "Hoàn tác" : "Undo",
      redo: vi ? "Làm lại" : "Redo",
      delete: vi ? "Xóa phần tử" : "Delete element",
      share: vi ? "Chia sẻ" : "Share",
      shareUnavailable: vi
        ? "Chia sẻ thiết kế sẽ được hoàn thiện ở Phase 5"
        : "Design sharing will be completed in Phase 5",
      emptyTitle: vi ? "Khu vực thiết kế" : "Design area",
      emptyDescription: vi
        ? "Chọn mẫu hoặc thêm chữ và phụ kiện để bắt đầu"
        : "Choose a template or add text and accessories to begin",
      uploadError: vi ? "Không tải được ảnh lên" : "Could not upload the image",
    },
    panels: {
      selectSize: vi ? "Chọn kích thước" : "Choose a size",
      noFrame: vi ? "Chưa có kích thước khung." : "No frame size is available.",
      popular: vi ? "Phổ biến" : "Popular",
      frameColor: vi ? "Màu khung" : "Frame color",
      frameColorFallback: vi ? "Màu khung" : "Frame color",
      white: vi ? "Trắng" : "White",
      content: vi ? "Nội dung thiết kế" : "Design content",
      chooseBackground: vi ? "Chọn mẫu nền" : "Choose a background",
      backgroundCount: (count: number) =>
        vi ? `${count} mẫu` : `${count} templates`,
      yourBackground: vi ? "Ảnh của bạn" : "Your image",
      noBackgrounds: vi ? "Chưa có mẫu nào" : "No templates available",
      uploadingBackground: vi ? "Đang tải ảnh..." : "Uploading image...",
      uploadBackground: vi
        ? "Tải ảnh nền của bạn lên"
        : "Upload your background image",
      clearAll: vi ? "Xóa tất cả" : "Clear all",
      customImage: vi ? "Ảnh tùy chỉnh" : "Custom image",
      customBackground: vi ? "Ảnh nền tùy chỉnh" : "Custom background",
      customProduct: vi ? "Khung LEGO tùy chỉnh" : "Custom LEGO frame",
      accessoryFallback: vi ? "Phụ kiện" : "Accessory",
      characterFallback: (index: number) =>
        vi ? `NV ${index}` : `Character ${index}`,
      clearImage: vi ? "Xóa ảnh" : "Clear image",
      imageUploadHint: vi
        ? "JPG, PNG hoặc WEBP. Tối đa 10 MB."
        : "JPG, PNG or WEBP. Up to 10 MB.",
      characters: vi ? "Nhân vật LEGO" : "LEGO characters",
      manageCharacters: vi ? "Quản lý nhân vật" : "Manage characters",
      randomCharacter: vi ? "Ngẫu nhiên" : "Randomize",
      randomCharacterTitle: vi
        ? "Tạo nhanh nhân vật ngẫu nhiên"
        : "Create a random character",
      addCharacter: vi ? "Thêm nhân vật" : "Add character",
      addShort: vi ? "Thêm" : "Add",
      createCharacter: vi ? "Tạo nhân vật LEGO" : "Create a LEGO character",
      editCharacter: vi ? "Chỉnh sửa nhân vật" : "Edit character",
      removeCharacterTitle: vi ? "Xóa nhân vật" : "Remove character",
      removeCharacter: (name: string) =>
        vi ? `Xóa ${name} khỏi thiết kế?` : `Remove ${name} from the design?`,
      noCharacters: vi
        ? "Chưa có nhân vật trong thiết kế."
        : "There are no characters in the design yet.",
      noCharactersHint: vi
        ? 'Nhấn "+ Thêm" để thêm nhân vật vào khung.'
        : 'Select "+ Add" to add a character to the frame.',
      characterTotal: vi ? "Tổng nhân vật" : "Character total",
      accessories: vi ? "Phụ kiện" : "Accessories",
      accessoriesAndCharms: vi
        ? "Thêm phụ kiện & Charm"
        : "Add accessories & charms",
      searchAccessories: vi
        ? "Tìm phụ kiện (hoa, xe, bóng bay...)"
        : "Search accessories (flowers, cars, balloons...) ",
      noAccessories: vi ? "Chưa có phụ kiện." : "No accessories selected.",
      noAccessoriesAvailable: vi
        ? "Chưa có phụ kiện hoặc charm nào"
        : "No accessories or charms are available",
      noAccessoryMatches: vi
        ? "Không tìm thấy phụ kiện phù hợp"
        : "No matching accessories",
      selectedCharms: (count: number) =>
        vi ? `${count} charm đã chọn` : `${count} charms selected`,
      builderSubtitleCreate: vi
        ? "Chọn đủ khuôn mặt, tóc, áo và quần"
        : "Choose a face, hair, torso and legs",
      builderSubtitleEdit: vi
        ? "Sửa lựa chọn bộ phận cho nhân vật"
        : "Edit this character's parts",
      presetHelp: vi
        ? "Chọn mẫu có sẵn để điền nhanh. Bạn vẫn có thể sửa từng bộ phận sau khi chọn."
        : "Choose a preset to start quickly. You can still edit every part afterward.",
      applyPreset: vi ? "Áp dụng" : "Apply",
      fallbackPresets: vi
        ? [
            ["Nam tốt nghiệp", "Tóc nam + mũ tốt nghiệp"],
            ["Nữ tốt nghiệp", "Tóc nữ + mũ tốt nghiệp"],
            ["Đôi đỏ", "Áo và quần đỏ"],
            ["Đôi đen", "Áo và quần đen"],
            ["Nam thường ngày", "Tóc nam tự nhiên"],
            ["Nữ thường ngày", "Tóc nữ tự nhiên"],
          ]
        : [
            ["Graduation man", "Men's hair + graduation cap"],
            ["Graduation woman", "Women's hair + graduation cap"],
            ["Red couple", "Red torso and legs"],
            ["Black couple", "Black torso and legs"],
            ["Casual man", "Natural men's hair"],
            ["Casual woman", "Natural women's hair"],
          ],
      noPartsTitle: vi
        ? "Chưa có bộ phận trong nhóm này"
        : "No parts in this group",
      noPartsAdminHint: vi
        ? "Thêm bộ phận trong Admin để khách có thể chọn trong Studio."
        : "Add parts in Admin so customers can select them in Studio.",
      noPartsForColor: vi
        ? "Không có bộ phận màu này"
        : "No parts match this color",
      noSelection: vi ? "Không chọn" : "None",
      characterBaseLine: vi ? "1 nhân vật" : "1 character",
      partFee: vi ? "bộ phận" : "parts",
      requiredPart: (label: string) =>
        vi
          ? `Vui lòng chọn ${label.toLowerCase()}`
          : `Please choose ${label.toLowerCase()}`,
      requiredCharacterParts: vi
        ? "Vui lòng chọn đủ bộ phận nhân vật"
        : "Please choose all required character parts",
      review: vi ? "Chi tiết thiết kế" : "Design details",
      total: vi ? "Tổng cộng" : "Total",
      shippingNote: vi
        ? "Chưa bao gồm phí ship. Shop báo phí trước khi giao."
        : "Shipping is not included. We will confirm it before delivery.",
      addToCart: vi ? "Thêm vào giỏ hàng" : "Add to cart",
      updateCart: vi ? "Cập nhật thiết kế" : "Update design",
      buyNow: vi ? "Thanh toán ngay" : "Checkout now",
      character: vi ? "Nhân vật" : "Character",
      quantity: vi ? "Số lượng" : "Quantity",
      estimatedPrice: vi ? "Giá tạm tính:" : "Estimated price:",
      completeContent: vi ? "Điền nội dung" : "Complete content",
      characterUnit: vi ? "NV" : "characters",
      characterShort: vi ? "NV" : "Character",
      designSummary: vi ? "Tóm tắt thiết kế" : "Design summary",
      frame: vi ? "Khung" : "Frame",
      background: vi ? "Nền" : "Background",
      note: vi ? "Ghi chú" : "Note",
      characterName: vi ? "Tên nhân vật" : "Character name",
      characterNamePlaceholder: vi ? "Ví dụ: NV 1" : "Example: Character 1",
      chooseParts: vi
        ? "Chọn khuôn mặt, tóc, áo, quần và phụ kiện"
        : "Choose a face, hair, torso, legs and accessories",
      presets: vi ? "Mẫu có sẵn" : "Presets",
      face: vi ? "Khuôn mặt" : "Face",
      hair: vi ? "Tóc" : "Hair",
      torso: vi ? "Áo" : "Torso",
      legs: vi ? "Quần" : "Legs",
      hat: vi ? "Mũ" : "Hat",
      characterAccessories: vi ? "Phụ kiện" : "Accessories",
      noParts: vi ? "Chưa có lựa chọn phù hợp." : "No matching options.",
      saveCharacter: vi ? "Lưu nhân vật" : "Save character",
      required: vi ? "Bắt buộc" : "Required",
      promo: vi ? "Ưu đãi thiết kế" : "Design offer",
      promoTitle: vi ? "ƯU ĐÃI PHÚT CHÓT!" : "LAST-MINUTE OFFER!",
      promoDescription: vi
        ? "Hoàn tất thiết kế ngay để nhận 1 sticker quà tặng"
        : "Complete your design now to receive a free sticker",
      earlyBirdTitle: vi ? "Mẹo: Đặt sớm" : "Tip: Order early",
      earlyBirdDescription: vi
        ? "Sản phẩm cần 1-2 ngày hoàn thiện. Chọn ngày nhận sau 20 ngày để được giảm ngay 5%!"
        : "Production takes 1-2 days. Choose a delivery date more than 20 days away to receive 5% off!",
      colorPrefix: vi ? "Màu" : "Color",
      shippingBanner: vi
        ? "Phí vận chuyển chưa cộng vào đơn. Shop sẽ báo phí trước khi giao và khách trả trực tiếp cho tài xế."
        : "Shipping is not included in the order. We will confirm the fee before delivery, and you can pay the driver directly.",
      payment: vi ? "Thanh toán" : "Payment",
    },
    defaults: {
      contentFields: [
        {
          key: "title",
          label: vi ? "Tên / lời tựa ngắn" : "Name / short title",
          type: "text" as const,
          required: true,
          placeholder: vi ? "VD: Tú & Lan" : "Example: Alex & Jamie",
        },
        {
          key: "date",
          label: vi ? "Ngày kỷ niệm" : "Special date",
          type: "date" as const,
          required: false,
          placeholder: vi ? "VD: 01/06/2026" : "Example: 06/01/2026",
        },
        {
          key: "message",
          label: vi ? "Lời nhắn" : "Message",
          type: "textarea" as const,
          required: false,
          placeholder: vi ? "Nhập lời nhắn gửi..." : "Write your message...",
        },
      ],
      fieldLabel: (index: number) =>
        vi ? `Thông tin ${index}` : `Information ${index}`,
    },
    resources: {
      frameSizesError: vi
        ? "Không thể tải kích thước khung."
        : "Could not load frame sizes.",
      charactersError: vi
        ? "Không thể tải nhân vật."
        : "Could not load characters.",
      characterPartsError: vi
        ? "Không thể tải bộ phận nhân vật."
        : "Could not load character parts.",
      characterPresetsError: vi
        ? "Không thể tải mẫu nhân vật."
        : "Could not load character presets.",
      templatesError: vi
        ? "Không thể tải mẫu nền."
        : "Could not load background templates.",
      templateCategoriesError: vi
        ? "Không thể tải danh mục mẫu nền."
        : "Could not load template categories.",
      accessoriesError: vi
        ? "Không thể tải phụ kiện."
        : "Could not load accessories.",
      accessoryCategoriesError: vi
        ? "Không thể tải danh mục phụ kiện."
        : "Could not load accessory categories.",
    },
    validation: {
      frameRequired: vi
        ? "Vui lòng chọn kích thước khung."
        : "Please choose a frame size.",
      fieldRequired: (label: string) =>
        vi
          ? `Vui lòng nhập ${label.toLowerCase()}.`
          : `Please enter ${label.toLowerCase()}.`,
      previewRequired: vi
        ? "Vui lòng chọn mẫu nền hoặc tải ảnh thiết kế."
        : "Please choose a background template or upload an image.",
    },
    toast: {
      saveSuccess: vi
        ? "Đã lưu thiết kế thành công."
        : "Your design has been saved.",
      saveError: vi
        ? "Không thể lưu thiết kế. Vui lòng thử lại."
        : "Could not save the design. Please try again.",
      authRequired: vi
        ? "Vui lòng đăng nhập để lưu thiết kế."
        : "Please sign in to save your design.",
      validationError: vi
        ? "Vui lòng hoàn tất các thông tin bắt buộc."
        : "Please complete the required information.",
      resourceError: vi
        ? "Một số dữ liệu Studio chưa tải được. Bạn có thể thử lại từng phần."
        : "Some Studio data could not be loaded. You can retry each section.",
      previewError: vi
        ? "Không thể chuẩn bị ảnh xem trước. Vui lòng thử lại."
        : "Could not prepare the preview image. Please try again.",
      restoreMissing: vi
        ? "Không tìm thấy thiết kế trong giỏ hàng. Bạn có thể bắt đầu thiết kế mới."
        : "The cart design could not be found. You can start a new design instead.",
    },
  };
};

export type StudioTranslations = ReturnType<typeof createStudioTranslations>;

export function getStudioTranslations(locale: Locale): StudioTranslations {
  return createStudioTranslations(locale);
}
