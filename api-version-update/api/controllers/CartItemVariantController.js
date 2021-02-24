/**
 * CartItemVariantController
 *
 * @description :: Server-side logic for managing cartitemvariants
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    //Method called for deleting cart item variant data
    //Model models/CartItemVariant.js
    destroy: function (req, res) {
        CartItemVariant.update({id: req.param('id')}, {deletedAt: new Date()})
            .exec(function (err, cartItemVariant) {
                if (err) return res.json(err, 400);
                return res.json(cartItemVariant[0]);
            });
    },
};

