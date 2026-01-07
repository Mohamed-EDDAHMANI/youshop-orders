// RabbitMQ Client Tokens
export const INVENTORY_CLIENT = 'INVENTORY_CLIENT';

// Orders Service Message Patterns
export const ORDERS_PATTERNS = {
  ORDER_CREATE: 'orders/create-order',
  ORDER_FIND_ALL: 'orders/find-all',
  ORDER_FIND_ONE: 'orders/find-one',
  ORDER_REMOVE: 'orders/remove',
  ORDER_ITEM_CREATE: 'orders/order-item/create',
  ORDER_ITEM_FIND_ALL: 'orders/order-item/find-all',
  ORDER_ITEM_FIND_ONE: 'orders/order-item/find-one',
  ORDER_ITEM_UPDATE: 'orders/order-item/update',
  ORDER_ITEM_REMOVE: 'orders/order-item/remove',
} as const;

// Inventory message patterns (used when talking to inventory service)
export const INVENTORY_PATTERNS = {
  CREATE: 'inventory/create',
  UPDATE: 'inventory/update',
  FIND_ONE: 'inventory/find-one',
  FIND_ALL: 'inventory/find-all',
  REMOVE: 'inventory/remove',
  CHECK_AVAILABILITY: 'inventory/check-availability',
  RESERVE: 'inventory/reserve',
  FIND_BY_SKU: 'inventory/find-by-sku',
} as const;

export const INVENTORY_EVENTS = {
  CREATED: 'inventory.created',
  UPDATED: 'inventory.updated',
  RESERVED: 'inventory.reserved',
  RELEASED: 'inventory.released',
} as const;
