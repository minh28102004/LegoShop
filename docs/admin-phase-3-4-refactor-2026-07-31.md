# Figure Lab Admin — Phase 3 và Phase 4

Ngày hoàn tất: 31/07/2026
Phạm vi: form Create/Edit Admin và luồng dữ liệu catalog Admin ↔ API ↔ Website/Studio. Không migration database.

## 1. Phase 3 — form và modal

### Modal dùng chung

- Modal dùng cấu trúc `header / minmax(0, 1fr) / footer`, giới hạn `90dvh`.
- Header và footer luôn hiển thị; chỉ body được cuộn dọc.
- Body chặn overflow ngang; submit có khóa chống gửi lặp.
- Lỗi required nằm sát field. Lỗi API được map bằng `errorCode`, không hiển thị raw message kỹ thuật.
- Create và Edit dùng cùng định nghĩa field trong `EntityManager`.
- Upload rỗng được thu gọn; hỗ trợ nhiều ảnh, chọn ảnh đại diện, xóa và đổi thứ tự.

| Route | Cấu trúc form sau refactor | Thay đổi chính |
|---|---|---|
| `/products` | Thông tin cơ bản → Hình ảnh → Cấu hình sản phẩm → Hiển thị | Bỏ raw JSON; Khung/Nền 2 cột; Nhân vật và Phụ kiện là section full width; có search, grid responsive, scroll dọc; kiểm tra tương thích nền/khung |
| `/frame-options` | Kích thước → Giá/tồn kho → Hình ảnh | Bỏ màu và status legacy khỏi form; chỉ giữ dữ liệu size thực sự dùng |
| `/accessories` | Thông tin cơ bản → Hình ảnh | Bỏ status khỏi form; category, giá và ảnh là dữ liệu chính |
| `/characters` | Thông tin cơ bản → Hình ảnh → Availability | Dùng `availability` làm cơ chế khả dụng chuẩn; compatibility JSON chỉ nằm trong phần nâng cao |
| `/character-presets` | Thông tin cơ bản → Preview → Thành phần → Hiển thị | Thành phần chọn trực quan, quan hệ part được validate; giữ status/builder/sellable vì có nghiệp vụ thật |
| `/frame-backgrounds` | Thông tin cơ bản → Hình ảnh → Khung hỗ trợ → Hiển thị | Thêm category/thumbnail; chọn frame hỗ trợ trực quan; giữ status/order vì public API sử dụng |
| `/collections` | Thông tin cơ bản → Hình ảnh → Hiển thị | Giữ status/order vì Website dùng để ẩn/hiện và sắp xếp |
| `/banners` | Thông tin quản trị → Hình ảnh → Hiển thị | Tách tên quản trị `title` và khóa hệ thống `sourceKey`; giữ status/order |
| `/vouchers` | Thông tin cơ bản → Hiệu lực/giới hạn | Nhóm lại ngày bắt đầu/kết thúc, loại và giá trị giảm; giữ status nghiệp vụ voucher |

### Product configuration

- Không còn textarea JSON trong luồng chính.
- Khung và nền cân đối hai cột; nền chỉ hiện nếu hỗ trợ khung đã chọn.
- Nhân vật và phụ kiện không còn bị ép vào hai card hẹp.
- Danh sách selector chỉ cuộn dọc, không cuộn ngang; card responsive 2–3 cột trong modal.
- Ảnh dùng `object-contain`, tên tối đa hai dòng, giá và đơn vị tiền không bị tách dòng.
- Không cho trùng nhân vật/phụ kiện; quantity phải là số nguyên dương.

## 2. Phase 4 — mapping Admin ↔ API ↔ Website/Studio

| Module | Admin tạo/sửa | API public | Website/Studio dùng | Status / order / category | Bảo vệ quan hệ |
|---|---|---|---|---|---|
| Product | Tên, slug, mô tả, giá, ảnh, published, category/collection, config khung-nền-nhân vật-phụ kiện | `/products`, `/products/:slug` | Trang chủ, Collection, modal sản phẩm, giỏ hàng | `published` là cờ công khai thật; category được normalize | Validate toàn bộ ID và tương thích background/frame; chặn xóa nếu đã có OrderItem |
| Frame Option | Kích thước, giá, tồn kho, ảnh | `/frame-options` | Studio Frame, Product Config | Status legacy bị bỏ khỏi UI và public không filter; không cần order/category | Chặn xóa nếu Background, Product, Order hoặc Design tham chiếu |
| Accessory | Tên, category, giá, ảnh | `/accessories` | Studio Frame/Character, Collection, Product | Category là nghiệp vụ thật; status legacy bị bỏ khỏi UI và public không filter | Chặn xóa nếu Product, Order hoặc Design tham chiếu |
| Character Part | Tên, type, giá, ảnh, availability | `/character-parts` | Character Builder và Studio | `availability` là nguồn chuẩn; status/isActive legacy không còn dùng để lọc public | Chặn đổi type/disable hoặc xóa nếu Preset/Order/Design tham chiếu |
| Character Preset | Tên, preview, các part, active, builder, sellable | `/character-presets` | Character Builder và Product Config | Status và sort có tác dụng thật; preset public phải active/builder | Validate đúng slot, không trùng accessory, mọi part phải tồn tại/available; chặn xóa nếu Product/Order/Design tham chiếu |
| Frame Background | Tên, ảnh/thumbnail, category, frame hỗ trợ, status, order | `/frame-backgrounds` | Studio Frame và Product Config | Giữ status/order/category vì Website filter và sắp xếp | Chỉ nhận Frame Option loại `size`; chặn xóa nếu Product/Order/Design tham chiếu |
| Collection | Tên, slug, ảnh, status, sortOrder | `/collections` | Trang Collection và trang chủ | Giữ status/order; public chỉ trả collection active theo thứ tự | Chặn xóa collection đang được Product sử dụng |
| Banner | Tên quản trị, sourceKey, ảnh, status, order | `/banners` | Home loader theo vị trí hệ thống | Giữ status/order; `sourceKey` duy nhất xác định vị trí, không dùng title làm khóa mới | Validate sourceKey; title chỉ dùng quản trị, loader có fallback cho dữ liệu cũ |

## 3. Field đã bỏ hoặc ẩn khỏi luồng Admin

- Accessory: ẩn `status`.
- Frame Option: ẩn `status` và lựa chọn màu không còn liên quan đến size.
- Character Part: ẩn `status/isActive`; dùng duy nhất `availability` trong UI và public query.
- Product: không dùng status catalog chung; `published` là trạng thái công khai. Raw component JSON được thay bằng selector trực quan.
- Các field legacy vẫn còn trong schema để tránh migration phá dữ liệu, nhưng Admin không gửi nếu không cần.

## 4. Quy tắc dữ liệu đã bổ sung

- Giá component của Product được resolve từ catalog hiện tại, không tin giá stale trong JSON.
- Product không lưu ID component không tồn tại, không cho duplicate và kiểm tra thumbnail khi publish.
- Background chỉ gắn vào frame size có thật; Product không chọn background không hỗ trợ frame.
- Character Preset chỉ chứa part đúng slot và đang available.
- Kiểm tra tham chiếu JSON dùng so khớp ID chính xác theo cấu trúc, không dùng substring dễ false-positive.
- Public Accessory/Frame/Character Part không còn bị biến mất vì field `status` legacy mặc định sai.
- Category Product/Background được chuẩn hóa trước khi tìm kiếm/lọc.

## 5. Technical debt không xử lý bằng migration trong phase này

- Các cột legacy `status`/`isActive` của Accessory, Frame Option và Character Part vẫn còn trong database để tương thích dữ liệu cũ; cần migration riêng sau khi backfill.
- Banner chưa có schema riêng cho ảnh mobile; hiện vẫn dùng ảnh chung. Đây là thay đổi schema/API cần thiết kế riêng.
- Một số record Banner cũ chưa có `sourceKey`; Website tạm fallback về `title`. Sau khi backfill có thể bỏ fallback.
- Snapshot catalog đầy đủ cho đơn hàng là phần vận hành Phase 5; Phase 4 chỉ bảo vệ không xóa catalog đã được tham chiếu.

## 6. Kiểm tra kỹ thuật

- Backend typecheck: PASS.
- Admin typecheck: PASS.
- Website typecheck: PASS.
- Backend test liên quan: 7 suites, 18 tests PASS.
- Backend production build: PASS.
- Admin production build: PASS, 24 routes.
- Website production build: PASS, 18 routes.
- `git diff --check`: PASS.
