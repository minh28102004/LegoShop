# Figure Lab Admin — Phase 1 page-by-page audit

Ngày chốt audit: 31/07/2026
Phạm vi: chỉ hệ thống Admin và luồng dữ liệu Admin ↔ API ↔ Website.
Trạng thái phase: **audit only** — chưa migration database, chưa xóa field backend và chưa sửa ngoài Admin.

## 1. Phương pháp và bản đồ route

Audit được thực hiện theo ba lớp cho từng page:

1. Đọc page route và cấu hình field/table thực tế.
2. Đọc service Admin, public API và consumer phía Website để xác minh field có tác dụng hay không.
3. Kiểm tra giao diện đang chạy ở `localhost:3001`, gồm header, bảng, modal/form, scroll và kích thước cột thực tế.

### Route người dùng yêu cầu và route thực tế

| Route yêu cầu | Route thực tế | Ghi chú |
|---|---|---|
| `/dashboard` | `/dashboard` | Có trong sidebar |
| `/products` | `/products` | Có trong sidebar |
| `/frame-options` | `/frame-options` | Có trong sidebar |
| `/accessories` | `/accessories` | Có trong sidebar |
| `/character-parts` | `/characters` | Route UI là `/characters`, resource API là `character-parts` |
| `/character-presets` | `/character-presets` | Có trong sidebar |
| `/frame-backgrounds` | `/frame-backgrounds` | Có trong sidebar |
| `/collections` | `/collections` | Có trong sidebar |
| `/banners` | `/banners` | Có trong sidebar |
| `/orders` | `/orders`, `/orders/[id]` | Danh sách và chi tiết |
| `/business-contacts` | `/business-inquiries`, `/business-inquiries/[id]` | Tên route thực tế khác yêu cầu |
| `/vouchers` | `/vouchers` | Có trong sidebar |
| Cài đặt/tài khoản | `/payment-settings`, `/profile`, `/change-password` | Profile/password dùng shell riêng |

Các route Admin khác đang tồn tại nhưng không hiện trong sidebar chính: `/templates`, `/template-categories`, `/accessory-categories`, `/frame-sizes`, `/frame-colors`.

## 2. Kết luận status theo nghiệp vụ thật

Không nên xóa status khỏi schema hoặc form ở Phase 2 đối với các module dưới đây, vì public API/Website đang sử dụng trực tiếp:

| Module | Website/API đang dùng | Quyết định Phase 1 |
|---|---|---|
| Product | Public product yêu cầu `status=active` **và** `published=true` | **KEEP**; cần giải thích rõ hai lớp trạng thái |
| Accessory | Public accessory và Studio chỉ trả/giữ item `active` | **KEEP** |
| Frame Option | Public frame option lọc `active` | **KEEP**; Admin hiện thiếu field bật/tắt nên có lỗ hổng vận hành |
| Character Part | Public builder yêu cầu `status=active` và `isActive=true` | **KEEP**; ghi technical debt do trùng nghĩa |
| Character Preset | Builder yêu cầu `active + isBuilderPreset`; luồng bán dùng `isSellable` | **KEEP** cả status và hai cờ nghiệp vụ |
| Frame Background | Public background lọc `active` | **KEEP** |
| Collection | Public collection lọc `active` | **KEEP** |
| Banner | Homepage chỉ lấy banner `active` | **KEEP** |
| Voucher | API áp mã từ chối voucher không active/hết hạn/quá giới hạn | **KEEP** |
| Order | Ba status là trạng thái xử lý, thanh toán, vận chuyển | **KEEP** |
| Business Inquiry | Status là workflow xử lý lead | **KEEP** |

Kết luận: yêu cầu “REMOVE FROM UI” **không áp dụng an toàn** cho các status ưu tiên nêu trên. Có thể bỏ status khỏi một số **list view** nếu cần giảm nhiễu, nhưng không được bỏ field form/filter hoặc ngừng gửi field khi public API còn phụ thuộc.

## 3. Bảng phát hiện tổng hợp

| Route | Vấn đề | Mức độ | Đề xuất | File liên quan |
|---|---|---:|---|---|
| `/dashboard` | “Tổng doanh thu” cộng tất cả đơn, gồm đơn hủy/chưa thanh toán | P0 | Chỉ cộng doanh thu theo payment status hợp lệ; thống nhất định nghĩa với báo cáo | `apps/backend/src/admin-dashboard/admin-dashboard.service.ts`, `apps/admin/src/modules/dashboard/components/DashboardStats.tsx` |
| `/dashboard` | Biểu đồ doanh thu và phân bổ trạng thái chỉ tính 5 `recentOrders` nhưng nhãn thể hiện như toàn hệ thống | P0 | Backend trả time-series/status aggregate riêng; không suy diễn từ 5 đơn gần nhất | cùng file trên |
| `/dashboard` | Fallback khi stats API lỗi lấy page đầu của order list rồi hiển thị như tổng | P0 | Hiển thị degraded/error state hoặc gọi aggregate chính xác; không tạo “total” từ 20 dòng | `DashboardStats.tsx` |
| `/dashboard` | Header/stat cards rõ, không có overflow ngang ở 1366; recent table phù hợp 5 cột | P3 | Giữ layout, chỉ sửa semantics dữ liệu | `DashboardStats.tsx` |
| `/products` | Renderer ép cả Created và Updated làm bảng dài; thumbnail bị đẩy ra cuối | P1 | Danh sách dùng Name, Price, Thumbnail, Availability/Publish, Updated, Actions | `products/page.tsx`, `entity-manager.tsx` |
| `/products` | `status`, `published`, `availability` cùng tồn tại nhưng UI chưa giải thích khác nhau | P1 | Đổi label/help text theo “khả dụng nội bộ / công khai / tồn kho”; không xóa status lúc này | `products/page.tsx`, `products.service.ts` |
| `/products` | Modal product dài; component config có nested scroll | P1 | Tách section rõ, để modal body là scroll chính; danh sách picker tự co theo viewport | `ProductComponentConfigField.tsx`, `entity-manager.tsx` |
| `/products` | Khu phụ kiện trong config có `scrollWidth 395 > clientWidth 346`; card/label vượt cột | P1 | `min-width:0`, grid responsive, `overflow-x:hidden`, truncate + tooltip | `ProductComponentConfigField.tsx` |
| `/products` | Card nhân vật/phụ kiện hẹp làm tên và giá xuống dòng | P1 | Ưu tiên 1 cột ở modal vừa, 2 cột khi đủ rộng; tên 2 dòng, giá không wrap | `ProductComponentConfigField.tsx` |
| `/products` | Product config lưu snapshot giá; public detail ưu tiên giá configured trước giá catalog hiện tại | P0 | Xác định rõ snapshot hay live-price; nếu live-price thì không ưu tiên configured price | `apps/backend/src/products/products.service.ts` |
| `/frame-options` | 3 dòng dữ liệu nhưng table giãn toàn chiều rộng; Actions từng đo ~253px | P1 | Column widths riêng: size 160–180, image 100, price 120, stock 100, updated 170, actions 110 | `frame-options/page.tsx`, `entity-manager.tsx` |
| `/frame-options` | Table hiển thị cả Created/Updated; color bị rơi khỏi 6 cột | P1 | Chỉ giữ Updated; color xem trong form hoặc thêm nếu nghiệp vụ cần | cùng file trên |
| `/frame-options` | Public API lọc status nhưng form Admin không có status | P1 | Thêm status control hoặc quyết định legacy policy; không xóa backend field | `frame-options/page.tsx`, `apps/backend/src/frame-options/frame-options.service.ts` |
| `/accessories` | Cột Category thực tế chỉ ~42px, hiển thị `D...`, `Tin...` | P1 | Category 160–190px, truncate có title/tooltip | `accessories/page.tsx`, `entity-manager.tsx` |
| `/accessories` | Giá được khai báo trong `tableFields` nhưng bị renderer cắt mất; Created/Updated lại xuất hiện | P0 | Cột cố định: Name, Image, Category, Price, Updated, Actions | cùng file trên |
| `/accessories` | Status có tác dụng thật ở public API/Studio | P0 nếu xóa | Giữ field/filter; có thể ẩn khỏi list để ưu tiên Category + Price | `accessories.service.ts`, `useStudioData.ts` |
| `/characters` | Part group/type chỉ ~65px, dễ truncate; availability bị bỏ khỏi table | P1 | Name 220+, Type 150–170, Image 100, Price 120, Status/Availability 130–150, Updated 170 | `characters/page.tsx`, `entity-manager.tsx` |
| `/characters` | `status` và `isActive` trùng nghĩa, public API kiểm tra cả hai | P0 technical debt | UI dùng một control, service đồng bộ hai field; migration riêng sau | `character-parts.service.ts`, Prisma schema |
| `/character-presets` | `isBuilderPreset` và `isSellable` được khai báo nhưng list renderer bỏ mất | P1 | Hiển thị hai cờ bằng badge/icon hoặc một cột “Kênh sử dụng”; bỏ description khỏi list | `character-presets/page.tsx`, `entity-manager.tsx` |
| `/character-presets` | Action column giãn ~190px; preview/updated/status hợp lý | P2 | Cố định Actions 104–110px | `entity-manager.tsx` |
| `/frame-backgrounds` | Bảng tương đối cân đối nhưng description là field list không cần thiết và mapping khung chỉ thấy trong form | P2 | Table: Title, Image, Sort order, Status, Updated, Actions | `frame-backgrounds/page.tsx` |
| `/frame-backgrounds` | Status có tác dụng thật ở Studio/public API | P0 nếu xóa | Giữ field/filter | `frame-backgrounds.service.ts` |
| `/collections` | Created và Updated cùng hiển thị; chiếm chỗ nhưng ít giá trị quyết định | P1 | Giữ Name, Image, Slug, Status, Updated, Actions | `collections/page.tsx`, `entity-manager.tsx` |
| `/collections` | Website thật sự lọc collection active | P0 nếu xóa | Giữ status | `collections.service.ts`, `CollectionPage.tsx` |
| `/banners` | Created + Updated dư; link target không thấy ở list | P1 | Title, Image, Link/position, Sort, Status, Updated, Actions (tối đa 7) | `banners/page.tsx`, `entity-manager.tsx` |
| `/banners` | Status là show/hide homepage | P0 nếu xóa | Giữ status và cho quick toggle ở phase sau | `banners.service.ts`, `home.loader.ts` |
| `/vouchers` | Renderer cắt `expiresAt` dù page yêu cầu; admin khó nhận biết voucher sắp/hết hạn | P0 | Code, Type, Value, Usage, Status, Expires, Actions | `vouchers/page.tsx`, `entity-manager.tsx` |
| `/vouchers` | Status + date range + usage limit đều có nghiệp vụ thật | P0 nếu xóa | Giữ, biểu diễn trạng thái dẫn xuất “hết hạn” rõ hơn | voucher service, `vouchers/page.tsx` |
| `/orders` | Table min-width 1180 trong vùng ~1055 nên có scroll ngang 125px | P1 | Width theo nội dung, sticky Actions; giữ scroll nội bộ khi cần | `orders-manager.tsx` |
| `/orders` | 3 cột status đều cần nhưng chia đều làm Actions và status quá rộng | P1 | Code 160, Customer 220, Phone 150, Amount 130, mỗi status 130–150, Actions 100 | `orders-manager.tsx` |
| `/orders` | Pagination VI có chuỗi mojibake trong fallback label | P1 | Chuyển sang i18n key sạch | `orders-manager.tsx` |
| `/orders/[id]` | Form status và log đầy đủ; dữ liệu snapshot order item là đúng nghiệp vụ | P3 | Giữ snapshot, không resolve lại từ catalog | `order-detail.tsx`, orders service |
| `/business-inquiries` | Status cell đặt badge và select cùng lúc, min-width 190 trong cột ~176, tăng row height | P1 | List chỉ badge + quick action; edit ở detail/drawer | `inquiries-manager.tsx` |
| `/business-inquiries` | Nhiều label/filter/date bị mojibake, gây khó sử dụng | P1 | Thay toàn bộ bằng key i18n sạch | `inquiries-manager.tsx`, dictionaries |
| `/business-inquiries/[id]` | Status là workflow lead, không được bỏ | P0 nếu xóa | Giữ status; bổ sung lịch sử thay đổi nếu cần | `inquiry-detail.tsx` |
| `/payment-settings` | Các field đều được checkout dùng; form 2 section hợp lý | P3 | Giữ; cân nhắc switch thay checkbox và cảnh báo ảnh hưởng public checkout | `payment-settings-form.tsx`, `ProfessionalCheckoutPage.tsx` |
| `/profile` | Dùng shell riêng, không đồng nhất AdminLayout; role label/bullet có mojibake | P1/P2 | Dùng shell/header thống nhất hoặc variant account; sửa i18n | `app/profile/page.tsx` |
| `/change-password` | Validation code cho min 6 nhưng UI hint nói min 8 | P0 | Thống nhất min 8 ở validation và backend policy | `app/change-password/page.tsx` |
| Route ẩn | `/templates` còn text hardcode/mojibake ở config JSON | P1 | Sửa i18n và xác định route active/legacy trước khi đưa vào sidebar | `templates/page.tsx` |
| Route ẩn | `/frame-sizes`, `/frame-colors` có dấu hiệu entity legacy song song `FrameOption` | P1 | Không refactor/xóa trong phase này; thống kê usage và lập migration riêng | pages tương ứng, Prisma schema |
| Toàn bộ entity table | `getEntityTableColumns` tự ép thứ tự, thêm timestamp rồi `slice(0,6)` làm mất cột page thực sự yêu cầu | P0/P1 | Column schema theo resource; page quyết định key/width/sort, shared chỉ render | `entity-manager.tsx` |
| Toàn bộ entity table | Table dùng `minWidth=960px` chung; cột chia theo heuristic nên module ít dữ liệu vẫn giãn | P1 | `minWidth` và grid/width riêng theo resource | `entity-manager.tsx`, `Table.tsx` |
| Toàn bộ entity table | Sort icon dựa trên allowlist nhưng cột synthetic/order bị ép; hành vi khó dự đoán | P2 | Sort khai báo ngay trong column policy | `entity-manager.tsx` |
| Toàn bộ modal CRUD | Khung modal generic đã khá đồng nhất, nhưng Product phức tạp hơn hẳn vẫn dùng cùng layout | P1 | Giữ modal chung cho CRUD đơn giản; Product dùng section layout/full-width riêng | `Modal.tsx`, `entity-manager.tsx`, `ProductComponentConfigField.tsx` |
| Toàn bộ Admin | Breadcrumb map thiếu characters/presets/vouchers và route ẩn | P2 | Bổ sung route map/i18n | `AdminLayout.tsx` |

## 4. Chi tiết theo page

### `/dashboard`

- **Header:** title/description đủ; không cần search, filter hay create.
- **Table:** recent orders 5 cột hợp lý, không overflow ngang ở 1366px.
- **Status:** order/payment status là nghiệp vụ thật.
- **Form:** không có.
- **Luồng:** dữ liệu aggregate đang sai semantics như bảng tổng hợp; đây là ưu tiên P0 trước cải tiến UI.

### `/products`

- **Header:** count/search/filter/create cùng một hàng, spacing ổn ở desktop.
- **Table:** hiện quá nhiều timestamp; thumbnail đặt sau timestamps; cột quan trọng phụ thuộc renderer chung thay vì page.
- **Status:** `status` và `published` đều được backend dùng, không được xóa tùy tiện. `availability` là lớp thứ ba và cần label rõ.
- **Form:** modal dài, phần cấu hình component nên là section full width. Nested horizontal scrollbar trong Accessories đã tái hiện được.
- **Luồng:** Product xuất hiện ở collection/home/detail/cart/checkout. Component config dùng ID nhưng public response có thể ưu tiên giá snapshot, cần quyết định chính sách giá.

### `/frame-options`

- **Header:** search/filter/create đầy đủ nhưng date filter ít giá trị với ba dòng.
- **Table:** Actions bị giãn quá rộng; hai timestamp dư; color bị rơi do giới hạn 6 cột.
- **Status:** public API dùng, Admin lại chưa có control — không phải status dư.
- **Form:** width/height/price/stock/image/color hợp lý; color variants là field nâng cao.
- **Luồng:** Studio và báo giá dùng frame options; thao tác vô hiệu hóa cần có đường quản trị.

### `/accessories`

- **Header:** tốt ở desktop.
- **Table:** lỗi rõ nhất là Category 42px và Price biến mất; hai timestamp thay thế cột nghiệp vụ.
- **Status:** website/Studio filter active, phải giữ.
- **Form:** các field name/price/category/images/status đều liên quan; nên chia name/category và price/status theo grid cân đối.
- **Luồng:** dùng tại Studio frame, character builder, product config và cart snapshot.

### `/characters` (`character-parts`)

- **Header:** count/search/filter/create hợp lý.
- **Table:** Type quá hẹp; availability bị bỏ; updated và price hữu ích hơn sort order trên list chính.
- **Status:** một control UI nhưng backend hiện có `status` + `isActive`; đây là technical debt, không phải field vô dụng.
- **Form:** compatibility JSON nên để advanced; image/name/type/price/availability là luồng chính.
- **Luồng:** `/studio/character` phụ thuộc trực tiếp.

### `/character-presets`

- **Header:** hợp lý.
- **Table:** hai cờ builder/sellable quan trọng bị renderer bỏ; description không nên chiếm list.
- **Status:** giữ; kết hợp với các cờ để quyết định preset xuất hiện ở đâu.
- **Form:** picker face/hair/torso/legs/hat/accessory có nghiệp vụ; modal dài nhưng không có horizontal overflow nghiêm trọng như Product.
- **Luồng:** builder presets và sellable presets khác nhau, UI cần nói rõ.

### `/frame-backgrounds`

- **Header:** hợp lý.
- **Table:** tương đối tốt; chỉ cần bỏ description/timestamp dư và cố định width.
- **Status:** giữ vì Studio/public API lọc active.
- **Form:** content fields + frame mapping cần full width; không nhập ID thô.
- **Luồng:** bước chọn nền của Studio.

### `/collections`

- **Header:** hợp lý.
- **Table:** Created + Updated cùng hiện là dư; Name/Image/Slug/Status/Updated đủ.
- **Status:** giữ vì Website lọc active.
- **Form:** name/slug/status/description/image phù hợp.
- **Luồng:** collection listing và homepage.

### `/banners`

- **Header:** hợp lý.
- **Table:** hai timestamp dư; link URL không hiển thị nên khó audit CTA.
- **Status:** giữ vì là show/hide.
- **Form:** title/sort/status/link/image phù hợp, modal đơn giản.
- **Luồng:** homepage loader lấy banner active.

### `/vouchers`

- **Header:** hợp lý.
- **Table:** ngày hết hạn bị mất là lỗi vận hành; cần ưu tiên hơn minimum order hoặc đưa đủ trong 7 cột.
- **Status:** giữ; trạng thái thực còn phụ thuộc starts/expires/usage.
- **Form:** nên group “giá trị”, “điều kiện”, “thời gian”; modal hiện dài nhưng vẫn trong viewport nhờ body scroll.
- **Luồng:** cart/checkout gọi API validate.

### `/orders` và `/orders/[id]`

- **Header:** không có create là đúng.
- **Table:** tất cả cột có nghiệp vụ, nhưng width chia đều tạo scroll ngang không tối ưu; action quá rộng.
- **Status:** giữ cả order/payment/shipping.
- **Form/detail:** detail đầy đủ; dữ liệu order item phải là snapshot.
- **Luồng:** checkout tạo, Admin xử lý, lookup đọc trạng thái.

### `/business-inquiries` và `/business-inquiries/[id]`

- **Header:** không có create là đúng.
- **Table:** status badge + select cùng cell gây cao/rộng; có mojibake ở filter.
- **Status:** giữ vì workflow lead.
- **Form/detail:** detail là nơi phù hợp để cập nhật status/ghi chú.
- **Luồng:** website business form tạo inquiry.

### `/payment-settings`

- **Header:** không cần count/search/filter/create.
- **Form:** hai section rõ; field đều được checkout dùng.
- **Luồng:** thay đổi có ảnh hưởng trực tiếp phương thức checkout, nên cần cảnh báo/confirmation ở phase sau.

### `/profile` và `/change-password`

- **Layout:** shell riêng gây cảm giác rời khỏi Admin.
- **Form:** profile đơn giản; change password có mismatch 6/8 ký tự.
- **Luồng:** không ảnh hưởng Website catalog nhưng ảnh hưởng account security.

## 5. Xác minh các lỗi người dùng nêu

| Lỗi cần xác minh | Kết quả |
|---|---|
| Product còn cột Trạng thái | Có. Status có tác dụng thật; không xóa field. Có thể giảm ưu tiên ở list sau khi làm rõ `published`. |
| Accessory còn cột Trạng thái | Có. Status có tác dụng thật ở public API/Studio; không xóa field. |
| Accessory category bị `D...`/`Tin...` | Xác nhận. Cell thực tế khoảng 42px ở viewport 1366. |
| Product có nhiều cột ngày | Xác nhận. Created + Updated cùng xuất hiện và đẩy thumbnail ra cuối. |
| Product modal bố cục component chưa hợp lý | Xác nhận. Hai picker dài nằm cạnh nhau và dùng nested scroll. |
| Khu phụ kiện có horizontal scrollbar | Xác nhận bằng DOM: `scrollWidth 395px`, `clientWidth 346px`. |
| Card nhỏ, chữ/giá xuống dòng | Xác nhận trong picker Product. |
| Frame ít dữ liệu nhưng bảng giãn quá rộng | Xác nhận. Actions từng chiếm khoảng 253px. |
| Modal tạo mới chưa đồng nhất | CRUD đơn giản dùng cùng modal; khác biệt lớn nằm ở Product và các page account dùng shell riêng. |

## 6. Thứ tự sửa đề xuất

1. **P0 dữ liệu Dashboard:** sửa định nghĩa doanh thu và aggregate chart/status.
2. **P0/P1 table policy:** bỏ cơ chế tự ép/slice cột; khai báo cột/width/sort theo resource.
3. **Accessory + Product + Frame Option:** ba bảng đang gây khó sử dụng rõ nhất.
4. **Voucher + Character Preset/Part:** trả lại cột nghiệp vụ bị renderer làm mất.
5. **Order + Inquiry:** tối ưu width, status cell và scroll nội bộ.
6. **Các CRUD còn lại:** Banner, Collection, Frame Background, route ẩn.
7. **Modal Product:** sửa nested horizontal scrollbar và responsive grid.
8. **Account/settings:** đồng bộ shell, sửa validation 6/8 và mojibake.
9. **Technical debt riêng:** `status/isActive`, `status/published`, entity frame legacy và product price snapshot. Không migration trong phase này.

## 7. Ranh giới Phase 1

- Chưa xóa status/field backend.
- Chưa migration database.
- Chưa thay đổi dữ liệu hiện có.
- Chưa sửa Website.
- Báo cáo này là đầu vào trực tiếp cho Phase 2 về table/column width/status UI.
