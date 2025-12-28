export class CreateOrderDto {
	userId: string;
	totalPrice: number;
	items: {
		productId: string;
		quantity: number;
		priceAtPurchase: number;
	}[];
}
