/**
 * GlobalConfigsController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
  getShippingCharge: async (req, res) => {
    try {
      let configData = await GlobalConfigs.find({
        deletedAt: null
      });

      return res.status(200).json({
        success: true,
        massage: 'Successfully fetched Shipping charge data',
        configData
      });
    }
    catch (error){
      return res.status(400).json({
        success: false,
        massage: 'Error occurred while fetching Shipping charge data',
        error
      });
    }
  },

  updateShippingCharge: async (req, res) => {
    try {
      let newData = req.body;

      let updatedConfig = await GlobalConfigs.update({
        id: newData.id
      }).set({
        dhaka_charge: newData.dhaka_charge,
        outside_dhaka_charge: newData.outside_dhaka_charge
      }).fetch();

      return res.status(200).json({
        success: true,
        massage: 'Successfully updated Shipping charge data',
        updatedConfig
      });
    }
    catch (error){
      return res.status(400).json({
        success: false,
        massage: 'Error occurred while updating Shipping charge data',
        error
      });
    }
  }
};
