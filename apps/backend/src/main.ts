import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { join } from 'path';
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const frontendUrl = config.get<string>('FRONTEND_URL');
  const adminUrl = config.get<string>('ADMIN_URL');

  app.enableCors({
    origin: [frontendUrl, adminUrl].filter((value): value is string => Boolean(value)),
    credentials: true
  });

  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/',
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