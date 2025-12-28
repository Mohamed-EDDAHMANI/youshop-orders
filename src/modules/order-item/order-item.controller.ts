import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderItemService } from './order-item.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';

@Controller()
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) {}

  @MessagePattern('createOrderItem')
  create(@Payload() createOrderItemDto: CreateOrderItemDto) {
    return this.orderItemService.create(createOrderItemDto);
  }

  @MessagePattern('findAllOrderItem')
  findAll() {
    return this.orderItemService.findAll();
  }

  @MessagePattern('findOneOrderItem')
  findOne(@Payload() id: number) {
    return this.orderItemService.findOne(id);
  }

  @MessagePattern('updateOrderItem')
  update(@Payload() updateOrderItemDto: UpdateOrderItemDto) {
    return this.orderItemService.update(updateOrderItemDto.id, updateOrderItemDto);
  }

  @MessagePattern('removeOrderItem')
  remove(@Payload() id: number) {
    return this.orderItemService.remove(id);
  }
}
