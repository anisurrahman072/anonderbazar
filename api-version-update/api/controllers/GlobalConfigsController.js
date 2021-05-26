/**
 * GlobalConfigsController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
  getGlobalConfig: async (req, res) => {
    try {
      let configData = await GlobalConfigs.find({
        deletedAt: null
      });

      return res.status(200).json({
        success: true,
        massage: 'Successfully fetched global Config data',
        configData
      });
    }
    catch (error){
      return res.status(400).json({
        success: false,
        massage: 'Error occurred while fetching global Config data',
        error
      });
    }
  },

  updateGlobalConfig: async (req, res) => {
    try {
      let newData = req.body;
      let id = req.query.id;

      let updatedConfig = await GlobalConfigs.update({
        id
      }).set(newData).fetch();

      return res.status(200).json({
        success: true,
        massage: 'Successfully updated global Config data',
        updatedConfig
      });
    }
    catch (error){
      return res.status(400).json({
        success: false,
        massage: 'Error occurred while updating global Config data',
        error
      });
    }
  }
};
