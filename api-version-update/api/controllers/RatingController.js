/**
 * RatingController
 *
 * @description :: Server-side logic for managing ratings
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {performance} = require('perf_hooks');

module.exports = {
  // destroy a row
  destroy: async (req, res) => {
    try {
      const time1 = performance.now();

      const rating = await Rating.update({id: req.param('id')}, {deletedAt: new Date()}).fetch();
      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(rating[0]);
    }
    catch (error){
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.json(err, 400);
    }
  }
};

