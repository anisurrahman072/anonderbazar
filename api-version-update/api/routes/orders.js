exports.orderRoutes = {
  'GET /api/v1/order/update': 'OrderController.update',
  'GET /api/v1/order/getOrderInvoiceData': 'OrderController.getOrderInvoiceData',
  'GET /api/v1/order/getAllProductsByOrderId': 'OrderController.getAllProductsByOrderId',
  'PUT /api/v1/order/updatePaymentStatus': 'OrderController.updatePaymentStatus',
  'GET /api/v1/orders/getAllOrder': 'OrderController.getAllOrder',
  'GET /api/v1/orders/allOrders': 'OrderController.allOrders',
  'GET /api/v1/order/getCancelledOrder': 'OrderController.getCancelledOrder',
  'PUT /api/v1/order/refundCancelOrder/:id': 'OrderController.refundCancelOrder',
  'DELETE /api/v1/order/deleteOrder/:id': 'OrderController.deleteOrder',
};
