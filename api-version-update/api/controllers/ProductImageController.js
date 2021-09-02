/**
 * ProductImageController
 *
 * @description :: Server-side logic for managing Productimages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {performance} = require('perf_hooks');

module.exports = {
  //Method called for deleting a product Image
  //Model models/ProductImage.js
  destroy: async (req, res) => {
    try {
      const time1 = performance.now();

      const productImage = await ProductImage.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(productImage);
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json(error);
    }
  },
};

