import { IsNumber, IsString, IsArray, ArrayNotEmpty, ValidateNested, IsOptional } from "class-validator";
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from "../../order-item/dto/create-order-item.dto";

export class CreateOrderDto {
	@IsString()
	userId: string;

	@IsNumber()
	@IsOptional()
	totalPrice?: number;

	@IsArray()
	@ArrayNotEmpty()
	@ValidateNested({ each: true })
	@Type(() => CreateOrderItemDto)
	items: CreateOrderItemDto[];
}
