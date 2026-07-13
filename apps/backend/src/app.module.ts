import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { TemplatesModule } from './templates/templates.module';
import { AccessoriesModule } from './accessories/accessories.module';
import { BannersModule } from './banners/banners.module';
import { CollectionsModule } from './collections/collections.module';
import { FrameBackgroundsModule } from './frame-backgrounds/frame-backgrounds.module';
import { UploadsModule } from './uploads/uploads.module';
import { PaymentSettingsModule } from './payment-settings/payment-settings.module';
import { PaymentsModule } from './payments/payments.module';
import { OrdersModule } from './orders/orders.module';
import { AdminOrdersModule } from './admin-orders/admin-orders.module';
import { BusinessInquiriesModule } from './business-inquiries/business-inquiries.module';
import { AdminBusinessInquiriesModule } from './admin-business-inquiries/admin-business-inquiries.module';
import { AdminDashboardModule } from './admin-dashboard/admin-dashboard.module';
import { PrismaModule } from './prisma/prisma.module';
import { TemplateCategoriesModule } from './template-categories/template-categories.module';
import { AccessoryCategoriesModule } from './accessory-categories/accessory-categories.module';
import { FrameSizesModule } from './frame-sizes/frame-sizes.module';
import { FrameColorsModule } from './frame-colors/frame-colors.module';
import { FrameOptionsModule } from './frame-options/frame-options.module';
import { UsersModule } from './users/users.module';
import { UserDesignsModule } from './user-designs/user-designs.module';
import { VouchersModule } from './vouchers/vouchers.module';
import { CharactersModule } from './characters/characters.module';
import { CharacterPartsModule } from './character-parts/character-parts.module';
import { CharacterPresetsModule } from './character-presets/character-presets.module';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true
    }), AuthModule, ProductsModule, TemplatesModule, AccessoriesModule, BannersModule, CollectionsModule, FrameBackgroundsModule, UploadsModule, PaymentSettingsModule, PaymentsModule, OrdersModule, AdminOrdersModule, BusinessInquiriesModule, AdminBusinessInquiriesModule, AdminDashboardModule, TemplateCategoriesModule, AccessoryCategoriesModule, FrameSizesModule, FrameColorsModule, FrameOptionsModule, PrismaModule, UsersModule, UserDesignsModule, VouchersModule, CharactersModule, CharacterPartsModule, CharacterPresetsModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
