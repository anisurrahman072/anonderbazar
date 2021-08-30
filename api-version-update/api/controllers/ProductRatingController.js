/**
 * ProductRatingController
 *
 * @description :: Server-side logic for managing Productratings
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {performance} = require('perf_hooks');

module.exports = {

  // destroy a row
  destroy: async (req, res) => {
    try {
      const time1 = performance.now();

      const productRating = await ProductRating.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(productRating);
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json(error);
    }

  },

};

