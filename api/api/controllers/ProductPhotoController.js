/**
 * ProductPhotoController
 *
 * @description :: Server-side logic for managing productphotoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    //Method called for deleting a product photo
    //Model models/ProductPhoto.js
    destroy: function (req, res) {
        ProductPhoto.update({id: req.param('id')}, {deletedAt: new Date()})
            .exec(function (err, user) {
                if (err) return res.json(err, 400);
                return res.json(user[0]);
            });
    },
    //Method called for creating a product photo
    //Model models/ProductPhoto.js
    create: function (req, res) {
        ProductPhoto.create(req.body).exec(function (err, productPhoto) {
            if (err) {
                return res.json(err.status, {err: err});
            }
            if (productPhoto) {
                res.json(200, {productPhoto: productPhoto});
            }
        });
    }
};

