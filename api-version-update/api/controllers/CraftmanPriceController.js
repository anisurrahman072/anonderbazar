/**
 * CraftmanPriceController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const { asyncForEach, initLogPlaceholder, pagination } = require('../../libs');


module.exports = {

  //Method called for creating craftsman price data
  //Model models/CraftmanPrice.js
  create: async (req, res) => {
    try {
      let craftmanPrice = await CraftmanPrice.create(req.body);
      if (craftmanPrice) {

        let newCraftmanPrice = await CraftmanPrice.findOne({id: craftmanPrice.id,}).populateAll();

        return res.status(200).json({
          status: true,
          message: 'create craftman price',
          data: newCraftmanPrice
        });

      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'error in CraftmanPrice/create ',
        error
      });


    }

  },

  //Method called for updating craftsman price data
  //Model models/CraftmanPrice.js
  update: async (req, res) => {
    try {
      let craftmanPrice = await CraftmanPrice.update({id: req.param('id')}, req.body);
      if (craftmanPrice) {

        let newCraftmanPrice = []
        await asyncForEach(craftmanPrice, async (_craftmanPrice) => {
          let tmp = await CraftmanPrice.findOne({id: _craftmanPrice.id,}).populateAll()
          newCraftmanPrice.push(tmp);

        });
        return res.status(200).json({
          status: true,
          message: 'update Craftman Price',
          data: newCraftmanPrice
        });

      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'error in CraftmanPrice/update',
        error
      });


    }

  },
  //Method called for getting craftsman price design data
  //Model models/CraftmanPrice.js
  getCraftsmanPriceDesign: async (req, res)=>{
    initLogPlaceholder(req, 'CraftmanPrice ');


    try {
      /* WHERE condition for .......START.....................*/
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
      }).populateAll();
      let allPrice = await Promise.all(
        craftmanPrices.map(async item => {
          item.material_price = await ProductDesign.find({
            deletedAt: null,
            product_id:req.query.product_id,
            design_id: req.query.design_id,
            part_id: req.query.part_id,
          });
          return item;
        })
      );
      res.status(200).json({
        success: true,
        message: 'Get All CraftmanPrice  with pagination',
        pricedata: allPrice
      });
    } catch (error) {
      let message = 'Error in Get All CraftmanPrice with pagination';
      res.status(400).json({
        success: false,
        message
      });
    }

  },

  // destroy a row
  destroy: function (req, res) {
    CraftmanPrice.update({id: req.param('id')}, {deletedAt: new Date()})
      .exec(function (err, craftmanPrice) {
        if (err) return res.json(err, 400);
        return res.json(craftmanPrice[0]);
      });
  },
};

