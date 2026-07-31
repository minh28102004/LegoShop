# Figure Lab Admin — Audit & Refactor Plan

Ngày audit: 30/07/2026
Phạm vi: `apps/admin`, `apps/backend`, `apps/web`, `packages/api`, Prisma schema.

## 1. Kết luận nhanh

Admin hiện đã có nền tảng dùng chung khá tốt: `EntityManager`, bảng, modal, toolbar, upload và phân trang. Vấn đề chính không nằm ở thiếu component, mà ở việc component tổng quát đang hiển thị quá nhiều dữ liệu kỹ thuật và chưa phản ánh đúng nghiệp vụ của từng module.

Các rủi ro quan trọng:

1. Một số form vẫn yêu cầu nhập JSON hoặc ID thô (`componentConfig`, `frameOptionIds`, `compatibility`).
2. `CharacterPart` có đồng thời `status` và `isActive`, trong khi API website kiểm tra cả hai.
3. Xóa `CharacterPart` hoặc `CharacterPreset` có thể làm mất liên kết đang được website/sản phẩm sử dụng.
4. Bảng mặc định tự sinh nhiều cột ngày giờ, mô tả và trạng thái khiến dữ liệu bị cắt, khó đọc và thiếu nhất quán.
5. Một số route quản trị tồn tại nhưng không xuất hiện trong sidebar; một số entity cũ và mới đang cùng tồn tại.
6. API Admin đã yêu cầu đăng nhập nhưng chưa có phân quyền theo vai trò thực sự; `role` hiện chỉ là chuỗi trên model Admin.

## 2. Bản đồ Admin ↔ Website ↔ API ↔ Database

| Module Admin | Vị trí sử dụng trên Website | Admin API | Public API | Entity chính | Quyết định |
|---|---|---|---|---|---|
| Sản phẩm | Trang bộ sưu tập, chi tiết mẫu, giỏ hàng, checkout | `/admin/products` | `/products` | `Product` | Giữ; thay cấu hình JSON bằng trình chọn trực quan |
| Khung tranh | Studio, báo giá doanh nghiệp | `/admin/frame-options` | `/frame-options` | `FrameOption` | Giữ entity mới; coi `FrameSize`/`FrameColor` là legacy |
| Nền ảnh khung | Studio bước chọn nền | `/admin/frame-backgrounds` | `/frame-backgrounds` | `FrameBackground` | Giữ; thay danh sách ID JSON bằng multi-select |
| Phụ kiện | Studio, Character Builder, giỏ hàng | `/admin/accessories` | `/accessories` | `Accessory` | Giữ trạng thái vì public API đang lọc theo trạng thái |
| Bộ phận nhân vật | `/studio/character` | `/admin/character-parts` | `/character-parts` | `CharacterPart` | Giữ; hợp nhất cách hiểu `status`/`isActive` ở tầng UI |
| Mẫu nhân vật | `/studio/character`, cấu hình sản phẩm | `/admin/character-presets` | `/character-presets` | `CharacterPreset` | Giữ; cần chặn/xác nhận xóa khi đang được tham chiếu |
| Bộ sưu tập | Trang danh sách sản phẩm, trang chủ | `/admin/collections` | `/collections` | `Collection` | Giữ |
| Banner | Trang chủ | `/admin/banners` | `/banners` | `Banner` | Giữ; hiển thị nhãn thân thiện thay cho key kỹ thuật |
| Template | Studio/template nội bộ | `/admin/templates` | `/templates` | `Template` | Giữ route ẩn đến khi quy trình template được chốt |
| Đơn hàng | Cart/Checkout/tra cứu đơn | `/admin/orders` | Order API | `Order`, `OrderItem` | Giữ; dữ liệu snapshot không được suy diễn lại từ catalog |
| Voucher | Cart/Checkout | `/admin/vouchers` | Voucher validation | `Voucher` | Giữ |
| Liên hệ doanh nghiệp | Form doanh nghiệp | `/admin/business-inquiries` | Inquiry API | `BusinessInquiry` | Giữ |
| Cài đặt thanh toán | Checkout | `/admin/payment-settings` | Payment API | Payment settings | Giữ |

## 3. Phân loại trường dữ liệu

### Trường người dùng Website nhìn thấy

- Tên, mô tả, hình ảnh, giá, giá so sánh.
- Loại sản phẩm, bộ sưu tập, kích thước/màu khung.
- Thành phần nhân vật, phụ kiện, mẫu nền, template.
- Trạng thái bán/hiển thị có ảnh hưởng trực tiếp tới public API.

### Trường quản trị cần dùng nhưng không nên chiếm cột chính

- Slug.
- Ngày tạo.
- Media metadata.
- Tags.
- Các cờ `featured`, `builderPreset`, `sellable`.
- ID quan hệ.

Các trường này vẫn tồn tại trong form hoặc phần nâng cao, nhưng không nên xuất hiện đồng thời trong bảng chính.

### Trường hệ thống

- `createdAt`, `updatedAt`.
- Snapshot trong `OrderItem`.
- Khóa ngoại và ID.
- JSON metadata.

Không cho người dùng nhập tay nếu có thể tạo bằng picker hoặc tự động sinh.

### Trường trùng nghĩa hoặc có nguy cơ sai

- `CharacterPart.status` + `CharacterPart.isActive`: public API hiện yêu cầu cả hai cùng hợp lệ.
- `Product.status` + `Product.published`: hai lớp trạng thái có mục đích khác nhau nhưng UI chưa giải thích rõ.
- `FrameSize`/`FrameColor` và `FrameOption`: có dấu hiệu entity cũ và entity hợp nhất cùng tồn tại.
- `Character` legacy và `CharacterPart`/`CharacterPreset`: website mới chủ yếu dùng Parts/Presets.

Không xóa schema trong đợt này. Admin sẽ giảm độ lộ của field kỹ thuật và ghi nhận migration riêng để tránh mất dữ liệu.

## 4. Audit giao diện dùng chung

### Sidebar

- Thiếu nhóm nội dung rõ ràng.
- Route `templates`, `template-categories`, `accessory-categories`, `frame-sizes`, `frame-colors` tồn tại nhưng đang ẩn.
- Cần nhóm lại thành: Tổng quan, Danh mục thiết kế, Nội dung Website, Vận hành, Hệ thống.

### Header và toolbar

- Toolbar hiện dùng chung nhưng placeholder và độ rộng chưa theo ngữ cảnh.
- Nút tạo mới, tìm kiếm, bộ lọc ổn về hành vi; cần giảm khoảng trống và thống nhất kích thước.

### Table

- Cấu trúc cuộn thân bảng và cố định header đã có.
- Cột mặc định đang tự sinh, dẫn tới dư ngày tạo/ngày cập nhật, mô tả bị cắt và bảng rộng không cần thiết.
- Cần khai báo cột rõ cho từng module, tối đa khoảng 5–6 cột nội dung + hành động.
- Thumbnail nên dùng `object-contain` để không cắt ảnh linh kiện.

### Modal và form

- Modal đã có header/footer cố định và body cuộn; cần dùng `dvh`, giảm khoảng trắng và tối ưu dropzone.
- Khi submit lỗi, dữ liệu form đang được giữ lại — tiếp tục duy trì.
- JSON editor chỉ phù hợp cho phần nâng cao; không dùng làm luồng nhập chính.

## 5. Audit backend và toàn vẹn dữ liệu

### Trạng thái

Không được bỏ `status` khỏi:

- Product
- Accessory
- Banner
- FrameBackground
- FrameOption
- Collection
- CharacterPart
- CharacterPreset

Lý do: public API đang lọc những trạng thái này trước khi trả dữ liệu cho Website.

### Xóa dữ liệu

- Xóa `CharacterPart` có thể làm preset mất face/hair/torso/legs/hat do quan hệ `SetNull`; phụ kiện preset có thể bị cascade.
- Xóa `CharacterPreset` có thể làm `Product.presetId` thành null.
- Một số tham chiếu nằm trong JSON (`Product.componentConfig`, snapshot đơn hàng), database không thể tự kiểm tra khóa ngoại.
- Xóa Product có thể xung đột với OrderItem; cần thông báo nghiệp vụ rõ thay vì chỉ trả lỗi database.

Ưu tiên: kiểm tra tham chiếu và trả lỗi dễ hiểu trước khi xóa; chưa hard-delete hàng loạt hay viết migration phá dữ liệu.

### Phân quyền

- Route Admin đã có JWT guard.
- Chưa có permission guard/role matrix.
- `Admin.role` là chuỗi tự do, chưa đủ để coi là RBAC.

Đề xuất pha tiếp theo: enum vai trò + permission map + audit log cho create/update/delete/status change.

## 6. Phạm vi refactor đợt này

### P0 — triển khai ngay

1. Chuẩn hóa sidebar và route grouping.
2. Chuẩn hóa toolbar/table/modal và trạng thái loading/empty/error.
3. Khai báo cột theo từng module, bỏ cột dư.
4. Thumbnail `contain`, tooltip cho nội dung bị cắt.
5. Thay `Product.componentConfig` bằng trình cấu hình trực quan.
6. Thay `FrameBackground.frameOptionIds` JSON bằng multi-select.
7. Đồng bộ trạng thái Character Part ở UI để không tạo dữ liệu nửa hoạt động.
8. Thêm thông báo rõ khi thao tác API thất bại.

### P1 — nên triển khai sau P0

1. Kiểm tra tham chiếu trước khi xóa Part/Preset/Product.
2. Chuẩn hóa `status`/`published`/`isActive` ở API và schema.
3. Thêm RBAC và audit log.
4. Hợp nhất hoặc ngừng dùng các entity legacy.

### P2 — migration có kiểm soát

1. Chuyển tham chiếu JSON quan trọng thành bảng quan hệ.
2. Migration loại bỏ field/entity legacy sau khi thống kê dữ liệu thực tế.
3. Tối ưu index dựa trên query production.

## 7. Tiêu chí nghiệm thu

- [ ] Sidebar có nhóm rõ ràng và không lộ route legacy gây nhầm.
- [ ] Mỗi bảng chính chỉ hiển thị dữ liệu phục vụ quyết định quản trị.
- [ ] Header bảng cố định, body cuộn, không lệch cột.
- [ ] Ảnh không bị crop sai.
- [ ] Modal không vượt viewport; footer luôn truy cập được.
- [ ] Form không yêu cầu nhập ID/JSON trong luồng thông thường.
- [ ] Trạng thái Admin khớp điều kiện public API.
- [ ] Không mất dữ liệu form khi API báo lỗi.
- [ ] Typecheck/build Admin thành công.
- [ ] Các luồng list/search/filter/create/edit được kiểm tra trên trình duyệt.

## 8. Nguyên tắc an toàn dữ liệu

- Không xóa cột/bảng trong đợt refactor UI.
- Không đổi hàng loạt trạng thái dữ liệu hiện tại.
- Không reset hoặc ghi đè các thay đổi đang có ở Web/Backend.
- Mọi thay đổi schema phá vỡ tương thích phải có migration và backfill riêng.

## 9. Kết quả triển khai đợt 2026-07-30

### Đã hoàn thành

- Chuẩn hóa sidebar thành các nhóm Danh mục, Nội dung Website, Vận hành và Cài đặt.
- Khai báo cột có chủ đích cho các bảng Product, Accessory, Banner, Collection, Character Part, Character Preset và Frame Background.
- Giảm chiều rộng bảng mặc định, cố định cột hành động và đổi thumbnail sang `object-contain`.
- Thu gọn modal theo `dvh`, giữ header/footer truy cập được và giảm chiều cao khu vực tải ảnh.
- Thay `Product.componentConfig` dạng JSON bằng bộ chọn Khung, Nền, Nhân vật và Phụ kiện lấy từ API thật.
- Thay `FrameBackground.frameOptionIds` dạng JSON bằng bộ chọn nhiều khung theo tên.
- Giữ trường tương thích legacy trong khu vực “Thiết lập nâng cao”, không còn làm nhiễu luồng chính.
- Đồng bộ `CharacterPart.status` và `CharacterPart.isActive` tại service để Admin và public API không lệch trạng thái.
- Chặn xóa Character Part, Character Preset và Product khi còn dữ liệu nghiệp vụ tham chiếu.
- Thêm trạng thái lỗi có nút thử lại cho bảng dữ liệu.

### Kiểm tra kỹ thuật

- `pnpm --filter admin typecheck`: đạt.
- `pnpm --filter backend typecheck`: đạt.
- `pnpm --filter admin build`: đạt, 24 route được tạo thành công.
- `pnpm --filter backend exec jest --runInBand`: 34 suite, 41 test đều đạt.
- QA trình duyệt tại `/products` và `/frame-backgrounds`: bảng, phân trang, form tạo mới và bộ chọn dữ liệu thật hiển thị đúng; không còn ô nhập ID/JSON trong luồng thông thường.
- Console QA không có lỗi runtime. Cảnh báo LCP của ảnh đăng nhập đã được xử lý bằng tải ưu tiên.

### Chưa thực hiện trong đợt này

- RBAC chi tiết và audit log theo hành động.
- Migration loại bỏ entity/field legacy.
- Chuẩn hóa các tham chiếu đang nằm trong JSON thành bảng quan hệ.

Ba hạng mục trên cần thiết kế migration và rollout riêng để không làm gián đoạn dữ liệu hoặc luồng Website hiện tại.
