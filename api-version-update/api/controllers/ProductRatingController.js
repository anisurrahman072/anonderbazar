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
      return res.json(productRating);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }

  },

};

