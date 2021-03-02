/**
 * EventPriceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  //Method called for getting a event price data
  //Model models/EventPrice.js
  findOne: async (req, res) => {
    try {
      res.status(200).json(
        await EventPrice.findOne(req.params.id)
      );
    } catch (error) {
      let message = 'Error in Getting the event price';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
  //Method called for deleting a event price data
  //Model models/EventPrice.js
  destroy: async (req, res) => {
    try {
      const eventPrice = await EventPrice.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      return res.json(eventPrice);
    } catch (error) {
      console.log(error);
      res.status(error.status).json({error: error});
    }
  }
};

