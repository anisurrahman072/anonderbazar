/**
 * ShippingAddressController
 *
 * @description :: Server-side logic for managing shippings
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {performance} = require('perf_hooks');
const {isResourceOwner} = require('../../libs/check-permissions');
module.exports = {
  update: async (req, res) => {

    try {
      const time1 = performance.now();

      const foundAddress = await ShippingAddress.findOne({
        id: req.param('id')
      });

      if(!isResourceOwner(req.token.userInfo, foundAddress)){
        return res.forbidden();
      }

      const address = await ShippingAddress.updateOne({
        id: req.param('id')
      }).set(req.body);

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(201, address);

    } catch (error) {

      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        success: false,
        message: 'Problems!',
        error
      });
    }
  },
  // destroy a row
  destroy: async (req, res) => {
    try {
      const time1 = performance.now();

      const foundAddress = await ShippingAddress.findOne({
        id: req.param('id')
      });

      if(!isResourceOwner(req.token.userInfo, foundAddress)){
        return res.forbidden();
      }

      const shippingAddress = await ShippingAddress.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(shippingAddress);
    } catch (error){
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        success: false,
        message: 'Problems!',
        error
      });
    }

  },
};

