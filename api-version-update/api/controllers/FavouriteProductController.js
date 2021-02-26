/**
 * FavouriteProductController
 *
 * @description :: Server-side logic for managing Favouriteproducts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


module.exports = {

  // destroy a row
  destroy: function (req, res) {
    FavouriteProduct.update({id: req.param('id')}, {deletedAt: new Date()})
      .exec((err, favouriteProduct) => {
        if (err) {
          return res.json(err, 400);
        }
        return res.json(favouriteProduct[0]);
      });
  },
  //Method called for getting all favourite product data by user
  //Model models/FavouriteProduct.js
  byUser: async (req, res) => {

    if (!req.param('user_id')) {
      return res.json({status: 400, error: 'no user id provided'});
    }

    let data = await FavouriteProduct.find({user_id: req.param('user_id'), deletedAt: null})
      .populate('product_id', {deletedAt: null});

    res.json({
      success: true,
      message: 'Wishlist found',
      data
    });
  },
  //Method called for deleting all favourite product data by user
  //Model models/FavouriteProduct.js
  deleteAll: async (req, res) => {
    if (!req.param('user_id')) {
      return res.json({status: 400, error: 'no user id provided'});
    }

    let data = await FavouriteProduct.update({user_id: req.param('user_id')}, {deletedAt: new Date()});

    res.json({
      success: true,
      message: 'Wishlist delete',
      data
    });
  },

};



