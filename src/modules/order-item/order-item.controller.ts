import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderItemService } from './order-item.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { ORDERS_PATTERNS } from '../../messaging';

@Controller()
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) {}

  @MessagePattern(ORDERS_PATTERNS.ORDER_ITEM_CREATE)
  create(@Payload() createOrderItemDto: CreateOrderItemDto) {
    return this.orderItemService.create(createOrderItemDto);
  }

  @MessagePattern(ORDERS_PATTERNS.ORDER_ITEM_FIND_ALL)
  findAll() {
    return this.orderItemService.findAll();
  }

  @MessagePattern(ORDERS_PATTERNS.ORDER_ITEM_FIND_ONE)
  findOne(@Payload() id: string) {
    return this.orderItemService.findOne(id);
  }

  @MessagePattern(ORDERS_PATTERNS.ORDER_ITEM_UPDATE)
  update(@Payload() updateOrderItemDto: UpdateOrderItemDto) {
    return this.orderItemService.update(updateOrderItemDto.id, updateOrderItemDto);
  }

  @MessagePattern(ORDERS_PATTERNS.ORDER_ITEM_REMOVE)
  remove(@Payload() id: string) {
    return this.orderItemService.remove(id);
  }
}
