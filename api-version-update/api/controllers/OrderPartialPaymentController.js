/**
 * OrderPartialPaymentController
 * To process partial payments
 */

const {
  SSL_COMMERZ_PAYMENT_TYPE,
  CASHBACK_PAYMENT_TYPE,
  NAGAD_PAYMENT_TYPE,
  BKASH_PAYMENT_TYPE,
  PARTIAL_ORDER_TYPE,
  PAYMENT_TRAN_TYPE_PAY,
  PARTIAL_MINIMUM_FIRST_PAYMENT_AMOUNT
} = require('../../libs/constants');
const {getPaymentService} = require('../../libs/paymentMethods');
const {getPaymentServicePartial} = require('../../libs/paymentMethods');
const {getAuthUser, getGlobalConfig} = require('../../libs/helper');
const logger = require('../../libs/softbd-logger').Logger;
module.exports = {

  refundPayments: async function (req, res) {

    try {
      const globalConfigs = await getGlobalConfig();
      const orderId = req.param('order_id');
      const order = await Order.findOne({id: orderId});
      // eslint-disable-next-line eqeqeq
      if (order.order_type != PARTIAL_ORDER_TYPE) {
        return res.status(422).json({
          message: 'Refund is not allowed for this order.'
        });
      }
      const payments = await Payment.find({
        order_id: orderId,
        transaction_type: PAYMENT_TRAN_TYPE_PAY,
        deletedAt: null
      });

      for (const payment of payments) {
        if ([SSL_COMMERZ_PAYMENT_TYPE, BKASH_PAYMENT_TYPE, NAGAD_PAYMENT_TYPE, CASHBACK_PAYMENT_TYPE].indexOf(payment.payment_type) !== -1) {
          let paymentGatewayService = getPaymentService(payment.payment_type);
          let transactionDetails = '';
          try {
            transactionDetails = JSON.parse(payment.details);
          } catch (e) {
          }
          if (!transactionDetails) {
            continue;
          }
          const refundResponse = paymentGatewayService.refundPayment(transactionDetails, globalConfigs);

          if (paymentGatewayService.validateRefundResponse(refundResponse)) {
            // TODO: create a payment entry in payment table with transaction type = refund
          }

        }
      }
    } catch (error) {

    }
  },
  placeOrderWithoutPayment: async function (req, res) {
    try {
      const authUser = getAuthUser(req);
      const globalConfigs = await getGlobalConfig();

      let cart = await PaymentService.getCart(authUser.id);
      let cartItems = await PaymentService.getCartItems(cart.id);

      const shippingAddress = await PaymentService.getShippingAddress(authUser, req);
      const billingAddress = await PaymentService.getBillingAddress(authUser, req, shippingAddress);

      /** Cart items can only be exists in a single offer.
       * Even a regular product can't be ordered with a offer product. START. */

      await PaymentService.checkOfferProductsFromCartItems(cartItems);

      /** Cart items can only be exists in a single offer.
       * Even a regular product can't be ordered with a offer product. END. */

      if (_.isNull(shippingAddress) || _.isEmpty(shippingAddress)) {
        throw new Error('No shipping address has been provided.');
      }

      logger.orderLog(authUser.id, '######## PLACING ORDER Without Payment ########');
      logger.orderLog(authUser.id, 'Order Body: ', req.body);
      logger.orderLog(authUser.id, 'Order - shipping_address: ', shippingAddress);
      logger.orderLog(authUser.id, 'Order - billing_address: ', billingAddress);

      let response = await WithoutPaymentService.placeOrder(
        authUser,
        req.body,
        req.allParams(),
        {
          billingAddress,
          shippingAddress
        },
        globalConfigs,
        cart,
        cartItems
      );

      return res.status(200).json(response);
    } catch (finalError) {
      logger.orderLogAuth(req, finalError);
      return res.status(400).json({
        message: 'Error occurred while placing order', finalError
      });
    }
  },

  /**
   * @param req ( body: payment_method, amount_to_pay)
   * @param res
   * @returns {Promise<*>}
   */
  makePayment: async function (req, res) {
    try {
      const authUser = getAuthUser(req);
      const globalConfigs = await getGlobalConfig();

      logger.orderLog(authUser.id, '######## make Partial Payment ########');
      logger.orderLog(authUser.id, 'Body: ', req.body);
      logger.orderLog(authUser.id, 'query: ', req.query);

      const order = await Order.findOne({id: req.param('order_id'), deletedAt: null})
        .populate('shipping_address')
        .populate('billing_address');

      if (!order) {
        throw new Error('Order doesn\'t exist.');
      }

      if (!PaymentService.isAllowedForPartialPay(order, globalConfigs)) {
        throw new Error('Order is no longer for partial payment');
      }

      /** Partial First minimum payment at least 2000 Tk. */
      if(req.body.amount_to_pay && order.paid_amount === 0 && order.total_price >= PARTIAL_MINIMUM_FIRST_PAYMENT_AMOUNT){
        if(req.body.amount_to_pay < PARTIAL_MINIMUM_FIRST_PAYMENT_AMOUNT){
          throw new Error(`You have to pay at least ${PARTIAL_MINIMUM_FIRST_PAYMENT_AMOUNT} BDT for first partial payment!`);
        }
      }
      if(req.body.amount_to_pay && order.paid_amount === 0 && order.total_price < PARTIAL_MINIMUM_FIRST_PAYMENT_AMOUNT){
        if(req.body.amount_to_pay < order.total_price){
          throw new Error(`You have to pay full amount as order total amount is less than ${PARTIAL_MINIMUM_FIRST_PAYMENT_AMOUNT} BDT!`);
        }
      }
      /** Partial First minimum payment at least 2000 Tk. END. */

      let paymentGatewayService = getPaymentServicePartial(req.body.payment_method);

      const response = await paymentGatewayService.makePartialPayment(authUser, order, req, globalConfigs);

      return res.status(200).json(response);
    } catch (finalError) {
      logger.orderLogAuth(req, finalError);
      return res.status(400).json({
        message: 'There was a problem in processing the payment.',
        additionalMessage: finalError.message
      });
    }
  },
};
