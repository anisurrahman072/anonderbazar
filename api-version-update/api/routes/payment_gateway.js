exports.paymentGatewayRoutes = {
  'GET /api/v1/bkash-payment/token-grant': 'BkashPaymentController.grandToken',
  'GET /api/v1/bkash-payment/create-agreement': 'BkashPaymentController.createAgreement',
  'GET /api/v1/bkash-payment/agreement-callback/:id': 'BkashPaymentController.agreementCallback',
};
