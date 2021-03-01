/**
 * CourierPriceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  //Method called for deleting courier price data
  //Model models/CourierPrice.js
  destroy: async (req, res) => {
    try{
      const user = await CourierPrice.update({ id: req.param('id') }, { deletedAt: new Date() }).fetch();
      return res.json(user[0]);
    }
    catch (error){
      return res.json(error, 400);
    }
  }
};

