/**
 * PaymentAddressController
 *
 * @description :: Server-side logic for managing payments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  // destroy a row
  destroy: async (req, res) => {
    console.log('Payment Address destroy');

    try {
      const paymentAddress = await PaymentAddress.update({id: req.param('id')})
        .set({deletedAt: new Date()});
      return res.status(202).json(paymentAddress);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },
};

