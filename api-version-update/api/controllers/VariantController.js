/**
 * VariantController
 *
 * @description :: Server-side logic for managing variant
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {performance} = require('perf_hooks');

module.exports = {
  //Method called for deleting a variant data
  //Model models/Variant.js
  destroy: async (req, res) => {
    try {
      const time1 = performance.now();

      const user = await Variant.update(
        {
          id: req.param('id')
        },
        {
          deletedAt: new Date()
        }
      ).fetch();
      return res.json(user[0]);
    } catch (error) {
      return res.json(error.status, {message: '', error, success: false});
    }
  },
  //Method called for cerating a variant data
  //Model models/Variant.js
  create: async (req, res) => {
    try {
      const time1 = performance.now();

      const variant = await Variant.create(req.body).fetch();

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      res.json(200, variant);
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);
      return res.json(error.status, {message: '', error, success: false});
    }
  }
};
