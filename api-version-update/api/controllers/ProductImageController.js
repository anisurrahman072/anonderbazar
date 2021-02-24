/**
 * ProductImageController
 *
 * @description :: Server-side logic for managing Productimages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    //Method called for deleting a product Image
    //Model models/ProductImage.js
    destroy: function (req, res) {
        ProductImage.update({id: req.param('id')}, {deletedAt: new Date()})
            .exec(function (err, productImage) {
                if (err) return res.json(err, 400);
                return res.json(productImage[0]);
            });
    },
};

