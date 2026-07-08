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

function parseOrigins(value?: string): string[] {
  return value
    ? value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
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
  const allowedOrigins = new Set([
    ...DEFAULT_ALLOWED_ORIGINS,
    ...parseOrigins(frontendUrl),
    ...parseOrigins(adminUrl),
    ...parseOrigins(corsOrigins),
  ]);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin) || isLoopbackOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`), false);
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
