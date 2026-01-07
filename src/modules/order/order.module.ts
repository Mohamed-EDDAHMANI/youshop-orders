import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { MessagingModule } from '../../messaging/messaging.module';

@Module({
  imports: [PrismaModule, MessagingModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
