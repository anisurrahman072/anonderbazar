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
      let message = 'Error in Geting the product';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
  //Method called for deleting a event price data
  //Model models/EventPrice.js
  destroy: function(req, res) {
    EventPrice.update({ id: req.param('id') }, { deletedAt: new Date() }).exec(
      (err, EventManagement) => {
        if (err) {return res.json(err, 400);}
        return res.json(EventManagement[0]);
      }
    );
  }

};

