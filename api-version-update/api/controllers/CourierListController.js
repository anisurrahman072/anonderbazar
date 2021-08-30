/**
 * CourierListController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const {performance} = require('perf_hooks');

module.exports = {

  //Method called for creating courier sub order data
  //Model models/CourierList.js
  create: async (req, res) => {
    try {
      const time1 = performance.now();


      if (req.body) {
        req.body.status = 3;
      }

      let suborder = await Suborder.update({id: req.body.suborder_id}, {courier_status: 1}).fetch();
      if (req.body.warehouse_id === '') {
        req.body.warehouse_id = suborder[0].warehouse_id;
      }

      let courierList = await CourierList.create(req.body).fetch();
      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({courierList: courierList});

    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.status(error.status).json({success: false, error: error});
    }
  },
  //Method called for creating courier order data
  //Model models/CourierList.js
  courierordercreate: async (req, res) => {

    try {
      const time1 = performance.now();

      if (req.body) {
        req.body.status = 3;
      }

      await Order.update({id: req.body.order_id}, {courier_status: 1}).fetch();

      let courierListOrder = await CourierListOrder.create(req.body).fetch();

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({courierListOrder: courierListOrder});

    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.status(error.status).json({error: error});
    }
  },

  //Method called for updating courier sub order data
  //Model models/CourierList.js
  updateSuborder: async function (req, res) {
    try {
      const time1 = performance.now();

      if (req.body.status === '2' || req.body.status === '11' || req.body.status === '12') {
        let list = await CourierList.update({suborder_id: req.param('id')}, req.body).fetch();
        const time2 = performance.now();
        sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

        return res.json(200, list);
      }
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({success: false, error: error});
    }
  },
  //Method called for updating courier list status
  //Model models/CourierList.js
  update: async (req, res) => {
    try {
      const time1 = performance.now();

      const courierlist = await CourierList.update({id: req.param('id')}, {status: req.body.status}).fetch();
      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(200, courierlist);
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.json(error, 400);
    }
  },
  //Method called for creating courier order data
  //Model models/CourierList.js
  updatecourierlistorder: async (req, res) => {
    try {
      const time1 = performance.now();

      const courierlist = await CourierListOrder.update({id: req.param('id')}, {status: req.body.status}).fetch();
      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(200, courierlist);
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.json(error, 400);
    }
  },
  //Method called for updating courier list data
  //Model models/CourierList.js
  updateCourier: async (req, res) => {
    try {
      const time1 = performance.now();

      const courierlist = await CourierList.updateOne({id: req.param('id')}).set(req.body);
      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(200, courierlist);
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.json(error, 400);
    }
  },
  //Method called for deleting courier list data
  //Model models/CourierList.js
  destroy: async (req, res) => {
    try {
      const time1 = performance.now();

      const user = await CourierList.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(200, user[0]);
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.json(error, 400);
    }
  },
  //Method called for deleting courier order list data
  //Model models/CourierList.js
  CourierListOrder: async (req, res) => {
    try {
      const time1 = performance.now();

      const user = await CourierListOrder.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(200, user[0]);
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.json(error, 400);
    }
  },
};

