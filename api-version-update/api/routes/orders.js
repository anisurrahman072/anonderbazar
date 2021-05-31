exports.orderRoutes = {
  'GET /api/v1/order/update': 'OrderController.update',
  'GET /api/v1/orders/getAllOrder': 'OrderController.getAllOrder',
  'GET /api/v1/orders/allOrders': 'OrderController.allOrders',
  'DELETE /api/v1/order/deleteOrder/:id': 'OrderController.deleteOrder',
};
