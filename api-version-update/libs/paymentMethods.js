const {
  BKASH_PAYMENT_TYPE,
  NAGAD_PAYMENT_TYPE,
  CASH_PAYMENT_TYPE,
  CASHBACK_PAYMENT_TYPE,
  SSL_COMMERZ_PAYMENT_TYPE
} = require('./constants');
const {PARTIAL_ORDER_TYPE} = require('./orders');
module.exports = {
  getPaymentService: function (paymentType, orderType) {
    if (parseInt(orderType, 10) === PARTIAL_ORDER_TYPE) {
      return WithoutPaymentService;
    }

    let paymentGatewayService = null;
    switch (paymentType) {
      case CASHBACK_PAYMENT_TYPE: {
        paymentGatewayService = CashbackService;
        break;
      }
      case CASH_PAYMENT_TYPE: {
        paymentGatewayService = CashOnDeliveryService;
        break;
      }
      case SSL_COMMERZ_PAYMENT_TYPE: {
        paymentGatewayService = SslCommerzService;
        break;
      }
      case NAGAD_PAYMENT_TYPE: {
        paymentGatewayService = NagadService;
        break;
      }
      case BKASH_PAYMENT_TYPE: {
        paymentGatewayService = BkashService;
        break;
      }
    }
    return paymentGatewayService;
  }
};
