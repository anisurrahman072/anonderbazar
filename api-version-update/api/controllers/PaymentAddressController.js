/**
 * PaymentAddressController
 * @description :: Server-side logic for managing payments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const {isResourceOwner} = require('../../libs/check-permissions');
module.exports = {

  authUserAddresses: async (req, res) => {

    console.log('authUserAddresses');
    const authUser = req.token.userInfo;
    console.log('authUser', authUser);

    try {
      const foundPaymentAddress = await PaymentAddress.find({
        user_id: authUser.id,
        deletedAt: null
      });

      return res.status(200).json(foundPaymentAddress);

    } catch (error) {
      console.log(error);
      return res.status(400).json({
        success: false,
        message: 'Problems!',
        error
      });
    }
  },
  update: async (req, res) => {

    try {
      const foundPaymentAddress = await PaymentAddress.findOne({
        id: req.param('id')
      });

      if (!isResourceOwner(req.token.userInfo, foundPaymentAddress)) {
        return res.forbidden();
      }

      const paymentAddress = await PaymentAddress.updateOne({
        id: req.param('id')
      }).set(req.body);

      return res.status(201).json(paymentAddress);

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

      if (!isResourceOwner(req.token.userInfo, foundPaymentAddress)) {
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

