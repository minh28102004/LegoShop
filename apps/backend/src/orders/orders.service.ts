import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
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
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderItemDto } from './dto/create-order-item.dto';

const FREESHIP_THRESHOLD = 349_000;
const STANDARD_SHIPPING_FEE = 25_000;
const FAST_SHIPPING_FEE = 45_000;
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
  frameSizeId?: string;
  frameSizeLabel?: string;
  frameColorName?: string;
  accessories?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  designData?: Record<string, unknown>;
  previewUrl?: string;
};

type OrderPricingSummary = {
  itemsAmount: number;
  itemCount: number;
  shippingMethod: string;
  shippingFee: number;
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
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentSettingsService: PaymentSettingsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    if (!dto.items?.length) {
      throw new BadRequestException('Order items are required');
    }

    const resolvedItems = await this.resolveOrderItems(dto.items);
    const pricing = this.createPricingSummary(dto, resolvedItems);
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
      orderCode,
      resolvedItems,
      pricing,
      paymentPlan,
    });

    let order: Awaited<ReturnType<typeof this.prisma.order.create>>;

    try {
      order = await this.prisma.$transaction((tx) => {
        return tx.order.create({
          data: {
            orderCode,
            customerName: dto.customerName,
            phone: dto.phone,
            email: dto.email,
            address: dto.address,
            province: dto.province,
            district: dto.district,
            ward: dto.ward,
            receiveDate: dto.receiveDate
              ? new Date(dto.receiveDate)
              : undefined,
            note: dto.note,
            shippingMethod: pricing.shippingMethod,
            shippingFee: pricing.shippingFee,
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
      checkoutUrl: order.payosCheckoutUrl ?? undefined,
    };
  }

  async trackOrder(orderCode: string) {
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

    return {
      orderCode: order.orderCode,
      customerName: order.customerName,
      phone: order.phone,
      email: order.email,
      address: order.address,
      province: order.province,
      district: order.district,
      ward: order.ward,
      receiveDate: order.receiveDate,
      note: order.note,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      itemsAmount: order.itemsAmount,
      shippingMethod: order.shippingMethod,
      shippingFee: order.shippingFee,
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
      depositPaidAt: order.depositPaidAt,
      orderStatus: order.orderStatus,
      shippingStatus: order.shippingStatus,
      checkoutUrl: order.payosCheckoutUrl,
      paymentProvider: order.paymentProvider,
      paymentLinkId: order.payosPaymentLinkId,
      payments: order.payments.map((payment) => ({
        id: payment.id,
        provider: payment.provider,
        type: payment.type,
        amount: payment.amount,
        status: payment.status,
        checkoutUrl: payment.checkoutUrl,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
      })),
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        frameSizeId: item.frameSizeId,
        frameSizeLabel: item.frameSizeLabel,
        frameColorName: item.frameColorName,
        accessories: item.accessories,
        designData: item.designData,
        previewUrl: item.previewUrl,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
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
    const frameSizeIds = Array.from(
      new Set(
        items
          .map((item) => item.frameSizeId)
          .filter((id): id is string => Boolean(id)),
      ),
    );
    const accessoryIds = Array.from(
      new Set(items.flatMap((item) => this.extractAccessoryIds(item))),
    );

    const [products, frameSizes, accessories] = await this.prisma.$transaction([
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
      this.prisma.frameSize.findMany({
        where: {
          id: {
            in: frameSizeIds,
          },
          status: ProductStatus.active,
        },
        select: {
          id: true,
          label: true,
          price: true,
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
    const frameSizesById = new Map(
      frameSizes.map((frameSize) => [frameSize.id, frameSize]),
    );
    const accessoriesById = new Map(
      accessories.map((accessory) => [accessory.id, accessory]),
    );

    return items.map((item) => {
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
          frameSizeId: item.frameSizeId,
          frameSizeLabel: item.frameSizeLabel,
          frameColorName: item.frameColorName,
          accessories: this.resolveAccessorySnapshot(item, accessoriesById),
          designData: item.designData,
          previewUrl: item.previewUrl,
        };
      }
      const frameSize = item.frameSizeId
        ? frameSizesById.get(item.frameSizeId)
        : undefined;

      if (item.frameSizeId && !frameSize) {
        throw new BadRequestException(
          `Frame size ${item.frameSizeId} is not available`,
        );
      }

      const resolvedAccessories = this.resolveAccessorySnapshot(
        item,
        accessoriesById,
      );
      const accessoriesTotal = resolvedAccessories.reduce(
        (sum, accessory) => sum + accessory.price,
        0,
      );
      const characterCount = this.getCharacterCount(item.designData);
      const serverComputedPrice =
        (frameSize?.price ?? 0) +
        accessoriesTotal +
        characterCount * CHARACTER_PRICE;

      return {
        productId: undefined,
        productName: item.productName || 'Khung LEGO tuy chinh',
        quantity: item.quantity,
        price: serverComputedPrice > 0 ? serverComputedPrice : item.price,
        frameSizeId: item.frameSizeId,
        frameSizeLabel: frameSize?.label ?? item.frameSizeLabel,
        frameColorName: item.frameColorName,
        accessories: resolvedAccessories,
        designData: item.designData,
        previewUrl: item.previewUrl,
      };

    });
  }

  private createPricingSummary(
    dto: CreateOrderDto,
    items: ResolvedOrderItem[],
  ): OrderPricingSummary {
    const itemsAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const shippingMethod = dto.shippingMethod ?? 'standard';
    const shippingFee = this.getShippingFee(shippingMethod, itemsAmount);
    const giftPackage = dto.giftPackage === true;
    const giftFee = giftPackage ? itemCount * GIFT_PACKAGE_FEE_PER_ITEM : 0;
    const polaroidOption = dto.polaroidOption ?? 'none';
    const polaroidFee = POLAROID_PRICES[polaroidOption] ?? 0;

    return {
      itemsAmount,
      itemCount,
      shippingMethod,
      shippingFee,
      giftPackage,
      giftFee,
      polaroidOption,
      polaroidFee,
      totalAmount: itemsAmount + shippingFee + giftFee + polaroidFee,
    };
  }

  private getShippingFee(shippingMethod: string, itemsAmount: number) {
    if (shippingMethod === 'fast') {
      return FAST_SHIPPING_FEE;
    }

    if (shippingMethod === 'self') {
      return 0;
    }

    return itemsAmount >= FREESHIP_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  }

  private extractAccessoryIds(item: CreateOrderItemDto): string[] {
    const accessoryIds = new Set<string>();

    item.accessories?.forEach((accessory) => {
      if (this.isRecord(accessory) && typeof accessory.id === 'string') {
        accessoryIds.add(accessory.id);
      }
    });

    const elements = item.designData?.elements;

    if (Array.isArray(elements)) {
      elements.forEach((element) => {
        if (
          this.isRecord(element) &&
          typeof element.accessoryId === 'string'
        ) {
          accessoryIds.add(element.accessoryId);
        }
      });
    }

    return Array.from(accessoryIds);
  }

  private resolveAccessorySnapshot(
    item: CreateOrderItemDto,
    accessoriesById: Map<string, { id: string; name: string; price: number }>,
  ) {
    return this.extractAccessoryIds(item).map((accessoryId) => {
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
      };
    });
  }

  private getCharacterCount(designData?: Record<string, unknown>) {
    if (!designData) {
      return 0;
    }

    if (typeof designData.characterCount === 'number') {
      return Math.max(0, Math.floor(designData.characterCount));
    }

    if (typeof designData.characterCount === 'string') {
      const parsedCount = Number(designData.characterCount);

      if (Number.isFinite(parsedCount)) {
        return Math.max(0, Math.floor(parsedCount));
      }
    }

    if (Array.isArray(designData.elements)) {
      return designData.elements.filter(
        (element) => this.isRecord(element) && element.type === 'character',
      ).length;
    }

    return 0;
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
      buyerName: input.dto.customerName,
      buyerEmail: input.dto.email,
      buyerPhone: input.dto.phone,
      buyerAddress: input.dto.address,
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
