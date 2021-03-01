/**
 * FavouriteProductController
 *
 * @description :: Server-side logic for managing Favouriteproducts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


module.exports = {

  // destroy a row
  destroy: async (req, res) => {
    try {
      const favouriteProduct = await FavouriteProduct.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      return res.json(favouriteProduct);
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'Failed to create product',
        error
      });
    }
  },
  byAuthUser: async (req, res) => {
    if (!req.token) {
      return res.status(401).json({err: 'No Authorization header was found'});
    }
    if (req.token.userInfo.group_id.name !== 'customer') {
      return res.status(401).json({err: 'No Authorization header was found'});
    }

    const authUser = req.token.userInfo;

    try {
      let data = await FavouriteProduct.find({user_id: authUser.id, deletedAt: null})
        .populate('product_id');

      res.json({
        success: true,
        message: 'Wishlist found',
        data
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error
      });
    }
  },
  //Method called for getting all favourite product data by user
  //Model models/FavouriteProduct.js
  byUser: async (req, res) => {

    if (!req.param('user_id')) {
      return res.json({status: 400, error: 'no user id provided'});
    }

    let data = await FavouriteProduct.find({user_id: req.param('user_id'), deletedAt: null})
      .populate('product_id');

    return res.status(200).json({
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

    try {
      let data = await FavouriteProduct.update({user_id: req.param('user_id')}, {deletedAt: new Date()}).fetch();

      return res.json({
        success: true,
        message: 'Wishlist delete',
        data
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'Failed to create product',
        error
      });
    }

  },

};



