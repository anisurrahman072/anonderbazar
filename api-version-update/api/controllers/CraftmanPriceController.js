/**
 * CraftmanPriceController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const {asyncForEach} = require('../../libs/helper');
const {performance} = require('perf_hooks');

module.exports = {

  //Method called for creating craftsman price data
  //Model models/CraftmanPrice.js
  create: async (req, res) => {
    try {
      const time1 = performance.now();


      let craftmanPrice = await CraftmanPrice.create(req.body).fetch();

      if (!craftmanPrice) {
        return res.status(400).json({
          success: false,
          message: 'Problem in creating craftman price',
        });
      }

      let newCraftmanPrice = await CraftmanPrice.findOne({
        id: craftmanPrice.id
      })
        .populate('craftman_id')
        .populate('type_id')
        .populate('category_id')
        .populate('subcategory_id')
        .populate('part_id')
        .populate('design_category_id')
        .populate('design_subcategory_id')
        .populate('design_id')
        .populate('genre_id')
        .populate('warehouse_id');

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        status: true,
        message: 'create craftman price',
        data: newCraftmanPrice
      });

    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        success: false,
        error
      });
    }
  },

  //Method called for updating craftsman price data
  //Model models/CraftmanPrice.js
  update: async (req, res) => {
    try {
      const time1 = performance.now();

      let craftmanPrice = await CraftmanPrice.updateOne({id: req.param('id')})
        .set(req.body)
        .fetch();

      if (!craftmanPrice) {
        return res.status(400).json({
          success: false,
          message: 'Problem in creating craftman price',
        });
      }

      let newCraftmanPrice = [];
      await asyncForEach(craftmanPrice, async (_craftmanPrice) => {
        let tmp = await CraftmanPrice.findOne({id: _craftmanPrice.id})
          .populate('craftman_id')
          .populate('type_id')
          .populate('category_id')
          .populate('subcategory_id')
          .populate('part_id')
          .populate('design_category_id')
          .populate('design_subcategory_id')
          .populate('design_id')
          .populate('genre_id')
          .populate('warehouse_id');

        newCraftmanPrice.push(tmp);

      });

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        status: true,
        message: 'update Craftman Price',
        data: newCraftmanPrice
      });

    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        success: false,
        message: 'error in CraftmanPrice/update',
        error
      });
    }
  },
  //Method called for getting craftsman price design data
  //Model models/CraftmanPrice.js
  getCraftsmanPriceDesign: async (req, res) => {

    try {
      const time1 = performance.now();


      let _where = {};
      _where.deletedAt = null;

      if (req.query.design_id) {
        _where.design_id = req.query.design_id;
      }
      if (req.query.craftman_id) {
        _where.craftman_id = req.query.craftman_id;
      }
      if (req.query.part_id) {
        _where.part_id = req.query.part_id;
      }

      let craftmanPrices = await CraftmanPrice.find({
        where: _where,
      })
        .populate('craftman_id')
        .populate('type_id')
        .populate('category_id')
        .populate('subcategory_id')
        .populate('part_id')
        .populate('design_category_id')
        .populate('design_subcategory_id')
        .populate('design_id')
        .populate('genre_id')
        .populate('warehouse_id');

      let allPrice = await Promise.all(
        craftmanPrices.map(async item => {
          item.material_price = await ProductDesign.find({
            deletedAt: null,
            product_id: req.query.product_id,
            design_id: req.query.design_id,
            part_id: req.query.part_id,
          });
          return item;
        })
      );
      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      res.status(200).json({
        success: true,
        message: 'Get All CraftmanPrice  with pagination',
        pricedata: allPrice
      });
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      let message = 'Error in Get All CraftmanPrice with pagination';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }

  },

  // destroy a row
  destroy: async (req, res) => {
    try {
      const time1 = performance.now();

      const craftmanPrice = await CraftmanPrice.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(200, craftmanPrice);
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      console.log(error);
      res.json(400, {success: false, message: 'Something went wrong!', error});
    }
  },
};

