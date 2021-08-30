/**
 * CourierPriceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const {performance} = require('perf_hooks');

module.exports = {
  //Method called for deleting courier price data
  //Model models/CourierPrice.js
  destroy: async (req, res) => {
    try{
      const time1 = performance.now();

      const user = await CourierPrice.update({ id: req.param('id') }, { deletedAt: new Date() }).fetch();
      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(user[0]);
    }
    catch (error){
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.json(error, 400);
    }
  }
};

