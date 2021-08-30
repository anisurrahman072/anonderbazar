/**
 * CartItemVariantController
 *
 * @description :: Server-side logic for managing cartitemvariants
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {performance} = require('perf_hooks');

module.exports = {
  //Method called for deleting cart item variant data
  //Model models/CartItemVariant.js
  destroy: async (req, res) => {
    try {
      const time1 = performance.now();

      const cartItemVariant = await CartItemVariant.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(cartItemVariant);
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.json(400, {
        success: false,
        error
      });
    }
  },
};

