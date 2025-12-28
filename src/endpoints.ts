// List of endpoints and allowed roles for orders-service
export const ORDERS_ENDPOINTS = {
  '/orders/list': ['user', 'admin'],
  '/orders/item': ['user', 'admin'],
  '/orders/admin': ['admin']
};
