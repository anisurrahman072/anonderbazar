/**
 * ProductDesignController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
import {asyncForEach} from "../../libs";

module.exports = {

  //Method called for creating a product design
  //Model models/ProductDesign.js
  create: async (req, res) => {
    try {

      let productDesign = await ProductDesign.create(req.body);
      if (productDesign) {

        let newProductDesign = await ProductDesign.findOne({id: productDesign.id,}).populateAll();

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
      let productDesign = await ProductDesign.update({id: req.param('id')}, req.body);
      if (productDesign) {

        let newProductDesign = []
        await asyncForEach(productDesign, async (_productDesign) => {
          let tmp = await ProductDesign.findOne({id: _productDesign.id,}).populateAll()
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
    ProductDesign.update({id: req.param('id')}, {deletedAt: new Date()})
      .exec(function (err, productDesign) {
        if (err) return res.json(err, 400);
        return res.json(productDesign[0]);
      });
  }

  ,
}
;

