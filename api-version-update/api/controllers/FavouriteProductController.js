/**
 * FavouriteProductController
 *
 * @description :: Server-side logic for managing Favouriteproducts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {performance} = require('perf_hooks');


module.exports = {

  create: async (req, res) => {
    const time1 = performance.now();

    if (!req.token) {
      return res.status(401).json({err: 'No Authorization header was found'});
    }
    if (req.token.userInfo.group_id.name !== 'customer') {
      return res.status(401).json({err: 'No Authorization header was found'});
    }

    const authUser = req.token.userInfo;

    try {
      let found = await FavouriteProduct.find({
        user_id: authUser.id,
        product_id: req.body.product_id,
        deletedAt: null
      });

      if (found && found.length === 0) {
        found = await FavouriteProduct.create({
          user_id: authUser.id,
          product_id: req.body.product_id
        }).fetch();
        const time2 = performance.now();
        sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

        return res.status(201).json(found);
      }

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      res.status(201).json(found[0]);

    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.status(400).json({
        success: false,
        error
      });
    }
  },
  // destroy a row
  destroy: async (req, res) => {
    try {
      const time1 = performance.now();

      const favouriteProduct = await FavouriteProduct.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(favouriteProduct);
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.status(400).json({
        success: false,
        message: 'Failed to create product',
        error
      });
    }
  },
  byAuthUser: async (req, res) => {
    const time1 = performance.now();

    if (!req.token) {
      return res.status(401).json({err: 'No Authorization header was found'});
    }
    if (req.token.userInfo.group_id.name !== 'customer') {
      return res.status(401).json({err: 'No Authorization header was found'});
    }

    const authUser = req.token.userInfo;

    console.log(req.query);

    try {
      let data = [];
      if (req.query.populate === 'true') {
        data = await FavouriteProduct.find({user_id: authUser.id, deletedAt: null})
          .populate('product_id');
      } else {
        data = await FavouriteProduct.find({user_id: authUser.id, deletedAt: null});
      }

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json(data);
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.status(400).json({
        success: false,
        error
      });
    }
  },
  //Method called for getting all favourite product data by user
  //Model models/FavouriteProduct.js
  byUser: async (req, res) => {
    try {
      const time1 = performance.now();

      if (!req.param('user_id')) {
        return res.json({status: 400, error: 'no user id provided'});
      }

      let data = await FavouriteProduct.find({user_id: req.param('user_id'), deletedAt: null})
        .populate('product_id');

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true,
        message: 'Wishlist found',
        data
      });
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.status(error.status).json({'error': error});
    }
  },
  //Method called for deleting all favourite product data by user
  //Model models/FavouriteProduct.js
  deleteAll: async (req, res) => {
    if (!req.param('user_id')) {
      return res.json({status: 400, error: 'no user id provided'});
    }

    try {
      const time1 = performance.now();

      let data = await FavouriteProduct.update({user_id: req.param('user_id')}, {deletedAt: new Date()}).fetch();

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json({
        success: true,
        message: 'Wishlist delete',
        data
      });
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.status(400).json({
        success: false,
        message: 'Failed to create product',
        error
      });
    }

  },

};



