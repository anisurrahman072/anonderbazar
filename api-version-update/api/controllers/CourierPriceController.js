/**
 * CourierPriceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  //Method called for deleting courier price data
  //Model models/CourierPrice.js
  destroy: function(req, res) {
    CourierPrice.update({ id: req.param('id') }, { deletedAt: new Date() }).exec(
      function(err, user) {
        if (err) return res.json(err, 400);
        return res.json(user[0]);
      }
    );
  }

};

