import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { existsSync } from 'fs';
import { join } from 'path';
import { AppModule } from "./app.module";

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
];

const DEFAULT_ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/.*\.vercel\.app$/,
];

function parseOrigins(value?: string): string[] {
  return value
    ? value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];
}

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, '');
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function wildcardToRegex(pattern: string): RegExp {
  const normalizedPattern = normalizeOrigin(pattern);
  const source = `^${escapeRegex(normalizedPattern).replace(/\\\*/g, '.*')}$`;
  return new RegExp(source);
}

function parseOriginPatterns(value?: string): RegExp[] {
  return value
    ? value
        .split(',')
        .map((pattern) => pattern.trim())
        .filter(Boolean)
        .map(wildcardToRegex)
    : [];
}

function isLoopbackOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const frontendUrl = config.get<string>('FRONTEND_URL');
  const adminUrl = config.get<string>('ADMIN_URL');
  const corsOrigins = config.get<string>('CORS_ORIGINS');
  const corsOriginPatterns = config.get<string>('CORS_ORIGIN_PATTERNS');
  const allowedOrigins = new Set([
    ...DEFAULT_ALLOWED_ORIGINS,
    ...parseOrigins(frontendUrl),
    ...parseOrigins(adminUrl),
    ...parseOrigins(corsOrigins),
  ].map(normalizeOrigin));
  const allowedOriginPatterns = [
    ...DEFAULT_ALLOWED_ORIGIN_PATTERNS,
    ...parseOriginPatterns(corsOriginPatterns),
  ];

  app.enableCors({
    origin: (origin, callback) => {
      const normalizedOrigin = origin ? normalizeOrigin(origin) : origin;
      const isPatternAllowed = normalizedOrigin
        ? allowedOriginPatterns.some((pattern) => pattern.test(normalizedOrigin))
        : false;

      if (
        !normalizedOrigin ||
        allowedOrigins.has(normalizedOrigin) ||
        isPatternAllowed ||
        isLoopbackOrigin(normalizedOrigin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${normalizedOrigin}`), false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useStaticAssets(join(process.cwd(), 'public'), { prefix: '/' });

  const sharedImageRoots = [
    join(process.cwd(), '../../packages/assets/images'),
    join(process.cwd(), 'shared/images'),
  ];
  sharedImageRoots.forEach((root) => {
    if (existsSync(root)) {
      app.useStaticAssets(root, { prefix: '/shared/images/' });
    }
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Lego Shop API")
    .setDescription("API for customer website, admin, orders and payments")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document);

  const port = config.get<number>("PORT") || 3002;
  await app.listen(port);
}

bootstrap();
