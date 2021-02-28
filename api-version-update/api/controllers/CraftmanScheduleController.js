/**
 * CraftmanScheduleController
 *
 * @description :: Server-side logic for managing Craftmanschedules
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  // destroy a row
  destroy: async (req, res) => {
    try {
      const craftmanSchedule = await CraftmanSchedule.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      return res.json(200, craftmanSchedule);
    } catch (error) {
      console.log(error);
      res.json(400, {success: false, message: 'Something went wrong!', error});
    }
  },
};

