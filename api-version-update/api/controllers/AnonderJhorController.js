/**
 * AnonderJhorController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  getAnonderJhor: async (req, res) => {
    try {
      let anonderJhorData = await AnonderJhor.findOne({id: 1});
      console.log('anonderJhorData: aaa', anonderJhorData);
      return res.status(200).json({
        success: true,
        message: 'AnonderJhor Data fetched successfully',
        data: anonderJhorData
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to get AnonderJhor Data',
        error
      });
    }
  },

  jhorActiveStatusChange: async (req, res) => {
    try {
      let anonderJhorData = await AnonderJhor.findOne({id: 1});
      const endDate = anonderJhorData.end_date.getTime();
      const presentTime = (new Date(Date.now())).getTime();

      let jhorStatus;

      if (endDate > presentTime) {
        jhorStatus = await AnonderJhor.updateOne({id: 1}).set({status: req.body});
      }else {
        await AnonderJhor.updateOne({id: 1}).set({status: 0});
        return res.status(200).json({
          code: 'INVALID_ACTION',
          message: 'status can not be changed'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'AnonderJhor status changed successfully',
        status: jhorStatus.status
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: 'Failed to change AnonderJhor status',
        error
      });
    }
  }

};

