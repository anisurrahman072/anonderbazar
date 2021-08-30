/**
 * ProductDesignController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


const {asyncForEach} = require('../../libs/helper');
const {performance} = require('perf_hooks');

module.exports = {

  //Method called for creating a product design
  //Model models/ProductDesign.js
  create: async (req, res) => {
    try {
      const time1 = performance.now();


      let productDesign = await ProductDesign.create(req.body).fetch();
      if (productDesign) {

        let newProductDesign = await ProductDesign.findOne({id: productDesign.id,})
          .populate('type_id')
          .populate('category_id')
          .populate('subcategory_id')
          .populate('product_id')
          .populate('part_id')
          .populate('design_category_id')
          .populate('design_subcategory_id')
          .populate('design_id')
          .populate('genre_id')
          .populate('warehouse_id');

        return res.status(200).json({
          status: true,
          message: 'create product design',
          data: newProductDesign
        });

      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'error in productdesign/create ',
        error
      });


    }

  },

  //Method called for updating a product design
  //Model models/ProductDesign.js
  update: async (req, res) => {
    try {
      const time1 = performance.now();

      let productDesign = await ProductDesign.updateOne({id: req.param('id')}, req.body);
      if (productDesign) {

        let newProductDesign = [];
        await asyncForEach(productDesign, async (_productDesign) => {
          let tmp = await ProductDesign.findOne({id: _productDesign.id,})
            .populate('type_id')
            .populate('category_id')
            .populate('subcategory_id')
            .populate('product_id')
            .populate('part_id')
            .populate('design_category_id')
            .populate('design_subcategory_id')
            .populate('design_id')
            .populate('genre_id')
            .populate('warehouse_id');
          newProductDesign.push(tmp);

        });
        return res.status(200).json({
          status: true,
          message: 'update product design',
          data: newProductDesign
        });

      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'error in productdesign/update',
        error
      });


    }

  },

  // destroy a row
  destroy: function (req, res) {
    try {
      const time1 = performance.now();

      const productDesign = ProductDesign.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      return res.json(200, {productDesign: productDesign});
    } catch (error) {
      console.log(error);
      res.status(error.status).json({error: error});
    }
  },

};


