exports.paymentGatewayRoutes = {
  'GET /api/v1/bkash-payment/customer-wallets': 'BkashPaymentController.authUserWallets',
  'GET /api/v1/bkash-payment/token-grant': 'BkashPaymentController.grandToken',
  'GET /api/v1/bkash-payment/create-agreement': 'BkashPaymentController.createAgreement',
  'GET /api/v1/bkash-payment/agreement-callback/:id': 'BkashPaymentController.agreementCallback',
  'GET /api/v1/bkash-payment/payment-callback/:userId/::paymentTransId': 'BkashPaymentController.paymentCallback',
  'POST /api/v1/ssl-commerz/success': 'SslCommerzController.sslCommerzSuccess',
  'POST /api/v1/ssl-commerz/failure': 'SslCommerzController.sslCommerzFailure',
  'POST /api/v1/ssl-commerz/error': 'SslCommerzController.sslCommerzError',
};
