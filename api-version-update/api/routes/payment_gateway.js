exports.paymentGatewayRoutes = {
  'GET /api/v1/bkash-payment/customer-wallets': 'BkashPaymentController.authUserWallets',
  'GET /api/v1/bkash-payment/token-grant': 'BkashPaymentController.grandToken',
  'GET /api/v1/bkash-payment/create-agreement': 'BkashPaymentController.createAgreement',
  'GET /api/v1/bkash-payment/agreement-callback/:id': 'BkashPaymentController.agreementCallback',
  'GET /api/v1/ssl-commerz/success': 'SslCommerzController.sslCommerzSuccess',
  'GET /api/v1/ssl-commerz/failure': 'SslCommerzController.sslCommerzFailure',
  'GET /api/v1/ssl-commerz/error': 'SslCommerzController.sslCommerzError',
};
