import { Injectable, Logger, Inject, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { INVENTORY_CLIENT, INVENTORY_PATTERNS } from '../../messaging/constants';
import { firstValueFrom } from 'rxjs';
import { RedisService } from '../../services/redis.service';

@Injectable()
export class OrderService {
  public readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    @Inject(INVENTORY_CLIENT) private readonly inventoryClient: ClientProxy,
  ) { }

  async create(createOrderDto: CreateOrderDto) {
    this.logger.log(`Creating order for user ${createOrderDto.userId}`);

    // 0. Pre-check Availability
    for (const item of createOrderDto.items) {
      const cacheKey = `inventory:${item.productId}`;
      // Check Redis first
      const cachedValue = await this.redisService.getClient().get(cacheKey);
      let availableQuantity;

      if (cachedValue) {
        try {
          const parsed = JSON.parse(cachedValue);
          availableQuantity = parsed.quantity;
        } catch (e) {
          availableQuantity = Number(cachedValue);
        }
      } else {
        // Not in cache, ask Inventory Service
        this.logger.debug(`Cache miss for ${item.productId}, asking Inventory Service...`);
        try {
          const response = await firstValueFrom(
            this.inventoryClient.send(INVENTORY_PATTERNS.FIND_BY_SKU, { sku: `PROD-${item.productId}` })
          );

          if (response && response.success && response.data) {
            availableQuantity = response.data.quantity;
            this.logger.debug(`Caching inventory for ${item.productId}: ${JSON.stringify(availableQuantity)}`);
            await this.redisService.getClient().set(cacheKey, JSON.stringify(availableQuantity));
          } else {
            throw new BadRequestException(`Product ${item.productId} not found`);
          }

        } catch (error) {
          this.logger.error(`Failed to check stock for ${item.productId}: ${error.message}`);
          throw new BadRequestException(`Unable to verify stock for ${item.productId}`);
        }
      }

      if (Number(availableQuantity || 0) < item.quantity) {
        throw new BadRequestException(`Insufficient stock for product ${item.productId}. Requested: ${item.quantity}, Available: ${availableQuantity}`);
      }
    }


    // 1. Create Order in DB (Pending)
    let order;
    try {
      order = await this.prisma.order.create({
        data: {
          userId: createOrderDto.userId,
          totalPrice: createOrderDto.totalPrice || 0,
          status: 'PENDING',
          items: {
            create: createOrderDto.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: item.priceAtPurchase
            }))
          }
        },
        include: {
          items: true
        }
      });

      // add order in the redis cache
      await this.redisService.getClient().set(`order:${order.id}`, JSON.stringify(order));
      return {
        success: true,
        message: 'Order created successfully (Pending Reservation)',
        data: order
      };
    } catch (error) {
      this.logger.error(`Failed to create order in DB: ${error.message}`);
      throw new InternalServerErrorException('Failed to create order');
    }
  }

  async reserveInventory(order: any) {
    const reservedItems: any[] = [];
    try {
      for (const item of order.items) {

        const payload = {
          sku: item.productId,
          quantity: item.quantity,
          orderId: order.id
        };

        const response = await firstValueFrom(
          this.inventoryClient.send(INVENTORY_PATTERNS.RESERVE, payload)
        );

        if (!response || response.success === false) {
          throw new Error(response?.message || 'Reservation failed');
        }
        reservedItems.push(item);
      }

      return {
        success: true,
        message: 'Inventory reserved',
        data: reservedItems
      };

    } catch (error) {
      this.logger.error(`Failed to reserve inventory for order ${order.id}: ${error.message}`);

      // Compensation: Delete Order if reservation fails
      this.logger.warn(`Compensating: Deleting order ${order.id}`);
      await this.prisma.order.delete({
        where: { id: order.id }
      });

      throw new BadRequestException(`Failed to reserve inventory: ${error.message}`);
    }
  }

  async findAll(userId: string, role: string) {

    if (role?.toLowerCase() === 'admin') {
      return this.prisma.order.findMany({
        include: { items: true }
      });
    }
    this.logger.log(`Returning orders for user ${userId}`);
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true }
    });
  }

  findOne(orderId: string) {
    try {
      return this.prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
    } catch (error) {
      this.logger.error(`Failed to retrieve order ${orderId}: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve order');
    }
  }

  async remove(orderId: string) {
    this.logger.log(`Removing order ${orderId} and its associated items`);
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Delete associated items first (required to avoid FK constraint violations)
        await tx.orderItem.deleteMany({
          where: { orderId: orderId },
        });

        // 2. Delete the order
        const deletedOrder = await tx.order.delete({
          where: { id: orderId },
          include: { items: true },
        });

        return deletedOrder;
      });
    } catch (error) {
      this.logger.error(`Failed to delete order ${orderId}: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete order');
    }
  }
}
