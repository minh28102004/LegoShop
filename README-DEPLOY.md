# 🚀 Vercel-Level Platform Engineering: SaaS Production Deployment

> **Kiến trúc Monorepo:** TurboRepo (v2+) + PNPM Workspaces + NestJS + Docker (Node 22 LTS)

---

## 💥 1. Phân Tích Root Cause Trình Độ Cao (The "Why")

Khi bạn chạy `turbo prune backend --docker`, hệ thống thường bị đâm crash với lỗi `Cannot prune without parsed lockfile` hoặc `could not resolve workspaces`. Tại sao?

### Nguyên Nhân Cốt Lõi:
1. **Thiếu Ngữ Cảnh Đồ Thị (Missing Workspace Graph):**
   Trình Parser (viết bằng Rust) của Turbo không chỉ "đọc" một file `pnpm-lock.yaml` đơn lẻ. Nó bắt buộc phải đọc `pnpm-workspace.yaml` để hiểu "định nghĩa không gian làm việc" (ví dụ: `apps/*`), sau đó nó đệ quy vào TỪNG thư mục con để quét các `package.json`. Nếu trong Dockerfile, bạn không COPY thư mục `apps/` và các tệp cấu hình vào Stage `pruner`, đồ thị (Graph) sẽ bị khuyết, và thuật toán của Turbo sẽ sụp đổ ngay lập tức.
2. **Sai Lầm "pnpm install trước prune":**
   Một số tài liệu hoặc AI cấp thấp khuyên bạn hãy `pnpm install` trước khi chạy `prune` để "lấp đầy node_modules giúp parser hoạt động". **Đây là một Anti-Pattern chí mạng.** Chạy install toàn bộ monorepo trước khi prune sẽ tải hàng GB code Frontend (React/Vite) dư thừa, làm chậm quá trình Build gấp 5 lần và hoàn toàn đánh mất ý nghĩa "Cô lập Cache" của TurboRepo.
3. **Sự Lệch Pha Phiên Bản (Version Mismatch):**
   PNPM v9 thay đổi định dạng lockfile. Turbo v2 mới đủ khả năng parse nó bằng built-in module `node:sqlite`. Nếu sử dụng Node.js bản cũ (dưới 22) hoặc không Pin version (dùng latest), các module này đụng độ nhau gây văng parse failure.

---

## 🎯 2. Giải Pháp & The Fix Principle

Quy tắc bất di bất dịch của một hệ thống CI/CD chuẩn mực:
- **Strictly Pinned Versions**: Ép cứng Node `22.12.0`, PNPM `9.15.4`, Turbo `2.3.0`. Đảm bảo Build ngày hôm nay và Build 6 tháng sau cho ra đúng 1 kết quả (100% Reproducible).
- **Tuyệt đối không `COPY . .` vào Pruner**: Việc copy toàn bộ mã nguồn (.git, README, docs, ảnh) làm giảm tuổi thọ Cache. Ta chỉ nhặt ĐÚNG các file cấu trúc cấu thành nên Workspace.
- **Tuyệt đối không `pnpm install` vào Pruner**: Turbo phải là lệnh chạy đầu tiên.
- **Không Cài Global (`npm i -g turbo`)**: Gây bẩn môi trường. Thay vào đó dùng `pnpm dlx turbo@2.3.0`.

---

## 🧩 3. Workflow Của Turbo Prune (Chính Xác 100%)

Cách Turbo tách nhỏ Monorepo của bạn:
1. **Quét Cấu Trúc:** Đọc `pnpm-workspace.yaml` và duyệt qua `apps/`.
2. **Đối Chiếu Graph:** Phân tích `package.json` của `backend` và ánh xạ qua `pnpm-lock.yaml`.
3. **Cắt Xén (Prune):** 
   - Nó sinh ra thư mục `/out/json`: Chỉ chứa những `package.json` của backend và các thư viện thực sự liên quan. (Trọng lượng: vài KB).
   - Nó sinh ra thư mục `/out/full`: Mã nguồn thực tế của Backend.
4. **Cài Đặt Siêu Tốc (Stage Deps):** Hệ thống cầm `/out/json` đi `pnpm install`. Vì file json này đã bị gọt sạch bóng hình của Frontend, PNPM chỉ tải về vài chục MB code của Backend.

---

## 🐳 4. Kiến Trúc Dockerfile 5 Stages (SaaS Standard)

1. **`base`**: Node 22-slim LTS (hỗ trợ sqlite) + PNPM 9.x + OpenSSL (yêu cầu của Prisma).
2. **`pruner`**: Nhận **ĐÚNG** các file cấu trúc (`package.json`, lockfile, workspace, thư mục `apps/`). Chạy `pnpm dlx turbo prune`.
3. **`deps`**: (Layer Cache Tuyệt Đối). Nó lấy `/out/json` từ Pruner và chạy `pnpm install`. Nếu lập trình viên chỉ sửa code TS mà không cài thêm npm package, Docker sẽ dùng lại Cache của Stage này mà không tốn 1 mili-giây nào để chạy lệnh.
4. **`builder`**: Lấy module từ deps, code từ pruner. Thực thi `npx prisma generate` (an toàn tuyệt đối ở build time) và build ứng dụng. Sau đó dùng `pnpm deploy` lọc ra folder `/pruned` chỉ chứa file cần chạy.
5. **`runner`**: Image tí hon chạy ứng dụng dưới định danh `nestjs` (non-root security).

---

## 🛡 5. Chiến Lược Dữ Liệu: Prisma ORM

- **Generate ở Runtime (Lỗi Nghiêm Trọng):** Cấm việc để container Production vừa bật lên là chạy `prisma generate`. Rất dễ gây lỗi binary file và trì hoãn boot time.
- **`prisma migrate dev`**: Cấm dùng trên hệ thống VPS thật. Lệnh này có khả năng xóa và tạo lại Database.
- **`prisma migrate deploy`**: Lệnh duy nhất bạn được chạy trên Server để update Database an toàn:
  ```bash
  docker compose exec backend npx prisma migrate deploy
  ```

---

## 🚀 6. Hướng Dẫn Vận Hành VPS Trơn Tru

Chuyển tới thư mục dự án `/var/www/legoshop`:

### 🔄 Cập Nhật Phiên Bản Không Downtime
Tránh sập API khi update code:
```bash
# 1. Kéo code mới
git pull origin main

# 2. Build Image chạy ngầm (Container cũ vẫn đang sống)
docker compose build

# 3. Đánh Tag phiên bản (vd: v2)
docker tag legoshop-backend:latest legoshop-backend:v2

# 4. Thay thế Container (thời gian switch < 1 giây)
docker compose up -d

# 5. Dọn dẹp image cũ
docker image prune -f
```

### ⏪ Cứu Hộ Khẩn Cấp (Rollback)
Nếu bản `v2` lỗi 500:
```bash
# Đổi "image: legoshop-backend:latest" thành "image: legoshop-backend:v1" trong docker-compose.yml
nano docker-compose.yml

# Bật lại bản cũ bằng 1 click với 0s build time
docker compose up -d
```
