import { OrderItem } from '../../order-item/entities/order-item.entity';

export class Order {
	id: string;
	userId: string;
	totalPrice: number;
	status: 'PENDING' | 'PAID' | 'CANCELLED';
	createdAt: Date;
	items: OrderItem[];
}
