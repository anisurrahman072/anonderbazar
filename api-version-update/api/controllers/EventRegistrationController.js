/**
 * EventRegistrationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const {performance} = require('perf_hooks');

module.exports = {
  //Method called for getting a event registration data
  //Model models/EventRegistration.js
  create: async (req, res) => {
    try {
      const time1 = performance.now();

      let data = await EventRegistration.create(req.body).fetch();
      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({data: data});

    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({success: false, error});
    }
  },
};

