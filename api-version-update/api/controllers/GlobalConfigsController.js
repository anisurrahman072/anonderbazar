/**
 * GlobalConfigsController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {performance} = require('perf_hooks');

module.exports = {
  getGlobalConfig: async (req, res) => {
    try {
      const time1 = performance.now();

      let configData = await GlobalConfigs.find({
        deletedAt: null
      });

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true,
        massage: 'Successfully fetched global Config data',
        configData
      });
    }
    catch (error){
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        success: false,
        massage: 'Error occurred while fetching global Config data',
        error
      });
    }
  },

  updateGlobalConfig: async (req, res) => {
    try {
      const time1 = performance.now();

      let newData = req.body;
      let id = req.query.id;

      let updatedConfig = await GlobalConfigs.update({
        id
      }).set(newData).fetch();

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true,
        massage: 'Successfully updated global Config data',
        updatedConfig
      });
    }
    catch (error){
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        success: false,
        massage: 'Error occurred while updating global Config data',
        error
      });
    }
  }
};
