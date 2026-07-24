# FIGURE LAB — CONTENT, MEDIA IMPORT & HOMEPAGE FINALIZATION

> Tài liệu kỹ thuật để Codex hoàn thiện Homepage, đưa ảnh mẫu về storage của Figure Lab, seed dữ liệu Backend/Database và cung cấp dữ liệu mẫu cho Studio.

## 1. Mục tiêu

1. Cân chỉnh toàn bộ Homepage về bố cục, mật độ, chiều rộng section và responsive.
2. Không hotlink Firebase URL của website nguồn trong runtime.
3. Tải ảnh từ manifest, kiểm tra, khử trùng lặp và upload sang storage do Figure Lab quản lý.
4. Ghi URL mới vào Backend/Database theo schema thật của dự án.
5. Homepage, Bộ sưu tập và các page liên quan dùng dữ liệu/API thật.
6. Studio có ảnh nền và charm mẫu để test end-to-end.
7. Import có dry-run, idempotency, báo cáo và rollback.

## 2. Tệp đầu vào

Đặt các tệp sau trong repository:

```text
docs/README_FIGURE_LAB_CONTENT_IMPORT.md
data/import/theluvin-source.normalized.json
```

Manifest hiện chứa:

- 23 bản ghi ảnh Homepage.
- 47 bản ghi ảnh Bộ sưu tập.
- 48 ảnh nền Studio.
- 92 charm/phụ kiện Studio.
- 210 bản ghi tổng cộng.
- 202 URL nguồn không trùng.
- 7 URL trùng giữa Homepage và Bộ sưu tập.

Các charm có `rawName = "🎨"` đã được sửa `name` theo trường `alt`.

## 3. Điều kiện sử dụng asset

Chỉ chạy import khi chủ dự án có quyền sử dụng các ảnh mẫu.

Không lưu URL Firebase nguồn trực tiếp vào dữ liệu production. URL nguồn chỉ dùng để tải một lần. Sau đó phải:

1. Validate URL và response.
2. Validate MIME thực tế.
3. Giới hạn kích thước tải.
4. Tính SHA-256.
5. Khử trùng lặp.
6. Giữ PNG khi cần transparency.
7. Tối ưu ảnh sản phẩm/background sang WebP hoặc AVIF nếu phù hợp.
8. Upload sang storage của Figure Lab.
9. Chỉ lưu URL mới của Figure Lab vào database.

## 4. Kiến trúc dự án hiện tại

Monorepo pnpm/Turborepo:

```text
apps/web
apps/admin
apps/backend
packages/api
packages/assets
packages/hooks
packages/shared
packages/ui
```

Web:

- Next.js 16 App Router.
- React 19.
- TypeScript strict.
- Tailwind CSS 4.
- Lucide.
- Framer Motion.
- Zustand/Immer.
- Zod.
- Radix.
- react-hot-toast.

Các API/public flow đã được biết:

```text
GET /public/products
GET /public/templates
GET /public/accessories
GET /public/frame-backgrounds
GET /public/collections
POST /uploads/image
```

Upload folder hiện có thể gồm:

```text
products
templates
accessories
banners
collections
studio-uploads
```

Codex phải audit schema và service thật trước khi triển khai. Không được giả định tên bảng hoặc field.

## 5. Nguyên tắc mapping dữ liệu

### 5.1 Homepage

Ưu tiên cập nhật dữ liệu hiện có thay vì tạo bản ghi trùng.

Mapping đề xuất:

- Hero/Story/Final CTA → banner hoặc site-content hiện có.
- Featured Products → product records hiện có.
- Category cards → collections.
- Testimonials → dữ liệu testimonial hiện có hoặc seed content riêng nếu hệ thống đã hỗ trợ.

Khi chưa có CMS/site-content:

- Chọn thay đổi nhỏ nhất.
- Không tạo một hệ CMS lớn chỉ để thay vài ảnh.
- Có thể tạo bảng/collection `site_content_blocks` tối thiểu nếu thật sự cần:
  - `key`
  - `locale`
  - `title`
  - `description`
  - `imageUrl`
  - `metadata`
  - `isActive`
  - `sortOrder`
  - `seedTag`

### 5.2 Bộ sưu tập

Ưu tiên:

1. Gắn ảnh vào Product/Collection hiện có.
2. Chỉ tạo sample product khi không có record tương ứng.
3. Sample record phải có `seedTag`.
4. Không ghi đè giá production bằng dữ liệu nguồn.
5. Backend vẫn là nguồn giá chính.

### 5.3 Ảnh nền Studio

Ảnh nền phải map vào entity thật đang phục vụ:

```text
GET /public/frame-backgrounds
```

Hoặc entity Template nếu codebase thực tế dùng Template cho background.

Dữ liệu tối thiểu:

- name
- slug
- categoryId/category
- imageUrl
- thumbnailUrl nếu có
- naturalWidth
- naturalHeight
- isActive
- sortOrder
- seedTag
- sourceKey/metadata

Category gợi ý:

```text
graduation
birthday
anniversary
wedding
love
sports
family
career
travel
christmas
other
```

### 5.4 Charm/phụ kiện

Map vào Accessory và AccessoryCategory hiện có.

Dữ liệu tối thiểu:

- name
- slug
- categoryId
- imageUrl
- price hoặc priceDelta bằng integer VND
- originalPrice chỉ lưu nếu schema hỗ trợ
- naturalWidth
- naturalHeight
- isActive
- sortOrder
- seedTag
- sourceKey/metadata

Không lưu chuỗi giá như `15.000 ₫`. Manifest đã chuẩn hóa thành integer, ví dụ `15000`.

## 6. Import pipeline bắt buộc

Tạo script theo convention của backend, ví dụ:

```text
apps/backend/src/scripts/import-sample-media.ts
```

Hoặc vị trí tương đương trong codebase.

Script cần hỗ trợ:

```bash
--manifest <path>
--dry-run
--apply
--rollback <seedTag>
--only homepage|collection|backgrounds|charms
--concurrency <number>
--resume
```

Biến môi trường đề xuất:

```env
IMPORT_SAMPLE_ASSETS=true
IMPORT_SOURCE_MANIFEST=data/import/theluvin-source.normalized.json
IMPORT_SEED_TAG=figure-lab-sample-media-20260717
IMPORT_DOWNLOAD_TIMEOUT_MS=20000
IMPORT_MAX_FILE_BYTES=15000000
IMPORT_CONCURRENCY=4
```

### Quy trình mỗi asset

1. Đọc manifest.
2. Validate schema bằng Zod.
3. Kiểm tra `sourceKey`.
4. Bỏ qua record đã import thành công.
5. Download với timeout và AbortSignal.
6. Chỉ cho phép HTTPS.
7. Chỉ cho phép MIME ảnh.
8. Từ chối HTML giả ảnh.
9. Tính SHA-256.
10. Khử trùng lặp theo hash.
11. Xác định transparency.
12. Tối ưu định dạng.
13. Upload bằng storage service hiện có.
14. Nhận URL mới.
15. Upsert database bằng transaction/batch an toàn.
16. Ghi import log.
17. Tiếp tục các record khác khi một record lỗi.
18. Xuất report JSON/Markdown.

Không gọi public upload HTTP endpoint nếu backend có thể dùng trực tiếp upload/storage service nội bộ.

## 7. Idempotency và rollback

Mỗi record cần có ít nhất một trong các cách nhận diện:

- `sourceKey`.
- `sourceHash`.
- `seedTag`.
- Metadata JSON.

Chạy lại script không được tạo duplicate.

Rollback phải:

1. Xóa hoặc deactivate DB records thuộc `seedTag`.
2. Chỉ xóa storage object do import này tạo.
3. Không xóa asset được record production khác sử dụng.
4. Xuất báo cáo những object không thể xóa.

## 8. Hoàn thiện Homepage

### Hero

- Giảm tổng chiều cao khoảng 15–20%.
- Không dùng `min-h-screen`.
- H1 desktop khoảng 50–56px; 1280px khoảng 46–52px.
- Giảm visual Hero 8–15%.
- Desktop phổ biến phải nhìn thấy Hero và một phần Trust Bar.
- Text column có max-width riêng.
- Ảnh sản phẩm vẫn là visual chính.

### Featured Products

- Dùng wide container.
- 5 cột tại desktop đủ rộng, ưu tiên từ 1440/1536px khi card đạt tối thiểu khoảng 250–270px.
- 4 cột tại khoảng 1280px.
- 3 cột tại laptop nhỏ khi cần.
- 2 cột tablet.
- 1 cột mobile.
- Card gọn, đồng chiều cao.
- Ảnh không méo.
- Footer giá/CTA dùng `margin-top: auto`.
- Không giảm text xuống khó đọc.

### Category Section

- Dùng wide container khoảng 1400–1480px.
- Giữ 6 category theo grid 3x2 trên desktop.
- Card ngang phải có đủ width để `Quà doanh nghiệp` không cao bất thường.
- Image column và text column có tỷ lệ ổn định.
- Tất cả card đồng chiều cao.
- 2 cột tablet, 1 cột mobile.
- Không truncate title.
- Description clamp thống nhất.

### Testimonials

- Thêm feedback thứ tư, nội dung thật hoặc sample có nhãn seed.
- 4 cột desktop rộng.
- 2 cột tablet.
- 1 cột mobile.
- Card đồng chiều cao.
- Quote dùng line clamp hợp lý hoặc layout flex.
- Không tạo khoảng trắng cuối section quá lớn.

### Final CTA

Dùng full-bleed:

```text
section background navy chạy hết viewport
└── inner wide container 1400–1480px
```

- Không để card navy nhỏ nằm giữa nền trắng quá rộng.
- Nội dung không sát mép.
- Visual bên phải cân đối.
- CTA vàng chỉ là accent.
- Mobile xếp một cột.
- Không làm section cao quá mức.
- Footer chuyển tiếp tự nhiên.

### Vertical rhythm

Desktop:

- Section padding khoảng 72–96px.
- Section nhiều nội dung có thể 96–112px nhưng không dùng đồng loạt.

Tablet:

- 56–72px.

Mobile:

- 40–56px.

Không để khoảng trắng 150–250px không có mục đích.

## 9. Kết nối Web

Sau import:

- Homepage ưu tiên lấy Product/Collection/Banner từ public API.
- Collection dùng URL mới trong DB.
- Studio background gọi `/public/frame-backgrounds`.
- Studio accessories gọi `/public/accessories`.
- Không duplicate source of truth giữa API và file static.
- Nếu cần fallback development, fallback phải tách riêng và chỉ chạy khi API rỗng hoặc flag dev bật.
- Không hard-code URL Firebase nguồn vào component.
- Cập nhật Next image remote pattern chỉ cho domain storage của Figure Lab.
- Không thêm domain nguồn vào production config.

## 10. Studio sample data

Studio phải test được:

1. Load background theo category.
2. Chọn background và preview cập nhật.
3. Load charm theo category.
4. Giá charm lấy từ DB.
5. Chọn nhiều charm và tổng giá đúng.
6. Ảnh transparency hiển thị đúng.
7. Undo/Redo foundation không bị phá.
8. Save/cart serialization giữ accessory/background ID.
9. Refresh/restore cart không mất sample data.
10. Endpoint lỗi một nhóm không làm toàn Studio crash.

## 11. Báo cáo import

Tạo:

```text
docs/import-reports/figure-lab-sample-media-20260717.md
data/import/reports/figure-lab-sample-media-20260717.json
```

Report gồm:

- Số record đọc.
- Số URL unique.
- Số download thành công/thất bại.
- Số file trùng hash.
- Số upload.
- Số DB insert/update/skip.
- Mapping source URL → destination URL.
- Record lỗi và nguyên nhân.
- Thời gian chạy.
- Seed tag.
- Cách rollback.

Không commit token nguồn, cookie hoặc secret vào report.

## 12. Kiểm tra bắt buộc

- Homepage 1920, 1536, 1440, 1280, 1024, 768, 430, 390, 375px.
- Không horizontal scroll.
- 5 product cards chỉ khi đủ width.
- Category cards bằng chiều cao.
- 4 testimonial cards desktop.
- Final CTA full-bleed.
- Không ảnh 404.
- Không hotlink nguồn.
- Studio có background và charm.
- Price integer VND.
- Import chạy lại không duplicate.
- Rollback chạy được.
- ESLint không tăng lỗi.
- Typecheck pass.
- Backend build pass.
- Web build pass.
- API/public routes trả dữ liệu đúng.

## 13. Quy tắc không được vi phạm

- Không thay đổi cart schema theo cách phá dữ liệu cũ.
- Không ghi đè production price bằng giá từ website nguồn.
- Không tạo migration destructive.
- Không lưu blob/data URL trong DB.
- Không lưu URL nguồn vào runtime production.
- Không dùng `any`, `@ts-ignore`, hoặc disable lint hàng loạt.
- Không tuyên bố hoàn thành khi chưa chạy dry-run, apply test và build.
