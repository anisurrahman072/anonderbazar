/**
 * PaymentAddressController
 *
 * @description :: Server-side logic for managing payments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  // destroy a row
  destroy: function (req, res) {
    PaymentAddress.update({id: req.param('id')}, {deletedAt: new Date()})
            .exec((err, paymentAddress) => {
              if (err) {return res.json(err, 400);}
              return res.json(paymentAddress[0]);
            });
  },
};

