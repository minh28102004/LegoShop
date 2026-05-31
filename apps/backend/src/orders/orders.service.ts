import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import { PaymentSettingsService } from '../payment-settings/payment-settings.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentSettingsService: PaymentSettingsService,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    if (!dto.items?.length) {
      throw new BadRequestException('Order items are required');
    }

    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    const orderCode = await this.generateUniqueOrderCode();
    const paymentSettings = await this.paymentSettingsService.getSettings();

    if (dto.paymentMethod === PaymentMethod.COD && !paymentSettings.codEnabled) {
      throw new BadRequestException('COD payment is disabled');
    }

    if (
      dto.paymentMethod === PaymentMethod.PAYOS &&
      !paymentSettings.payosEnabled
    ) {
      throw new BadRequestException('PAYOS payment is disabled');
    }

    let paymentStatus: PaymentStatus = PaymentStatus.unpaid;
    let depositRequired = false;
    let depositPercent = 0;
    let depositAmount = 0;
    let remainingAmount = totalAmount;
    let depositStatus = 'not_required';
    let orderStatus: OrderStatus = OrderStatus.pending;

    if (dto.paymentMethod === PaymentMethod.COD) {
      if (paymentSettings.codDepositEnabled) {
        depositRequired = true;
        depositPercent = paymentSettings.codDepositPercent;
        depositAmount = Math.round((totalAmount * depositPercent) / 100);
        remainingAmount = totalAmount - depositAmount;
        depositStatus = 'pending';
        paymentStatus = PaymentStatus.deposit_pending;
        orderStatus = OrderStatus.pending;
      } else {
        paymentStatus = PaymentStatus.unpaid;
        depositRequired = false;
        depositPercent = 0;
        depositAmount = 0;
        remainingAmount = totalAmount;
        depositStatus = 'not_required';
        orderStatus = OrderStatus.pending;
      }
    }

    if (dto.paymentMethod === PaymentMethod.PAYOS) {
      paymentStatus = PaymentStatus.pending;
      depositRequired = false;
      depositPercent = 0;
      depositAmount = 0;
      remainingAmount = 0;
      depositStatus = 'not_required';
      orderStatus = OrderStatus.pending;
    }

    const order = await this.prisma.order.create({
      data: {
        orderCode,
        customerName: dto.customerName,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        receiveDate: dto.receiveDate ? new Date(dto.receiveDate) : undefined,
        paymentMethod: dto.paymentMethod,
        paymentStatus,
        orderStatus,
        totalAmount,
        depositRequired,
        depositPercent,
        depositAmount,
        remainingAmount,
        depositStatus,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId ?? null,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            designData:
              item.designData !== undefined
                ? (item.designData as Prisma.InputJsonValue)
                : undefined,
            previewUrl: item.previewUrl,
          })),
        },
      },
    });

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
      checkoutUrl: undefined,
    };
  }

  async trackOrder(orderCode: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderCode },
      include: {
        items: true,
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
      orderStatus: order.orderStatus,
      shippingStatus: order.shippingStatus,
      items: order.items,
      createdAt: order.createdAt,
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
}
