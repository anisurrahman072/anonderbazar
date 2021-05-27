/**
 * OrderPartialPaymentController
 * To process partial payments
 */
const {getPaymentServicePartial} = require('../../libs/paymentMethods');
const {REGULAR_ORDER_TYPE} = require('../../libs/constants');
const {getAuthUser, getGlobalConfig} = require('../../libs/helper');
module.exports = {

  /**
   * @param req ( body: payment_method, amount_to_pay)
   * @param res
   * @returns {Promise<*>}
   */
  makePayment: async function (req, res) {

    try {
      const authUser = getAuthUser(req);
      const globalConfigs = await getGlobalConfig();

      const order = await Order.findOne({id: req.param('order_id'), deletedAt: null})
        .populate('shipping_address')
        .populate('billing_address');

      if (!order) {
        throw new Error('Order doesn\'t exist.');
      }
      let paymentGatewayService = getPaymentServicePartial(req.body.payment_method);

      const response = paymentGatewayService.makePartialPayment(authUser, order, req, globalConfigs);

      return res.status(200).json(response);
    } catch (finalError) {
      console.log(finalError);
      return res.status(400).json({
        message: 'There was a problem in processing the payment.',
        additionalMessage: finalError.message
      });
    }
  }
};
