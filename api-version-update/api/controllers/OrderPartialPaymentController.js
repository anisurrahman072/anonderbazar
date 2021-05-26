/**
 * OrderPartialPaymentController
 * To process partial payments
 */
const {getAuthUser, getGlobalConfig} = require('../../libs/helper');
module.exports = {

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

    } catch (finalError) {
      console.log(finalError);
      return res.status(400).json({
        message: 'There was a problem in processing the payment.',
        additionalMessage: finalError.message
      });
    }
  }
};
