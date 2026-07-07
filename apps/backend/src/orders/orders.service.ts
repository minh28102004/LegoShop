import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  FrameOptionType,
  OrderStatusHistoryType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  Prisma,
  ProductStatus,
  ShippingStatus,
} from '@prisma/client';
import { PaymentSettingsService } from '../payment-settings/payment-settings.service';
import {
  PayosPaymentItem,
  PayosPaymentLinkResult,
  PaymentsService,
} from '../payments/payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderItemDto } from './dto/create-order-item.dto';

const GIFT_PACKAGE_FEE_PER_ITEM = 30_000;
const CHARACTER_PRICE = 10_000;
const POLAROID_PRICES: Record<string, number> = {
  none: 0,
  '2': 15_000,
  '4': 25_000,
};

type ResolvedOrderItem = {
  productId?: string;
  productName: string;
  quantity: number;
  price: number;
  frameOptionId?: string;
  backgroundId?: string;
  frameSizeId?: string;
  frameSizeLabel?: string;
  frameColorName?: string;
  note?: string;
  accessories?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  designData?: Record<string, unknown>;
  previewUrl?: string;
};

type ResolvedFrameOption = {
  id: string;
  label: string;
  price: number;
  stock: number | null;
};

type NormalizedCustomerInfo = {
  name: string;
  phone: string;
  email?: string;
  zalo?: string;
  addressLine: string;
  address: string;
  province?: string;
  district?: string;
  ward?: string;
};

type OrderPricingSummary = {
  itemsAmount: number;
  itemCount: number;
  shippingMethod: string;
  shippingFee: number;
  voucherId?: string;
  voucherCode?: string;
  voucherDiscountType?: string;
  voucherDiscountValue?: number;
  discountAmount: number;
  giftPackage: boolean;
  giftFee: number;
  polaroidOption: string;
  polaroidFee: number;
  totalAmount: number;
};

type OrderPaymentPlan = {
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  depositRequired: boolean;
  depositPercent: number;
  depositAmount: number;
  remainingAmount: number;
  depositStatus: string;
  paymentType?: PaymentType;
  paymentAmount: number;
};

type OrderWithItemsAndPayments = Prisma.OrderGetPayload<{
  include: {
    items: true;
    payments: true;
  };
}>;

@Injectable()
export class OrdersService implements OnModuleInit, OnModuleDestroy {
  private expirationTimer?: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentSettingsService: PaymentSettingsService,
    private readonly paymentsService: PaymentsService,
    private readonly vouchersService: VouchersService,
  ) {}

  onModuleInit() {
    this.expirationTimer = setInterval(
      () => void this.expireOverdueOrdersSafely(),
      10 * 60 * 1000,
    );
    this.expirationTimer.unref?.();
    void this.expireOverdueOrdersSafely();
  }

  onModuleDestroy() {
    if (this.expirationTimer) {
      clearInterval(this.expirationTimer);
    }
  }

  async createOrder(dto: CreateOrderDto) {
    if (!dto.items?.length) {
      throw new BadRequestException('Order items are required');
    }

    const customer = this.normalizeCustomerInfo(dto);
    const resolvedItems = await this.resolveOrderItems(dto.items);
    const pricing = await this.createPricingSummary(dto, resolvedItems);
    const paymentSettings = await this.paymentSettingsService.getSettings();

    if (
      dto.paymentMethod === PaymentMethod.COD &&
      !paymentSettings.codEnabled
    ) {
      throw new BadRequestException('COD payment is disabled');
    }

    if (
      dto.paymentMethod === PaymentMethod.PAYOS &&
      !paymentSettings.payosEnabled
    ) {
      throw new BadRequestException('PAYOS payment is disabled');
    }

    const orderCode = await this.generateUniqueOrderCode();
    const paymentPlan = this.createPaymentPlan(
      dto.paymentMethod,
      pricing.totalAmount,
      paymentSettings,
    );
    const paymentLink = await this.createInitialPaymentLink({
      dto,
      customer,
      orderCode,
      resolvedItems,
      pricing,
      paymentPlan,
    });

    let order: Awaited<ReturnType<typeof this.prisma.order.create>>;

    try {
      order = await this.prisma.$transaction((tx) => {
        return this.createOrderWithStockReservation(tx, {
          dto,
          customer,
          orderCode,
          resolvedItems,
          pricing,
          paymentPlan,
          paymentLink,
        });
      });
    } catch (error) {
      if (paymentLink) {
        await this.paymentsService.cancelPayosPaymentLink(
          paymentLink.providerPaymentLinkId,
          'Order creation failed',
        );
      }

      throw error;
    }

    return {
      orderId: order.id,
      orderCode: order.orderCode,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      itemsAmount: order.itemsAmount,
      shippingMethod: order.shippingMethod,
      shippingFee: order.shippingFee,
      voucherCode: order.voucherCode,
      voucherDiscountType: order.voucherDiscountType,
      voucherDiscountValue: order.voucherDiscountValue,
      discountAmount: order.discountAmount,
      giftPackage: order.giftPackage,
      giftFee: order.giftFee,
      polaroidOption: order.polaroidOption,
      polaroidFee: order.polaroidFee,
      totalAmount: order.totalAmount,
      depositRequired: order.depositRequired,
      depositPercent: order.depositPercent,
      depositAmount: order.depositAmount,
      remainingAmount: order.remainingAmount,
      depositStatus: order.depositStatus,
      amountToPay: paymentPlan.paymentAmount,
      paymentUrl: order.payosCheckoutUrl ?? undefined,
      checkoutUrl: order.payosCheckoutUrl ?? undefined,
      tracking: this.toPublicTrackingSummary({
        ...order,
        items: [],
      }),
    };
  }

  private async createOrderWithStockReservation(
    tx: Prisma.TransactionClient,
    input: {
      dto: CreateOrderDto;
      customer: NormalizedCustomerInfo;
      orderCode: string;
      resolvedItems: ResolvedOrderItem[];
      pricing: OrderPricingSummary;
      paymentPlan: OrderPaymentPlan;
      paymentLink?: PayosPaymentLinkResult;
    },
  ) {
    const {
      dto,
      customer,
      orderCode,
      resolvedItems,
      pricing,
      paymentPlan,
      paymentLink,
    } = input;

    await this.reserveFrameStock(tx, resolvedItems);
    if (pricing.voucherId) {
      await this.vouchersService.markVoucherUsed(tx, pricing.voucherId);
    }

    return tx.order.create({
      data: {
        orderCode,
        customerName: customer.name,
        phone: customer.phone,
        email: customer.email,
        zalo: customer.zalo,
        address: customer.address,
        addressLine: customer.addressLine,
        province: customer.province,
        district: customer.district,
        ward: customer.ward,
        receiveDate: dto.receiveDate
          ? new Date(dto.receiveDate)
          : undefined,
        note: dto.note,
        shippingMethod: pricing.shippingMethod,
        shippingFee: pricing.shippingFee,
        voucherCode: pricing.voucherCode,
        voucherDiscountType: pricing.voucherDiscountType,
        voucherDiscountValue: pricing.voucherDiscountValue,
        discountAmount: pricing.discountAmount,
        giftPackage: pricing.giftPackage,
        giftFee: pricing.giftFee,
        polaroidOption: pricing.polaroidOption,
        polaroidFee: pricing.polaroidFee,
        paymentMethod: dto.paymentMethod,
        paymentStatus: paymentPlan.paymentStatus,
        orderStatus: paymentPlan.orderStatus,
        itemsAmount: pricing.itemsAmount,
        totalAmount: pricing.totalAmount,
        depositRequired: paymentPlan.depositRequired,
        depositPercent: paymentPlan.depositPercent,
        depositAmount: paymentPlan.depositAmount,
        remainingAmount: paymentPlan.remainingAmount,
        depositStatus: paymentPlan.depositStatus,
        expiresAt:
          paymentPlan.paymentAmount > 0
            ? new Date(Date.now() + 48 * 60 * 60 * 1000)
            : undefined,
        paymentProvider: paymentLink?.provider,
        payosOrderCode:
          paymentLink?.providerOrderCode !== undefined
            ? BigInt(paymentLink.providerOrderCode)
            : undefined,
        payosPaymentLinkId: paymentLink?.providerPaymentLinkId,
        payosCheckoutUrl: paymentLink?.checkoutUrl,
        items: {
          create: resolvedItems.map((item) =>
            this.toOrderItemCreateInput(item),
          ),
        },
        payments:
          paymentLink && paymentPlan.paymentType
            ? {
                create: this.toPaymentCreateInput(
                  paymentPlan.paymentType,
                  paymentLink,
                ),
              }
            : undefined,
      },
    });
  }

  private normalizeCustomerInfo(dto: CreateOrderDto): NormalizedCustomerInfo {
    const phone = dto.phone || dto.customerPhone;
    const email = dto.email || dto.customerEmail;
    const province = dto.province || dto.city;
    const addressLine = dto.addressLine || dto.address;

    if (!phone?.trim()) {
      throw new BadRequestException('Customer phone is required');
    }

    if (!addressLine?.trim()) {
      throw new BadRequestException('Address line is required');
    }

    const fullAddress = dto.address?.trim()
      ? dto.address.trim()
      : [addressLine, dto.ward, dto.district, province]
          .map((part) => part?.trim())
          .filter(Boolean)
          .join(', ');

    return {
      name: dto.customerName,
      phone: phone.trim(),
      ...(email?.trim() ? { email: email.trim() } : {}),
      ...(dto.customerZalo?.trim() ? { zalo: dto.customerZalo.trim() } : {}),
      addressLine: addressLine.trim(),
      address: fullAddress,
      ...(province?.trim() ? { province: province.trim() } : {}),
      ...(dto.district?.trim() ? { district: dto.district.trim() } : {}),
      ...(dto.ward?.trim() ? { ward: dto.ward.trim() } : {}),
    };
  }

  async trackOrder(orderCode: string) {
    await this.paymentsService.syncPayosPaymentStatusForOrderCode(orderCode);

    const order = await this.findOrderForPublicTracking(orderCode);

    return this.toPublicTrackingSummary(order);
  }

  async trackOrderByPhone(orderCode: string, phone: string) {
    const order = await this.findOrderForPublicTracking(orderCode);

    if (this.normalizePhone(order.phone) !== this.normalizePhone(phone)) {
      throw new NotFoundException('Order not found');
    }

    return this.toPublicTrackingSummary(order);
  }

  private async findOrderForPublicTracking(orderCode: string) {
    const payosOrderCode = this.parseSafePayosLookupCode(orderCode);
    const order = await this.prisma.order.findFirst({
      where: {
        OR: [
          { orderCode },
          ...(payosOrderCode ? [{ payosOrderCode }] : []),
        ],
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  private parseSafePayosLookupCode(value: string): bigint | null {
    const normalized = value.trim();

    if (!/^[1-9]\d*$/.test(normalized)) {
      return null;
    }

    const parsed = BigInt(normalized);

    return parsed <= BigInt(Number.MAX_SAFE_INTEGER) ? parsed : null;
  }

  async createPaymentLink(orderCode: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderCode },
      include: {
        items: true,
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const paymentSettings = await this.paymentSettingsService.getSettings();

    if (!paymentSettings.payosEnabled) {
      throw new BadRequestException('PAYOS payment is disabled');
    }

    const retryPlan = this.createRetryPaymentPlan(order);
    const activePaymentLinkIds = order.payments
      .filter(
        (payment) =>
          payment.type === retryPlan.paymentType &&
          payment.status === 'pending' &&
          payment.providerPaymentLinkId,
      )
      .map((payment) => payment.providerPaymentLinkId)
      .filter((paymentLinkId): paymentLinkId is string =>
        Boolean(paymentLinkId),
      );

    await Promise.all(
      activePaymentLinkIds.map((paymentLinkId) =>
        this.paymentsService.cancelPayosPaymentLink(
          paymentLinkId,
          'Replaced by customer payment retry',
        ),
      ),
    );

    const providerOrderCode = await this.generateUniquePayosOrderCode();
    const paymentLink = await this.paymentsService.createPayosPaymentLink({
      providerOrderCode,
      amount: retryPlan.paymentAmount,
      description: order.orderCode,
      buyerName: order.customerName,
      buyerEmail: order.email ?? undefined,
      buyerPhone: order.phone,
      buyerAddress: order.address,
      items: this.toPayosItems(
        retryPlan.paymentType,
        retryPlan.paymentAmount,
        order.orderCode,
        order.items,
        {
          shippingFee: order.shippingFee,
          giftFee: order.giftFee,
          polaroidFee: order.polaroidFee,
        },
      ),
    });

    let updatedOrder: Awaited<ReturnType<typeof this.prisma.order.update>>;

    try {
      updatedOrder = await this.prisma.$transaction(async (tx) => {
        await tx.payment.updateMany({
          where: {
            orderId: order.id,
            type: retryPlan.paymentType,
            status: 'pending',
          },
          data: {
            status: 'replaced',
          },
        });

        await tx.payment.create({
          data: {
            orderId: order.id,
            ...this.toPaymentCreateInput(retryPlan.paymentType, paymentLink),
          },
        });

        return tx.order.update({
          where: {
            id: order.id,
          },
          data: {
            paymentProvider: paymentLink.provider,
            payosOrderCode: BigInt(paymentLink.providerOrderCode),
            payosPaymentLinkId: paymentLink.providerPaymentLinkId,
            payosCheckoutUrl: paymentLink.checkoutUrl,
            paymentStatus: retryPlan.paymentStatus,
            depositStatus: retryPlan.depositStatus,
          },
        });
      });
    } catch (error) {
      await this.paymentsService.cancelPayosPaymentLink(
        paymentLink.providerPaymentLinkId,
        'Payment retry persistence failed',
      );

      throw error;
    }

    return {
      orderId: updatedOrder.id,
      orderCode: updatedOrder.orderCode,
      paymentMethod: updatedOrder.paymentMethod,
      paymentStatus: updatedOrder.paymentStatus,
      itemsAmount: updatedOrder.itemsAmount,
      shippingMethod: updatedOrder.shippingMethod,
      shippingFee: updatedOrder.shippingFee,
      voucherCode: updatedOrder.voucherCode,
      voucherDiscountType: updatedOrder.voucherDiscountType,
      voucherDiscountValue: updatedOrder.voucherDiscountValue,
      discountAmount: updatedOrder.discountAmount,
      giftPackage: updatedOrder.giftPackage,
      giftFee: updatedOrder.giftFee,
      polaroidOption: updatedOrder.polaroidOption,
      polaroidFee: updatedOrder.polaroidFee,
      totalAmount: updatedOrder.totalAmount,
      depositRequired: updatedOrder.depositRequired,
      depositPercent: updatedOrder.depositPercent,
      depositAmount: updatedOrder.depositAmount,
      remainingAmount: updatedOrder.remainingAmount,
      depositStatus: updatedOrder.depositStatus,
      amountToPay: retryPlan.paymentAmount,
      paymentUrl: updatedOrder.payosCheckoutUrl ?? undefined,
      checkoutUrl: updatedOrder.payosCheckoutUrl ?? undefined,
    };
  }

  private async resolveOrderItems(
    items: CreateOrderItemDto[],
  ): Promise<ResolvedOrderItem[]> {
    const productIds = items
      .map((item) => item.productId)
      .filter((id): id is string => !!id);
    const uniqueProductIds = Array.from(new Set(productIds));
    const frameOptionIds = Array.from(
      new Set(
        items
          .map((item) => this.getCustomFrameOptionId(item))
          .filter((id): id is string => Boolean(id)),
      ),
    );
    const backgroundIds = Array.from(
      new Set(
        items
          .map((item) => this.getBackgroundId(item))
          .filter((id): id is string => Boolean(id)),
      ),
    );
    const accessoryIds = Array.from(
      new Set(items.flatMap((item) => this.extractAccessoryIds(item))),
    );
    const [products, frameOptions, backgrounds, accessories] =
      await this.prisma.$transaction([
        this.prisma.product.findMany({
          where: {
            id: {
              in: uniqueProductIds,
            },
            status: ProductStatus.active,
          },
          select: {
            id: true,
            name: true,
            basePrice: true,
          },
        }),
        this.prisma.frameOption.findMany({
          where: {
            id: {
              in: frameOptionIds,
            },
            type: FrameOptionType.size,
            status: ProductStatus.active,
          },
          select: {
            id: true,
            name: true,
            label: true,
            widthCm: true,
            heightCm: true,
            price: true,
            stock: true,
          },
        }),
        this.prisma.frameBackground.findMany({
          where: {
            id: {
              in: backgroundIds,
            },
            status: ProductStatus.active,
          },
          select: {
            id: true,
            title: true,
            frameOptionIds: true,
          },
        }),
        this.prisma.accessory.findMany({
          where: {
            id: {
              in: accessoryIds,
            },
            status: ProductStatus.active,
          },
          select: {
            id: true,
            name: true,
            price: true,
          },
        }),
      ]);
    const productsById = new Map(
      products.map((product) => [product.id, product]),
    );
    const frameOptionsById = new Map<string, ResolvedFrameOption>(
      frameOptions.map((frameOption) => [
        frameOption.id,
        {
          id: frameOption.id,
          label: this.getFrameOptionSizeLabel(frameOption),
          price: frameOption.price,
          stock: frameOption.stock,
        },
      ]),
    );
    const backgroundsById = new Map(
      backgrounds.map((background) => [background.id, background]),
    );
    const accessoriesById = new Map(
      accessories.map((accessory) => [accessory.id, accessory]),
    );

    return items.map((item) => {
      if (this.isRetailOrderItem(item)) {
        return this.resolveRetailOrderItem(
          item,
          frameOptionsById,
          backgroundsById,
          accessoriesById,
        );
      }

      if (item.productId) {
        const product = productsById.get(item.productId);

        if (!product) {
          throw new BadRequestException(
            `Product ${item.productId} is not available`,
          );
        }

        return {
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          price: product.basePrice,
          frameOptionId: item.frameOptionId,
          backgroundId: this.getBackgroundId(item),
          frameSizeId: item.frameSizeId,
          frameSizeLabel: item.frameSizeLabel,
          frameColorName: item.frameColorName,
          note: item.note,
          accessories: this.resolveAccessorySnapshot(item, accessoriesById),
          designData: item.designData,
          previewUrl: item.previewUrl,
        };
      }

      const frameOptionId = this.getCustomFrameOptionId(item);
      if (!frameOptionId) {
        throw new BadRequestException('frameOptionId is required for custom frame items');
      }

      const frameOption = frameOptionsById.get(frameOptionId);
      if (!frameOption) {
        throw new BadRequestException(
          `Frame option ${frameOptionId} is not available`,
        );
      }

      const backgroundId = this.getBackgroundId(item);
      if (backgroundId) {
        const background = backgroundsById.get(backgroundId);
        if (!background) {
          throw new BadRequestException(
            `Frame background ${backgroundId} is not available`,
          );
        }

        if (
          background.frameOptionIds.length > 0 &&
          !background.frameOptionIds.includes(frameOptionId)
        ) {
          throw new BadRequestException(
            `Frame background ${backgroundId} does not support frame option ${frameOptionId}`,
          );
        }
      }

      const resolvedAccessories = this.resolveAccessorySnapshot(
        item,
        accessoriesById,
      );
      const accessoriesTotal = resolvedAccessories.reduce(
        (sum, accessory) => sum + accessory.price * accessory.quantity,
        0,
      );
      const designData = this.normalizeCustomDesignData(
        item.designData,
        frameOptionId,
        backgroundId,
        item.previewUrl,
      );
      const characterCount = this.getCharacterCount(designData);
      const serverComputedPrice =
        frameOption.price +
        accessoriesTotal +
        characterCount * CHARACTER_PRICE;

      return {
        productId: undefined,
        productName: item.productName || 'Khung LEGO tuy chinh',
        quantity: item.quantity,
        price: serverComputedPrice,
        frameOptionId,
        backgroundId,
        frameSizeId: frameOptionId,
        frameSizeLabel: frameOption.label ?? item.frameSizeLabel,
        frameColorName: item.frameColorName,
        note: item.note,
        accessories: resolvedAccessories,
        designData,
        previewUrl: item.previewUrl,
      };

    });
  }

  private resolveRetailOrderItem(
    item: CreateOrderItemDto,
    frameOptionsById: Map<string, ResolvedFrameOption>,
    backgroundsById: Map<string, { id: string; title: string }>,
    accessoriesById: Map<string, { id: string; name: string; price: number }>,
  ): ResolvedOrderItem {
    const retailType = this.readString(item.designData?.retailType);

    if (retailType === 'frame') {
      const frameOptionId = this.getCustomFrameOptionId(item);
      if (!frameOptionId) {
        throw new BadRequestException('frameOptionId is required for retail frame items');
      }

      const frameOption = frameOptionsById.get(frameOptionId);
      if (!frameOption) {
        throw new BadRequestException(`Frame option ${frameOptionId} is not available`);
      }

      return {
        productName: item.productName || frameOption.label,
        quantity: item.quantity,
        price: frameOption.price,
        frameOptionId,
        frameSizeId: frameOptionId,
        frameSizeLabel: item.frameSizeLabel ?? frameOption.label,
        frameColorName: item.frameColorName,
        note: item.note,
        designData: item.designData,
        previewUrl: item.previewUrl,
      };
    }

    if (retailType === 'background') {
      const backgroundId = this.getBackgroundId(item);
      if (!backgroundId) {
        throw new BadRequestException('backgroundId is required for retail background items');
      }

      const background = backgroundsById.get(backgroundId);
      if (!background) {
        throw new BadRequestException(`Frame background ${backgroundId} is not available`);
      }

      return {
        productName: item.productName || background.title,
        quantity: item.quantity,
        price: Math.max(0, item.price),
        backgroundId,
        note: item.note,
        designData: item.designData,
        previewUrl: item.previewUrl,
      };
    }

    if (retailType === 'accessory') {
      const resolvedAccessories = this.resolveAccessorySnapshot(item, accessoriesById);
      if (resolvedAccessories.length === 0) {
        throw new BadRequestException('Accessory id is required for retail accessory items');
      }

      const price = resolvedAccessories.reduce(
        (sum, accessory) => sum + accessory.price * accessory.quantity,
        0,
      );

      return {
        productName: item.productName || resolvedAccessories.map((accessory) => accessory.name).join(', '),
        quantity: item.quantity,
        price,
        note: item.note,
        accessories: resolvedAccessories,
        designData: item.designData,
        previewUrl: item.previewUrl,
      };
    }

    throw new BadRequestException('Retail item type is invalid');
  }

  private getFrameOptionSizeLabel(frameOption: {
    name: string;
    label: string | null;
    widthCm: number | null;
    heightCm: number | null;
  }): string {
    if (frameOption.widthCm !== null && frameOption.heightCm !== null) {
      return `${this.formatDimension(frameOption.widthCm)}x${this.formatDimension(
        frameOption.heightCm,
      )}`;
    }

    if (frameOption.label) {
      return frameOption.label;
    }

    return frameOption.name;
  }

  private formatDimension(value: number): string {
    return Number.isInteger(value)
      ? String(value)
      : String(value).replace(/\.?0+$/, '');
  }

  private async createPricingSummary(
    dto: CreateOrderDto,
    items: ResolvedOrderItem[],
  ): Promise<OrderPricingSummary> {
    const itemsAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const shippingMethod = dto.shippingMethod ?? 'shop_support';
    const shippingFee = this.getShippingFee();
    const giftPackage = dto.giftPackage === true;
    const giftFee = giftPackage ? itemCount * GIFT_PACKAGE_FEE_PER_ITEM : 0;
    const polaroidOption = dto.polaroidOption ?? 'none';
    const polaroidFee = POLAROID_PRICES[polaroidOption] ?? 0;
    const discountableAmount = itemsAmount + giftFee + polaroidFee;
    const voucher = dto.voucherCode
      ? await this.vouchersService.validateVoucherForAmount(
          dto.voucherCode,
          discountableAmount,
        )
      : null;
    const discountAmount = voucher?.discountAmount ?? 0;

    return {
      itemsAmount,
      itemCount,
      shippingMethod,
      shippingFee,
      ...(voucher
        ? {
            voucherId: voucher.id,
            voucherCode: voucher.code,
            voucherDiscountType: voucher.discountType,
            voucherDiscountValue: voucher.discountValue,
          }
        : {}),
      discountAmount,
      giftPackage,
      giftFee,
      polaroidOption,
      polaroidFee,
      totalAmount: Math.max(0, discountableAmount - discountAmount + shippingFee),
    };
  }

  private async reserveFrameStock(
    tx: Prisma.TransactionClient,
    items: ResolvedOrderItem[],
  ) {
    const quantities = this.getFrameStockQuantities(items);

    for (const [frameOptionId, quantity] of quantities.entries()) {
      const updated = await tx.frameOption.updateMany({
        where: {
          id: frameOptionId,
          stock: {
            not: null,
            gte: quantity,
          },
        },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });

      if (updated.count > 0) {
        continue;
      }

      const frameOption = await tx.frameOption.findUnique({
        where: { id: frameOptionId },
        select: { stock: true, label: true, name: true },
      });

      if (!frameOption || frameOption.stock === null) {
        continue;
      }

      throw new BadRequestException(
        `Frame option ${frameOption.label ?? frameOption.name} does not have enough stock`,
      );
    }
  }

  private async restoreFrameStock(
    tx: Prisma.TransactionClient,
    items: Array<{
      productId: string | null;
      frameSizeId: string | null;
      quantity: number;
    }>,
  ) {
    const quantities = this.getFrameStockQuantities(
      items
        .filter((item) => !item.productId && item.frameSizeId)
        .map((item) => ({
          productName: '',
          quantity: item.quantity,
          price: 0,
          frameOptionId: item.frameSizeId ?? undefined,
          frameSizeId: item.frameSizeId ?? undefined,
        })),
    );

    for (const [frameOptionId, quantity] of quantities.entries()) {
      await tx.frameOption.updateMany({
        where: {
          id: frameOptionId,
          stock: {
            not: null,
          },
        },
        data: {
          stock: {
            increment: quantity,
          },
        },
      });
    }
  }

  private getFrameStockQuantities(items: ResolvedOrderItem[]) {
    return items.reduce((map, item) => {
      if (item.productId || !item.frameOptionId) {
        return map;
      }

      map.set(
        item.frameOptionId,
        (map.get(item.frameOptionId) ?? 0) + item.quantity,
      );

      return map;
    }, new Map<string, number>());
  }

  private getShippingFee() {
    return 0;
  }

  private getCustomFrameOptionId(item: CreateOrderItemDto): string | undefined {
    return (
      item.frameOptionId ||
      this.readString(item.designData?.frameOptionId) ||
      item.frameSizeId
    );
  }

  private getBackgroundId(item: CreateOrderItemDto): string | undefined {
    const rawBackgroundId =
      item.backgroundId || this.readString(item.designData?.backgroundId);

    if (!rawBackgroundId) {
      return undefined;
    }

    return rawBackgroundId.replace(/^background:/, '');
  }

  private isRetailOrderItem(item: CreateOrderItemDto) {
    return this.readString(item.designData?.type) === 'RETAIL_ITEM';
  }

  private normalizeCustomDesignData(
    designData: Record<string, unknown> | undefined,
    frameOptionId: string,
    backgroundId: string | undefined,
    previewUrl?: string,
  ): Record<string, unknown> {
    const base = this.isRecord(designData) ? { ...designData } : {};
    const content = this.isRecord(base.content)
      ? base.content
      : {
          recipientName:
            this.readString((base.printText as Record<string, unknown> | undefined)?.title) ??
            this.readString((base.contentValues as Record<string, unknown> | undefined)?.recipientName) ??
            '',
          graduationDate:
            this.readString((base.printText as Record<string, unknown> | undefined)?.date) ??
            this.readString((base.contentValues as Record<string, unknown> | undefined)?.graduationDate) ??
            '',
          majorOrSchool:
            this.readString((base.contentValues as Record<string, unknown> | undefined)?.majorOrSchool) ??
            '',
          message:
            this.readString((base.printText as Record<string, unknown> | undefined)?.message) ??
            this.readString((base.contentValues as Record<string, unknown> | undefined)?.message) ??
            '',
        };

    return {
      ...base,
      version: 1,
      type: 'CUSTOM_FRAME',
      frameOptionId,
      backgroundId: backgroundId ?? null,
      content,
      uploadedImages: Array.isArray(base.uploadedImages)
        ? base.uploadedImages.filter((image) => this.isRecord(image))
        : [],
      accessories: this.normalizeDesignAccessories(base),
      characters: this.normalizeDesignCharacters(base),
      previewUrl: previewUrl ?? this.readString(base.previewUrl) ?? null,
    };
  }

  private normalizeDesignAccessories(
    designData: Record<string, unknown>,
  ): Array<Record<string, unknown>> {
    if (Array.isArray(designData.accessories)) {
      return designData.accessories
        .filter((accessory) => this.isRecord(accessory) && typeof accessory.id === 'string')
        .map((accessory) => ({
          id: accessory.id,
          name: this.readString(accessory.name) ?? '',
          quantity: this.readPositiveInt(accessory.quantity) ?? 1,
          position: this.normalizePosition(accessory.position),
        }));
    }

    return [];
  }

  private normalizeDesignCharacters(
    designData: Record<string, unknown>,
  ): Array<Record<string, unknown>> {
    if (Array.isArray(designData.characters)) {
      return designData.characters
        .filter((character) => this.isRecord(character))
        .map((character, index) => ({
          id: this.readString(character.id) ?? `character-${index + 1}`,
          name: this.readString(character.name) ?? `NV ${index + 1}`,
          x:
            this.readNumber(character.x) ??
            this.readNumber((character.position as Record<string, unknown> | undefined)?.x) ??
            0,
          y:
            this.readNumber(character.y) ??
            this.readNumber((character.position as Record<string, unknown> | undefined)?.y) ??
            0,
          scale:
            this.readNumber(character.scale) ??
            this.readNumber((character.position as Record<string, unknown> | undefined)?.scale) ??
            1,
          rotation:
            this.readNumber(character.rotation) ??
            this.readNumber(character.rotate) ??
            this.readNumber((character.position as Record<string, unknown> | undefined)?.rotation) ??
            this.readNumber((character.position as Record<string, unknown> | undefined)?.rotate) ??
            0,
          faceId: this.readString(character.faceId) ?? null,
          hairId: this.readString(character.hairId) ?? null,
          torsoId: this.readString(character.torsoId) ?? null,
          legsId: this.readString(character.legsId) ?? null,
          accessoryIds: Array.isArray(character.accessoryIds)
            ? character.accessoryIds.filter((id) => typeof id === 'string')
            : [],
        }));
    }

    if (Array.isArray(designData.elements)) {
      return designData.elements
        .filter((element) => this.isRecord(element) && element.type === 'character')
        .map((element, index) => ({
          id: this.readString(element.id) ?? `character-${index + 1}`,
          name: this.readString(element.content) ?? `NV ${index + 1}`,
          x: this.readNumber(element.x) ?? 0,
          y: this.readNumber(element.y) ?? 0,
          scale: this.readNumber(element.scale) ?? 1,
          rotation: this.readNumber(element.rotation) ?? this.readNumber(element.rotate) ?? 0,
          faceId: this.readString(element.faceId) ?? null,
          hairId: this.readString(element.hairId) ?? null,
          torsoId: this.readString(element.torsoId) ?? null,
          legsId: this.readString(element.legsId) ?? null,
          accessoryIds: Array.isArray(element.accessoryIds)
            ? element.accessoryIds.filter((id) => typeof id === 'string')
            : [],
        }));
    }

    return [];
  }

  private normalizePosition(value: unknown) {
    if (!this.isRecord(value)) {
      return { x: 0, y: 0, scale: 1, rotate: 0 };
    }

    return {
      x: this.readNumber(value.x) ?? 0,
      y: this.readNumber(value.y) ?? 0,
      scale: this.readNumber(value.scale) ?? 1,
      rotate: this.readNumber(value.rotate) ?? 0,
    };
  }

  private getAccessoryQuantityMap(item: CreateOrderItemDto) {
    const quantities = new Map<string, number>();
    const designAccessories = item.designData?.accessories;

    if (Array.isArray(designAccessories) && designAccessories.length > 0) {
      designAccessories.forEach((accessory) => {
        if (!this.isRecord(accessory) || typeof accessory.id !== 'string') {
          return;
        }

        quantities.set(
          accessory.id,
          (quantities.get(accessory.id) ?? 0) +
            (this.readPositiveInt(accessory.quantity) ?? 1),
        );
      });

      return quantities;
    }

    item.accessories?.forEach((accessory) => {
      if (this.isRecord(accessory) && typeof accessory.id === 'string') {
        quantities.set(
          accessory.id,
          (quantities.get(accessory.id) ?? 0) +
            (this.readPositiveInt(accessory.quantity) ?? 1),
        );
      }
    });

    if (quantities.size > 0) {
      return quantities;
    }

    const elements = item.designData?.elements;

    if (Array.isArray(elements)) {
      elements.forEach((element) => {
        if (
          this.isRecord(element) &&
          typeof element.accessoryId === 'string'
        ) {
          quantities.set(
            element.accessoryId,
            (quantities.get(element.accessoryId) ?? 0) + 1,
          );
        }
      });
    }

    return quantities;
  }

  private extractAccessoryIds(item: CreateOrderItemDto): string[] {
    return Array.from(this.getAccessoryQuantityMap(item).keys());
  }

  private resolveAccessorySnapshot(
    item: CreateOrderItemDto,
    accessoriesById: Map<string, { id: string; name: string; price: number }>,
  ) {
    return Array.from(this.getAccessoryQuantityMap(item).entries()).map(([accessoryId, quantity]) => {
      const accessory = accessoriesById.get(accessoryId);

      if (!accessory) {
        throw new BadRequestException(
          `Accessory ${accessoryId} is not available`,
        );
      }

      return {
        id: accessory.id,
        name: accessory.name,
        price: accessory.price,
        quantity,
      };
    });
  }

  private getCharacterCount(designData?: Record<string, unknown>) {
    if (!designData) {
      return 0;
    }

    if (Array.isArray(designData.characters)) {
      return designData.characters.filter((character) =>
        this.isRecord(character),
      ).length;
    }

    if (Array.isArray(designData.elements)) {
      return designData.elements.filter(
        (element) => this.isRecord(element) && element.type === 'character',
      ).length;
    }

    return 0;
  }

  private readString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  }

  private readNumber(value: unknown): number | undefined {
    return typeof value === 'number' && Number.isFinite(value)
      ? value
      : undefined;
  }

  private readPositiveInt(value: unknown): number | undefined {
    const numberValue =
      typeof value === 'number'
        ? value
        : typeof value === 'string'
          ? Number(value)
          : NaN;

    if (!Number.isFinite(numberValue)) {
      return undefined;
    }

    return Math.max(1, Math.floor(numberValue));
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private createPaymentPlan(
    paymentMethod: PaymentMethod,
    totalAmount: number,
    paymentSettings: {
      codDepositEnabled: boolean;
      codDepositPercent: number;
    },
  ): OrderPaymentPlan {
    if (totalAmount <= 0) {
      return {
        paymentStatus: PaymentStatus.paid,
        orderStatus: OrderStatus.confirmed,
        depositRequired: false,
        depositPercent: 0,
        depositAmount: 0,
        remainingAmount: 0,
        depositStatus: 'not_required',
        paymentAmount: 0,
      };
    }

    if (paymentMethod === PaymentMethod.COD) {
      if (!paymentSettings.codDepositEnabled) {
        return {
          paymentStatus: PaymentStatus.unpaid,
          orderStatus: OrderStatus.pending,
          depositRequired: false,
          depositPercent: 0,
          depositAmount: 0,
          remainingAmount: totalAmount,
          depositStatus: 'not_required',
          paymentAmount: 0,
        };
      }

      const depositPercent = paymentSettings.codDepositPercent;

      if (depositPercent <= 0 || depositPercent > 100) {
        throw new BadRequestException('COD deposit settings are invalid');
      }

      const depositAmount = Math.round((totalAmount * depositPercent) / 100);

      if (depositAmount <= 0) {
        throw new BadRequestException('COD deposit amount is invalid');
      }

      return {
        paymentStatus: PaymentStatus.deposit_pending,
        orderStatus: OrderStatus.pending,
        depositRequired: true,
        depositPercent,
        depositAmount,
        remainingAmount: totalAmount - depositAmount,
        depositStatus: 'pending',
        paymentType: PaymentType.cod_deposit,
        paymentAmount: depositAmount,
      };
    }

    return {
      paymentStatus: PaymentStatus.pending,
      orderStatus: OrderStatus.pending,
      depositRequired: false,
      depositPercent: 0,
      depositAmount: 0,
      remainingAmount: 0,
      depositStatus: 'not_required',
      paymentType: PaymentType.full_payment,
      paymentAmount: totalAmount,
    };
  }

  private async createInitialPaymentLink(input: {
    dto: CreateOrderDto;
    customer: NormalizedCustomerInfo;
    orderCode: string;
    resolvedItems: ResolvedOrderItem[];
    pricing: OrderPricingSummary;
    paymentPlan: OrderPaymentPlan;
  }): Promise<PayosPaymentLinkResult | undefined> {
    if (
      !input.paymentPlan.paymentType ||
      input.paymentPlan.paymentAmount <= 0
    ) {
      return undefined;
    }

    const providerOrderCode = await this.generateUniquePayosOrderCode();

    return this.paymentsService.createPayosPaymentLink({
      providerOrderCode,
      amount: input.paymentPlan.paymentAmount,
      description: input.orderCode,
      buyerName: input.customer.name,
      buyerEmail: input.customer.email,
      buyerPhone: input.customer.phone,
      buyerAddress: input.customer.address,
      items: this.toPayosItems(
        input.paymentPlan.paymentType,
        input.paymentPlan.paymentAmount,
        input.orderCode,
        input.resolvedItems,
        {
          shippingFee: input.pricing.shippingFee,
          giftFee: input.pricing.giftFee,
          polaroidFee: input.pricing.polaroidFee,
        },
      ),
    });
  }

  private createRetryPaymentPlan(order: OrderWithItemsAndPayments) {
    if (
      order.orderStatus === OrderStatus.cancelled ||
      order.shippingStatus === ShippingStatus.cancelled
    ) {
      throw new BadRequestException('Cancelled orders cannot be repaid');
    }

    if (order.paymentMethod === PaymentMethod.COD) {
      if (!order.depositRequired) {
        throw new BadRequestException('Order does not require online payment');
      }

      if (
        order.paymentStatus === PaymentStatus.deposit_paid ||
        order.paymentStatus === PaymentStatus.paid ||
        order.depositStatus === 'paid'
      ) {
        throw new BadRequestException('COD deposit has already been paid');
      }

      if (order.depositAmount <= 0) {
        throw new BadRequestException('COD deposit amount is invalid');
      }

      return {
        paymentType: PaymentType.cod_deposit,
        paymentAmount: order.depositAmount,
        paymentStatus: PaymentStatus.deposit_pending,
        depositStatus: 'pending',
      };
    }

    if (
      order.paymentStatus === PaymentStatus.paid ||
      order.paymentStatus === PaymentStatus.refunded
    ) {
      throw new BadRequestException('Order payment is already completed');
    }

    if (order.totalAmount <= 0) {
      throw new BadRequestException('Order payment amount is invalid');
    }

    return {
      paymentType: PaymentType.full_payment,
      paymentAmount: order.totalAmount,
      paymentStatus: PaymentStatus.pending,
      depositStatus: order.depositStatus,
    };
  }

  private toPublicTrackingSummary(order: {
    orderCode: string;
    phone: string;
    email: string | null;
    address: string;
    receiveDate: Date | null;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    shippingStatus: ShippingStatus;
    itemsAmount: number;
    shippingMethod: string | null;
    discountAmount: number;
    voucherCode: string | null;
    totalAmount: number;
    depositRequired: boolean;
    depositPercent: number;
    depositAmount: number;
    remainingAmount: number;
    payosCheckoutUrl: string | null;
    expiresAt?: Date | null;
    createdAt: Date;
    updatedAt?: Date;
    items: Array<{
      productName: string;
      quantity: number;
      price: number;
      note: string | null;
      frameSizeLabel: string | null;
      frameColorName: string | null;
      accessories: Prisma.JsonValue | null;
      designData: Prisma.JsonValue | null;
      previewUrl: string | null;
    }>;
  }) {
    return {
      orderCode: order.orderCode,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      shippingStatus: order.shippingStatus,
      paymentMethod: order.paymentMethod,
      shippingMethod: order.shippingMethod,
      items: order.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        note: item.note,
        frameSizeLabel: item.frameSizeLabel,
        frameColorName: item.frameColorName,
        accessories: this.toPublicAccessorySummary(item.accessories),
        designData: this.isRecord(item.designData) ? item.designData : null,
        previewUrl: item.previewUrl,
      })),
      itemsAmount: order.itemsAmount,
      discountAmount: order.discountAmount,
      voucherCode: order.voucherCode,
      totalAmount: order.totalAmount,
      paidAmount: this.getPaidAmount(order),
      depositRequired: order.depositRequired,
      depositPercent: order.depositPercent,
      depositAmount: order.depositAmount,
      remainingAmount: order.remainingAmount,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      expiresAt: order.expiresAt ?? null,
      receiveDate: order.receiveDate,
      maskedPhone: this.maskPhone(order.phone),
      maskedEmail: this.maskEmail(order.email),
      maskedAddress: this.maskAddress(order.address),
      checkoutUrl: order.payosCheckoutUrl,
    };
  }

  private toPublicAccessorySummary(value: Prisma.JsonValue | null) {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.flatMap((item) => {
      if (!this.isRecord(item) || typeof item.id !== 'string') {
        return [];
      }

      return [{
        id: String(item.id),
        name: this.readString(item.name) ?? 'Accessory',
        quantity: this.readPositiveInt(item.quantity) ?? 1,
      }];
    });
  }

  private getPaidAmount(order: {
    paymentStatus: PaymentStatus;
    totalAmount: number;
    depositAmount: number;
  }) {
    if (order.paymentStatus === PaymentStatus.paid) {
      return order.totalAmount;
    }

    if (order.paymentStatus === PaymentStatus.deposit_paid) {
      return order.depositAmount;
    }

    return 0;
  }

  private normalizePhone(value: string) {
    return value.replace(/\D/g, '');
  }

  private maskPhone(value: string) {
    const normalized = this.normalizePhone(value);
    if (normalized.length <= 4) return '****';
    return `${normalized.slice(0, 3)}****${normalized.slice(-3)}`;
  }

  private maskEmail(value?: string | null) {
    if (!value) return null;
    const [name, domain] = value.split('@');
    if (!name || !domain) return null;
    return `${name.slice(0, 2)}***@${domain}`;
  }

  private maskAddress(value: string) {
    const parts = value.split(',').map((part) => part.trim()).filter(Boolean);
    if (parts.length <= 2) return '***';
    return `***, ${parts.slice(1).join(', ')}`;
  }

  private async expireOverdueOrdersSafely() {
    try {
      await this.expireOverdueOrders();
    } catch (error) {
      console.error('Failed to expire overdue orders:', error);
    }
  }

  private async expireOverdueOrders() {
    const now = new Date();
    const orders = await this.prisma.order.findMany({
      where: {
        expiresAt: {
          lte: now,
        },
        orderStatus: {
          notIn: [OrderStatus.cancelled, OrderStatus.completed],
        },
        paymentStatus: {
          in: [
            PaymentStatus.unpaid,
            PaymentStatus.pending,
            PaymentStatus.deposit_pending,
            PaymentStatus.failed,
          ],
        },
      },
      include: {
        items: true,
      },
      take: 50,
    });

    for (const order of orders) {
      await this.prisma.$transaction(async (tx) => {
        await this.restoreFrameStock(tx, order.items);

        await tx.order.update({
          where: { id: order.id },
          data: {
            orderStatus: OrderStatus.cancelled,
            paymentStatus: PaymentStatus.cancelled,
            shippingStatus: ShippingStatus.cancelled,
            cancelledAt: now,
            cancelReason: 'Auto-cancelled after 48 hours without payment',
          },
        });

        await tx.orderStatusHistory.createMany({
          data: [
            {
              orderId: order.id,
              type: OrderStatusHistoryType.ORDER_STATUS,
              fromValue: order.orderStatus,
              toValue: OrderStatus.cancelled,
              note: 'Auto-cancelled after 48 hours without payment',
            },
            {
              orderId: order.id,
              type: OrderStatusHistoryType.PAYMENT_STATUS,
              fromValue: order.paymentStatus,
              toValue: PaymentStatus.cancelled,
              note: 'Auto-cancelled after 48 hours without payment',
            },
            {
              orderId: order.id,
              type: OrderStatusHistoryType.SHIPPING_STATUS,
              fromValue: order.shippingStatus,
              toValue: ShippingStatus.cancelled,
              note: 'Auto-cancelled after 48 hours without payment',
            },
          ],
        });
      });
    }
  }

  private toPayosItems(
    paymentType: PaymentType,
    paymentAmount: number,
    orderCode: string,
    items: Array<Pick<ResolvedOrderItem, 'productName' | 'quantity' | 'price'>>,
    fees?: {
      shippingFee?: number;
      giftFee?: number;
      polaroidFee?: number;
    },
  ): PayosPaymentItem[] {
    if (paymentType === PaymentType.cod_deposit) {
      return [
        {
          name: `Deposit ${orderCode}`.slice(0, 100),
          quantity: 1,
          price: paymentAmount,
        },
      ];
    }

    const payosItems: PayosPaymentItem[] = items.map((item) => ({
      name: item.productName.slice(0, 100),
      quantity: item.quantity,
      price: item.price,
    }));

    if (fees?.shippingFee) {
      payosItems.push({
        name: 'Shipping fee',
        quantity: 1,
        price: fees.shippingFee,
      });
    }

    if (fees?.giftFee) {
      payosItems.push({
        name: 'Gift package',
        quantity: 1,
        price: fees.giftFee,
      });
    }

    if (fees?.polaroidFee) {
      payosItems.push({
        name: 'Polaroid photos',
        quantity: 1,
        price: fees.polaroidFee,
      });
    }

    const itemTotal = payosItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    if (itemTotal !== paymentAmount) {
      return [
        {
          name: `Order ${orderCode}`.slice(0, 100),
          quantity: 1,
          price: paymentAmount,
        },
      ];
    }

    return payosItems;
  }

  private toOrderItemCreateInput(
    item: ResolvedOrderItem,
  ): Prisma.OrderItemCreateWithoutOrderInput {
    return {
      product: item.productId
        ? {
            connect: {
              id: item.productId,
            },
          }
        : undefined,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      note: item.note,
      frameOptionId: item.frameOptionId,
      backgroundId: item.backgroundId,
      frameSizeId: item.frameSizeId,
      frameSizeLabel: item.frameSizeLabel,
      frameColorName: item.frameColorName,
      accessories:
        item.accessories !== undefined
          ? (item.accessories as Prisma.InputJsonValue)
          : undefined,
      designData:
        item.designData !== undefined
          ? (item.designData as Prisma.InputJsonValue)
          : undefined,
      previewUrl: item.previewUrl,
    };
  }

  private toPaymentCreateInput(
    paymentType: PaymentType,
    paymentLink: PayosPaymentLinkResult,
  ): Prisma.PaymentUncheckedCreateWithoutOrderInput {
    return {
      provider: paymentLink.provider,
      type: paymentType,
      providerOrderCode: BigInt(paymentLink.providerOrderCode),
      providerPaymentLinkId: paymentLink.providerPaymentLinkId,
      amount: paymentLink.amount,
      status: 'pending',
      checkoutUrl: paymentLink.checkoutUrl,
      rawResponse: paymentLink.rawResponse,
    };
  }

  private async generateUniqueOrderCode(): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const orderCode = this.generateOrderCode();

      const existingOrder = await this.prisma.order.findUnique({
        where: { orderCode },
        select: { id: true },
      });

      if (!existingOrder) {
        return orderCode;
      }
    }

    throw new InternalServerErrorException(
      'Unable to generate unique order code',
    );
  }

  private generateOrderCode() {
    const now = new Date();
    const yyyy = now.getFullYear().toString();
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd = now.getDate().toString().padStart(2, '0');
    const randomDigits = Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(6, '0');

    return `LS${yyyy}${mm}${dd}${randomDigits}`;
  }

  private async generateUniquePayosOrderCode(): Promise<number> {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const providerOrderCode = this.generatePayosOrderCode();
      const providerOrderCodeForStorage = BigInt(providerOrderCode);

      const [existingOrder, existingPayment] = await this.prisma.$transaction([
        this.prisma.order.findUnique({
          where: { payosOrderCode: providerOrderCodeForStorage },
          select: { id: true },
        }),
        this.prisma.payment.findFirst({
          where: { providerOrderCode: providerOrderCodeForStorage },
          select: { id: true },
        }),
      ]);

      if (!existingOrder && !existingPayment) {
        return providerOrderCode;
      }
    }

    throw new InternalServerErrorException(
      'Unable to generate unique payOS order code',
    );
  }

  private generatePayosOrderCode(): number {
    const timestamp = Date.now();
    const randomDigits = Math.floor(Math.random() * 1_000);
    const providerOrderCode = timestamp * 1_000 + randomDigits;

    if (!Number.isSafeInteger(providerOrderCode) || providerOrderCode <= 0) {
      throw new InternalServerErrorException(
        'Generated payOS order code is unsafe',
      );
    }

    return providerOrderCode;
  }
}
