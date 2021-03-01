/**
 * CourierListController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const {Helper, asyncForEach, initLogPlaceholder, pagination} = require('../../libs');

module.exports = {

  //Method called for creating courier sub order data
  //Model models/CourierList.js
  create: async (req, res) => {
    initLogPlaceholder(req, 'Courier create');

    async function create(body) {
      try {
        var suborder = await Suborder.update({id: req.body.suborder_id}, {courier_status: 1});
        if (body.warehouse_id === '') {
          body.warehouse_id = suborder[0].warehouse_id;
        }

        let data = await CourierList.create(body);

        if (data) {
          return res.json(200, data);
        } else {
          return res.status(400).json({success: false});
        }
      } catch (error) {
        return res.status(400).json({success: false});
      }
    }

    if (req.body) {
      req.body.status = 3;
    }
    create(req.body);
  },
  //Method called for creating courier order data
  //Model models/CourierList.js
  courierordercreate: async (req, res) => {
    initLogPlaceholder(req, 'Courier create');

    async function create(body) {
      try {
        var order = await Order.update({id: req.body.order_id}, {courier_status: 1});

        let data = await CourierListOrder.create(body);

        if (data) {
          return res.json(200, data);
        } else {
          return res.status(400).json({success: false});
        }
      } catch (error) {
        return res.status(400).json({success: false});
      }
    }

    if (req.body) {
      req.body.status = 3;
    }
    create(req.body);
  },

  //Method called for updating courier sub order data
  //Model models/CourierList.js
  updateSuborder: async function (req, res) {
    try {
      if (req.body.status === '2' || req.body.status === '11' || req.body.status === '12') {
        let list = await CourierList.update({suborder_id: req.param('id')}, req.body).fetch();
        return res.json(200, list);
      }
    } catch (error){
      return res.status(400).json({success: false});
    }
  },
  //Method called for updating courier list status
  //Model models/CourierList.js
  update: async (req, res) => {
    try {
      const courierlist = await CourierList.update({id: req.param('id')}, {status: req.body.status}).fetch();
      return res.json(200, courierlist);
    } catch (error){
      return res.json(error, 400);
    }
  },
  //Method called for creating courier order data
  //Model models/CourierList.js
  updatecourierlistorder: async (req, res) => {
    try {
      const courierlist = await CourierListOrder.update({id: req.param('id')}, {status: req.body.status}).fetch();
      return res.json(200, courierlist);
    } catch (error){
      return res.json(error, 400);
    }
  },
  //Method called for updating courier list data
  //Model models/CourierList.js
  updateCourier: async (req, res) => {
    try {
      const courierlist = await CourierList.update({id: req.param('id')}, req.body).fetch();
      return res.json(200, courierlist);
    } catch (error){
      return res.json(error, 400);
    }
  },
  //Method called for deleting courier list data
  //Model models/CourierList.js
  destroy: async (req, res) => {
    try {
      const user = await CourierList.update({id: req.param('id')}, {deletedAt: new Date()}).fetch();
      return res.json(200, user[0]);
    } catch (error){
      return res.json(error, 400);
    }
  },
  //Method called for deleting courier order list data
  //Model models/CourierList.js
  CourierListOrder: async (req, res) => {
    try {
      const user = await CourierListOrder.update({id: req.param('id')}, {deletedAt: new Date()}).fetch();
      return res.json(200, user[0]);
    } catch (error){
      return res.json(error, 400);
    }
  },
};

