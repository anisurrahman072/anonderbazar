/**
 * ShippingAddressController
 *
 * @description :: Server-side logic for managing shippings
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const {isResourceOwner} = require('../../libs/check-permissions');
module.exports = {
  update: async (req, res) => {

    try {
      const foundAddress = await ShippingAddress.findOne({
        id: req.param('id')
      });

      if(!isResourceOwner(req.token.userInfo, foundAddress)){
        return res.forbidden();
      }

      const address = await ShippingAddress.updateOne({
        id: req.param('id')
      }).set(req.body);

      return res.json(201, address);

    } catch (error) {

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
      const foundAddress = await ShippingAddress.findOne({
        id: req.param('id')
      });

      if(!isResourceOwner(req.token.userInfo, foundAddress)){
        return res.forbidden();
      }

      const shippingAddress = await ShippingAddress.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      return res.json(shippingAddress);
    } catch (error){
      return res.status(400).json({
        success: false,
        message: 'Problems!',
        error
      });
    }

  },
};

