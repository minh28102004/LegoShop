# =============================================================================
# apps/backend/Dockerfile — Vercel/SaaS Grade Production Build
# Architecture: Node 22 LTS, PNPM 9.x/11.x, Turbo 2.x, NestJS, Prisma
# Focus: Absolute Precision in Workspace Context & Caching
# =============================================================================

# ── Stage 1: Base ─────────────────────────────────────────────────────────────
FROM node:22.14.0-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# [CRITICAL FIX: COREPACK SIGNATURE ERROR]
# Gần đây NPM Registry đã thay đổi/cập nhật khóa chữ ký (signature keys).
# Bản corepack mặc định đi kèm trong Node 22.12.0 bị cũ danh sách key này, 
# dẫn đến lỗi "Cannot find matching keyid" khi nó cố tải pnpm.
# Giải pháp: Update corepack lên phiên bản mới nhất qua npm trước khi kích hoạt.
RUN npm install -g corepack@latest

# Ép cứng phiên bản. (Lưu ý: Nếu package.json của bạn có trường "packageManager": "pnpm@11.x",
# Corepack sẽ tự động tôn trọng và tải bản 11.x thay vì 9.x. Lệnh update corepack ở trên
# đã fix luôn lỗi crash khi tải bản 11.x này).
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Cài đặt OpenSSL: Bắt buộc để Prisma Query Engine có thể tương tác với Database.
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# ── Stage 2: Pruner ───────────────────────────────────────────────────────────
FROM base AS pruner
WORKDIR /app

# CHỈ COPY những file/folder cốt lõi cấu thành nên cấu trúc Monorepo.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/ ./apps/
# Nếu có thư mục packages, uncomment dòng dưới:
# COPY packages/ ./packages/

# Bắt buộc: KHÔNG `pnpm install` ở đây.
# Sử dụng trực tiếp `pnpm dlx` để tải và chạy Turbo ở vùng không gian cô lập.
RUN pnpm dlx turbo@2.9.18 prune backend --docker

# ── Stage 3: Deps (Layer Caching Tuyệt Đối) ───────────────────────────────────
FROM base AS deps
WORKDIR /app

# CHỈ COPY CÁC TỆP KHAI BÁO JSON (package.json đã bị cắt gọn) VÀ LOCKFILE.
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Cài đặt. Vì `out/json` chỉ chứa thông tin của `backend`, PNPM sẽ hoàn toàn bỏ qua các
# dependencies nặng nề của `web` và `admin`.
RUN pnpm install --frozen-lockfile

# ── Stage 4: Builder ──────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

# Tái sử dụng TOÀN BỘ node_modules đã được install từ Stage Deps (bao gồm cả thư mục con)
COPY --from=deps /app/ .
# Lấy mã nguồn thực tế (source files) từ Stage Pruner
COPY --from=pruner /app/out/full/ .

# Prisma Generate lần 1: BẮT BUỘC phải sinh ra ở đây để TypeScript có Type mà compile code NestJS
# Truyền biến DATABASE_URL ảo để vượt qua PrismaConfigEnvError trên Render
WORKDIR /app/apps/backend
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Xây dựng ứng dụng NestJS (Dùng phiên bản Turbo đã ghim)
WORKDIR /app
RUN pnpm dlx turbo@2.9.18 run build --filter=backend

# Đóng gói Production: Dùng tính năng `deploy` của PNPM để trích xuất một
# thư mục (/pruned) HOÀN TOÀN TÁCH BIỆT, chỉ chứa các gói dependencies thật sự dùng cho Runtime.
RUN pnpm --filter backend --prod deploy /pruned

# Chuyển kết quả biên dịch và cấu trúc DB sang thư mục production
RUN cp -r apps/backend/dist /pruned/dist && \
    cp -r apps/backend/prisma /pruned/prisma

# Quan trọng nhất: Sinh Prisma Client trực tiếp bên trong thư mục /pruned.
# Do /pruned là môi trường production độc lập, npx sẽ tự động đặt .prisma vào đúng /pruned/node_modules/.prisma
# Không copy prisma.config.ts sang đây để tránh lỗi PrismaConfigEnvError do thiếu dotenv ở production.
WORKDIR /pruned
RUN npx --yes prisma generate

# ── Stage 5: Production Runner ────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Bảo mật tối thượng: Ứng dụng Node.js chạy dưới quyền user bình thường (không phải root)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nestjs

# Sao chép thư mục bundle từ Builder. Image cuối cùng cực nhẹ vì không chứa mã nguồn FE,
# không chứa devDependencies, không chứa các công cụ Turbo/PNPM.
COPY --from=builder --chown=nestjs:nodejs /pruned ./

# Fail-Safe: Dừng Docker build ngay lập tức nếu file thực thi không được tạo ra.
RUN test -f dist/src/main.js || (echo "CRASH: Missing dist/src/main.js" && exit 1)

USER nestjs
EXPOSE 3000

# Sử dụng HTTP gốc của Nodejs làm Healthcheck, loại bỏ sự phụ thuộc vào curl/wget
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) process.exit(1)})"

# Execute
CMD ["node", "dist/src/main.js"]
