module.exports = {
  getPaymentService: function (paymentType) {
    let paymentGatewayService = null;
    switch (paymentType) {
      case 'CashBack': {
        paymentGatewayService = CashbackService;
        break;
      }
      case 'Cash': {
        paymentGatewayService = CashOnDeliveryService;
        break;
      }
      case 'SSLCommerce': {
        paymentGatewayService = SslCommerzService;
        break;
      }
      case 'nagad': {
        paymentGatewayService = NagadService;
        break;
      }
      case 'bkash': {
        paymentGatewayService = BkashService;
        break;
      }
    }
    return paymentGatewayService;
  }
};
