/**
 * ShippingController
 *
 * @description :: Server-side logic for managing shippings
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  // destroy a row
  destroy: function (req, res) {
    ShippingAddress.update({id: req.param('id')}, {deletedAt: new Date()})
            .exec((err, shipping) => {
              if (err) {return res.json(err, 400);}
              return res.json(shipping[0]);
            });
  },
};

