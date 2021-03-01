/**
 * CourierController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const {initLogPlaceholder} = require('../../libs');

module.exports = {

  //Method called for creating courier data
  //Model models/Courier.js
  create: async (req, res) => {
    initLogPlaceholder(req, 'Courier Service create');

    async function create(body) {
      try {
        let data = await Courier.create(body);

        if (data) {
          return res.json(200, data);
        } else {
          return res.status(400).json({success: false});
        }
      } catch (error) {
        return res.status(400).json({success: false, error});
      }
    }

    if (req.body) {
      req.body.status = 1;
    }
    create(req.body);
  },
  //Method called for updating courier data
  //Model models/Courier.js
  update: async (req, res) => {
    try {
      const courier = await Courier.updateOne(req.param('id'));
      return res.json(courier);
    } catch (error) {
      return res.json(400, {message: 'wrong', error});
    }
  },

  //Method called for deleting courier data
  //Model models/Courier.js
  destroy: async (req, res) => {
    try {
      const courier = await Courier.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      return res.json(courier);
    } catch (error) {
      return res.json(400, {message: 'wrong', error});
    }
  }
};

