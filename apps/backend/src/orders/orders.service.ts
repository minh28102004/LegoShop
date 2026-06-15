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

type ResolvedOrderItem = {
  productId?: string;
  productName: string;
  quantity: number;
  price: number;
  designData?: Record<string, unknown>;
  previewUrl?: string;
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
    const totalAmount = resolvedItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );
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
      totalAmount,
      paymentSettings,
    );
    const paymentLink = await this.createInitialPaymentLink({
      dto,
      orderCode,
      resolvedItems,
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
            receiveDate: dto.receiveDate
              ? new Date(dto.receiveDate)
              : undefined,
            paymentMethod: dto.paymentMethod,
            paymentStatus: paymentPlan.paymentStatus,
            orderStatus: paymentPlan.orderStatus,
            totalAmount,
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
      receiveDate: order.receiveDate,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
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
    const productIds = items.map((item) => item.productId).filter((id): id is string => !!id);
    const uniqueProductIds = Array.from(new Set(productIds));
    const products = await this.prisma.product.findMany({
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
    });
    const productsById = new Map(
      products.map((product) => [product.id, product]),
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
          designData: item.designData,
          previewUrl: item.previewUrl,
        };
      } else {
        // Custom item without productId
        return {
          productId: undefined,
          productName: item.productName || 'Thiết kế khung LEGO',
          quantity: item.quantity,
          price: item.price, // Use price from frontend for custom items
          designData: item.designData,
          previewUrl: item.previewUrl,
        };
      }
    });
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

    return items.map((item) => ({
      name: item.productName.slice(0, 100),
      quantity: item.quantity,
      price: item.price,
    }));
  }

  private toOrderItemCreateInput(
    item: ResolvedOrderItem,
  ): Prisma.OrderItemCreateWithoutOrderInput {
    return {
      product: {
        connect: {
          id: item.productId,
        },
      },
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
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
