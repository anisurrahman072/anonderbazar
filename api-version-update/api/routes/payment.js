exports.PaymentsRoute = {
  'GET /api/v1/payments': 'PaymentsController.getAll',
  'GET /api/v1/payment/changeApprovalStatus': 'PaymentsController.changeApprovalStatus',
  'POST /api/v1/payments/makeAdminPayment': 'PaymentsController.makeAdminPayment',
  'POST /api/v1/partial-order/make-payment/:order_id' : 'OrderPartialPaymentController.makePayment',
  'POST /api/v1/partial-order/placeOrderWithoutPayment' : 'OrderPartialPaymentController.placeOrderWithoutPayment',
  'POST /api/v1/partial-order/refund-payments/:order_id' : 'OrderPartialPaymentController.refundPayments'
  /*'POST /api/v1/special-sms' : 'SpecialsmsController.generateCouponCodes',*/
/*  'POST /api/v1/sms-test-gateway' : 'SpecialsmsController.testSMS',*/
  // 'POST /api/v1/delayed-orders-sms' : 'SpecialsmsController.sendDelayedSMSTOOrders',
};
