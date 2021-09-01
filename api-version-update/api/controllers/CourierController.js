/**
 * CourierController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const {performance} = require('perf_hooks');

module.exports = {

  //Method called for creating courier data
  //Model models/Courier.js
  create: async (req, res) => {

    try {
      const time1 = performance.now();

      if (req.body) {
        req.body.status = 1;
      }
      let courierData = await Courier.create(req.body).fetch();
      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({courierData: courierData});

    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.status(error.status).json({success: false, error: error});
    }
  },
  //Method called for updating courier data
  //Model models/Courier.js
  update: async (req, res) => {
    try {
      const time1 = performance.now();

      const courier = await Courier.updateOne(req.param('id'));
      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(courier);
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.json(400, {message: 'wrong', error});
    }
  },

  //Method called for deleting courier data
  //Model models/Courier.js
  destroy: async (req, res) => {
    try {
      const time1 = performance.now();

      const courier = await Courier.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(courier);
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.json(400, {message: 'wrong', error});
    }
  }
};

