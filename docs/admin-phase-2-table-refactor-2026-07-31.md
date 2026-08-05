# Figure Lab Admin — Phase 2 table, column width và status

Ngày hoàn tất: 31/07/2026
Phạm vi: DataTable trong Admin. Không migration database, không xóa field backend và không sửa Website.

## 1. Nguyên tắc đã áp dụng

- Mỗi resource có policy cột riêng; bỏ cơ chế tự chèn timestamp rồi cắt cứng danh sách cột.
- Bảng chính giữ 5–7 cột hữu ích, tính cả cột Hành động.
- Header cao `48px`; row desktop `68px`, mobile `64px`; thumbnail `44px`.
- Cột Hành động cố định `110px`.
- Ngày giờ không xuống dòng; text dài truncate và có `title` để xem đầy đủ khi hover.
- Chỉ cột được backend hỗ trợ sort mới hiển thị sort icon.
- Không tạo page-level horizontal overflow. Table chỉ scroll ngang bên trong wrapper khi tổng min-width thật sự lớn hơn vùng hiển thị.

## 2. Cấu hình cột cuối cùng

| Route | Cột cuối cùng | Width/min-width chính | Status trên list |
|---|---|---|---|
| `/products` | Tên, Giá, Ảnh đại diện, Công khai, Ngày cập nhật, Hành động | `240px/flex`, `120px`, `100px`, `130px`, `170px`, `110px`; table `860px` | Bỏ cột status chung; giữ badge Công khai vì `published` là nghiệp vụ riêng |
| `/accessories` | Tên phụ kiện, Hình ảnh, Danh mục, Giá, Ngày cập nhật, Hành động | `220px/flex`, `100px`, `180px`, `120px`, `170px`, `110px`; table `920px` | Bỏ khỏi list để ưu tiên Danh mục và Giá |
| `/frame-options` | Kích thước, Hình ảnh, Giá, Tồn kho, Ngày cập nhật, Hành động | `160px/flex`, `100px`, `120px`, `100px`, `170px`, `110px`; table `780px` | Không hiển thị trên list |
| `/characters` | Tên, Hình ảnh, Loại, Điều chỉnh giá, Trạng thái, Ngày cập nhật, Hành động | `220px/flex`, `100px`, `160px`, `130px`, `130px`, `170px`, `110px`; table `980px` | Giữ vì public builder filter status |
| `/character-presets` | Tên, Preview, Dùng trong builder, Có thể bán, Trạng thái, Ngày cập nhật, Hành động | `220px/flex`, `100px`, `135px`, `125px`, `130px`, `170px`, `110px`; table `1020px` | Giữ vì có nghiệp vụ thật |
| `/frame-backgrounds` | Tiêu đề, Hình ảnh, Thứ tự, Trạng thái, Ngày cập nhật, Hành động | `260px/flex`, `100px`, `105px`, `130px`, `170px`, `110px`; table `880px` | Giữ vì public API chỉ lấy nền active |
| `/collections` | Tên, Hình ảnh, Slug, Trạng thái, Ngày cập nhật, Hành động | `220px/flex`, `100px`, `190px`, `130px`, `170px`, `110px`; table `940px` | Giữ vì Website filter active |
| `/banners` | Tiêu đề, Hình ảnh, Thứ tự, Trạng thái, Ngày cập nhật, Hành động | `240px/flex`, `100px`, `105px`, `130px`, `170px`, `110px`; table `880px` | Giữ vì là show/hide homepage |
| `/vouchers` | Mã, Loại, Giá trị, Đã dùng, Trạng thái, Hết hạn, Hành động | `180px/flex`, `150px`, `130px`, `105px`, `130px`, `170px`, `110px`; table `1050px` | Giữ vì validation voucher phụ thuộc status |
| `/orders` | Mã đơn, Khách hàng, Tổng tiền, Trạng thái đơn, Thanh toán, Vận chuyển, Hành động | `170px`, `240px/flex`, `130px`, `135px`, `145px`, `145px`, `110px`; table `1040px` | Giữ đủ ba workflow status |
| `/business-inquiries` | Doanh nghiệp, Người liên hệ, Email, Điện thoại, Trạng thái, Hành động | `240px/flex`, `180px`, `220px`, `150px`, `140px`, `110px`; table `1040px` | Giữ badge; bỏ select inline khỏi row |

Các route CRUD ẩn cũng được cấp policy riêng để không quay lại heuristic cũ: `/templates`, `/template-categories`, `/accessory-categories`, `/frame-sizes`, `/frame-colors`.

## 3. Quyết định về status

### Đã bỏ khỏi list view

- Product: bỏ cột `status`; list dùng `published` với nhãn “Công khai trên Web/Chưa công khai”.
- Accessory: bỏ cột `status` để cột Danh mục và Giá hiển thị đúng.
- Frame Option: list theo đúng cấu trúc Kích thước/Hình/Giá/Tồn kho/Updated/Actions.

### Không xóa khỏi form, filter hoặc backend

Audit Phase 1 xác minh Product, Accessory, Frame Option, Character Part và Frame Background đều có public API/Website phụ thuộc status. Vì vậy việc xóa field hoặc ngừng gửi status sẽ phá luồng dữ liệu. Phase 2 chỉ giảm nhiễu ở list view, không migration và không đổi contract backend.

Technical debt còn mở:

- Character Part có cả `status` và `isActive`; cần migration riêng để hợp nhất an toàn.
- Product có `status`, `published` và `availability`; cần đặc tả rõ ba lớp nghiệp vụ trước khi giản lược schema.
- Frame Option public API lọc active nhưng form Admin chưa có control tương ứng; chưa tự ý thêm/xóa trong phase table.

## 4. Lỗi đã sửa

- Accessory không còn cột viết tắt `D...`/`Tin...`; Danh mục rộng `180px`, tên dài có tooltip/title.
- Accessory trả lại cột Giá; không còn bị timestamp mặc định đẩy mất.
- Product chỉ giữ Ngày cập nhật, không còn đồng thời Ngày tạo và Ngày cập nhật trong list.
- Frame có ít dữ liệu nhưng Actions không còn giãn chiếm khoảng trắng lớn.
- Character Part và Character Preset hiển thị lại các cột nghiệp vụ quan trọng.
- Voucher hiển thị ngày hết hạn.
- Order gộp thông tin khách hàng để giữ bảng trong 7 cột.
- Business Inquiry không còn badge và select status chồng trong cùng cell.
- Sort icon không còn xuất hiện trên cột không hỗ trợ sort thật.

## 5. File đã thay đổi trong Phase 2

- `apps/admin/src/modules/admin/components/entity-manager.tsx`
- `apps/admin/src/modules/admin/components/orders-manager.tsx`
- `apps/admin/src/modules/admin/components/inquiries-manager.tsx`
- `apps/admin/src/app/(admin)/products/page.tsx`
- `apps/admin/src/app/(admin)/accessories/page.tsx`
- `apps/admin/src/app/globals.css`
- `apps/admin/src/i18n/dictionaries/vi.json`
- `apps/admin/src/i18n/dictionaries/en.json`

## 6. Kiểm tra kỹ thuật

- `pnpm.cmd --filter admin typecheck`: PASS.
- `pnpm.cmd --filter admin build`: PASS; Next.js tạo thành công 24 page Admin.
- Runtime server trả HTTP 200 tại `/login`; các route bảo vệ chuyển về `/login` trong browser QA mới vì không có phiên đăng nhập. Không dùng hoặc trích xuất credential/token để vượt auth.
- Không phát sinh console/build warning mới trong các bước typecheck và build.
