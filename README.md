# Lego Shop

Website bán sản phẩm Lego/brick, mô hình lắp ráp, minifigure, phụ kiện và sản phẩm cá nhân hóa.

## Tech Stack

- Monorepo: pnpm workspace
- Dev runner: concurrently
- Build runner: Turborepo
- Customer Web: Next.js, React, Tailwind CSS
- Admin Web: Next.js, React, Tailwind CSS
- Backend API: NestJS
- Database: PostgreSQL / Supabase
- ORM: Prisma
- Payment: COD, payOS

## Project Structure

```txt
LegoShop/
├─ apps/
│  ├─ web/       # Customer website
│  ├─ admin/     # Admin dashboard
│  └─ backend/   # NestJS API
├─ packages/
│  └─ shared/    # Shared types/constants
├─ docs/
├─ infra/
├─ package.json
├─ pnpm-workspace.yaml
├─ turbo.json
└─ pnpm-lock.yaml