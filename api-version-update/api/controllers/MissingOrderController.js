/**
 * MissingOrderController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  findSSLTransaction: async (req, res) => {
    try {
      console.log('req asce');

      let params = req.allParams();
      console.log('Anis1', params);

      return res.status(200).json({
        success: true,
        message: 'Successfully fetched SSS Transaction ID info'
      });
    }
    catch (error){
      return res.status(400).json({
        success: false,
        message: 'Error occurred while fetching SSS Transaction ID info',
        error
      });
    }
  }

};

