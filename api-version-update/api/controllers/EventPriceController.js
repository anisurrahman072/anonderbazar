/**
 * EventPriceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const {performance} = require('perf_hooks');

module.exports = {
  //Method called for getting a event price data
  //Model models/EventPrice.js
  findOne: async (req, res) => {
    try {
      const time1 = performance.now();

      let eventPrice = await EventPrice.findOne(req.params.id);

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      res.status(200).json(
        eventPrice
      );
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      let message = 'Error in Getting the event price';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
  //Method called for deleting a event price data
  //Model models/EventPrice.js
  destroy: async (req, res) => {
    try {
      const time1 = performance.now();

      const eventPrice = await EventPrice.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(eventPrice);
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.status(error.status).json({error: error});
    }
  }
};

