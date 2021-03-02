/**
 * PaymentAddressController
 * @description :: Server-side logic for managing payments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const {isResourceOwner} = require('../../libs/check-permissions');
module.exports = {

  update: async (req, res) => {

    try {
      const foundPaymentAddress = await PaymentAddress.findOne({
        id: req.param('id')
      });

      if(!isResourceOwner(req.token.userInfo, foundPaymentAddress)){
        return res.forbidden();
      }

      const paymentAddress = await PaymentAddress.updateOne({
        id: req.param('id')
      }).set(req.body);

      return res.json(201, paymentAddress);

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: 'Problems!',
        error
      });
    }
  },
  // destroy a row
  destroy: async (req, res) => {
    console.log('Payment Address destroy');

    try {
      const foundPaymentAddress = await PaymentAddress.findOne({
        id: req.param('id')
      });

      if(!isResourceOwner(req.token.userInfo, foundPaymentAddress)){
        return res.forbidden();
      }

      const paymentAddress = await PaymentAddress.update({id: req.param('id')})
        .set({deletedAt: new Date()}).fetch();

      return res.status(202).json(paymentAddress);

    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },
};

