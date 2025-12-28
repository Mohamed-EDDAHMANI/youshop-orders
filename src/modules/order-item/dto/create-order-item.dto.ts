export class CreateOrderItemDto {
	orderId: string;
	productId: string;
	quantity: number;
	priceAtPurchase: number;
}
