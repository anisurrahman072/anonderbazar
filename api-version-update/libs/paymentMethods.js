const {PARTIAL_ORDER_TYPE} = require('./orders');
module.exports = {
  getPaymentService: function (paymentType, orderType) {
    if (parseInt(orderType, 10) === PARTIAL_ORDER_TYPE) {
      return WithoutPaymentService;
    }

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
