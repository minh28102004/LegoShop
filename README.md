# Lego Shop

Lego Shop is a monorepo project for a Lego/brick e-commerce platform. It includes a customer website, an admin dashboard, and a backend API.

## Overview

This project contains 3 main apps:

* `apps/web` - customer website
* `apps/admin` - admin dashboard
* `apps/backend` - NestJS backend API

Shared packages are located in:

* `packages/shared`

## Tech Stack

* Monorepo: pnpm workspace
* Frontend: Next.js, React, TypeScript, Tailwind CSS
* Backend: NestJS, Prisma, Swagger
* Database: Supabase PostgreSQL
* Auth: JWT for Admin APIs

## Requirements

Make sure these are installed:

```bash
node -v
pnpm -v
git --version
```

Recommended:

```txt
Node.js >= 20
pnpm >= 10
```

If pnpm is not installed:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

## Installation

Clone the repository:

```bash
git clone <repo-url>
cd LegoShop
```

Install dependencies:

```bash
pnpm install
```

## Environment Setup

Do not commit real `.env` files to Git.

Create the following local environment files.

### Web

File:

```txt
apps/web/.env.local
```

Content:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SHOP_NAME="Lego Shop"
```

### Admin

File:

```txt
apps/admin/.env.local
```

Content:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
NEXT_PUBLIC_ADMIN_NAME="Lego Shop Admin"
```

### Backend

File:

```txt
apps/backend/.env
```

Example:

```env
PORT=3002

DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"

JWT_SECRET="change-me"
JWT_EXPIRES_IN="7d"

ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="Admin@123456"
ADMIN_NAME="Lego Shop Admin"

FRONTEND_URL="http://localhost:3000"
ADMIN_URL="http://localhost:3001"

SHOP_NAME="Lego Shop"
```

## Database Setup

The database uses Supabase PostgreSQL.

Run Prisma commands inside the backend app:

```bash
cd apps/backend
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma db seed
cd ../..
```

## Run Project

Run all apps:

```bash
pnpm dev
```

Run each app separately:

```bash
pnpm dev:web
pnpm dev:admin
pnpm dev:backend
```

Local URLs:

```txt
Web:     http://localhost:3000
Admin:   http://localhost:3001
Backend: http://localhost:3002
Swagger: http://localhost:3002/docs
```

## Build and Check

Build:

```bash
pnpm build
```

Lint:

```bash
pnpm lint
```

Typecheck:

```bash
pnpm typecheck
```

## Admin Login

After running the database seed, the default local admin account is:

```txt
Email: admin@example.com
Password: Admin@123456
```

Before production deployment, change the admin password and `JWT_SECRET`.

## Git Rules

Do not work directly on `main`.

Create a new branch for each task:

```bash
git checkout -b feature/admin-login
```

Commit format examples:

```bash
git commit -m "feat(admin): add login page"
git commit -m "feat(backend): add order API"
git commit -m "fix(web): fix checkout validation"
```

Push your branch:

```bash
git push -u origin feature/admin-login
```

Then open a Pull Request into `main`.

## Project Rules

Do not casually edit shared files without team agreement:

```txt
package.json
pnpm-workspace.yaml
turbo.json
apps/backend/prisma/schema.prisma
apps/backend/prisma/migrations/*
packages/shared/*
.env.example
```

Do not commit secret or local files:

```txt
.env
.env.local
apps/backend/.env
apps/web/.env.local
apps/admin/.env.local
node_modules
.next
dist
.turbo
.npmrc
```

Files that should be committed:

```txt
.env.example
README.md
source code
schema.prisma
migration files
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
turbo.json
```

## Docker

For local development, use:

```bash
pnpm dev
```

For production deployment, Docker/Docker Compose is recommended on a VPS.

Expected services:

```txt
web       -> port 3000
admin     -> port 3001
backend   -> port 3002
nginx     -> reverse proxy
database  -> Supabase PostgreSQL
```

Do not put secrets inside Dockerfiles. Use production `.env` files or server environment variables.

## Troubleshooting

If a port is already in use on Windows:

```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

If dependencies have issues:

```bash
pnpm install
```

If Prisma cannot connect to the database, check:

```txt
DATABASE_URL
Supabase project status
Database password
Connection string
```

If Swagger does not show a new API, check:

```txt
The controller has a route
The module is imported
The backend has been restarted
```
