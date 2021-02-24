/**
 * CourierListsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const {Helper, asyncForEach, initLogPlaceholder, pagination} = require('../../libs');

module.exports = {

  //Method called for getting all courier suborder list data
  //Model models/CourierList.js
  index: async (req, res) => {


    try {
      initLogPlaceholder(req, 'CourierList');

      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};
      _where.deletedAt = null;
      if (req.query.warehouse_id) {
        _where.warehouse_id = req.query.warehouse_id;
      }
      if (req.query.id) {
        _where.id = req.query.id;
      }
      let totalCourierPrice = await CourierList.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalCourierPrice;
      let courierprices = await CourierList.find({
        where: _where,
      }).populate('suborder_id', {deletedAt: null})
        .populate('courier_id', {deletedAt: null})
        .populate('courier_price_id', {deletedAt: null});

      res.status(200).json({
        success: true,
        total: totalCourierPrice,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All couriers with pagination',
        data: courierprices
      });
    } catch (error) {
      let message = 'Error in Get All couriers with pagination';
      res.status(400).json({
        success: false,
        message
      });
    }
  },
  //Method called for getting one courier suborder list data
  //Model models/CourierList.js
  findOne: async (req, res) => {
    try {
      let courier = await CourierList.findOne({
        where: {
          id: req.params.id
        }
      }).populate('suborder_id', {deletedAt: null})
        .populate('courier_id', {deletedAt: null})
        .populate('courier_price_id', {deletedAt: null});

      res.status(200).json({
        success: true,
        message: 'read single farmer',
        data: courier ? courier : {}
      });
    } catch (error) {
      let message = 'error in read single courier';
      res.status(400).json({
        success: false,
        message
        // error:error.toJSON()
      });
    }
  },
  //Method called for getting all courier order list data
  //Model models/CourierList.js
  courierorder: async (req, res) => {


    try {
      initLogPlaceholder(req, 'CourierList');

      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};
      _where.deletedAt = null;

      let totalCourierPrice = await CourierListOrder.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalCourierPrice;
      let courierprices = await CourierListOrder.find({
        where: _where,
      }).populate('order_id', {deletedAt: null})
        .populate('courier_id', {deletedAt: null})
        .populate('courier_price_id', {deletedAt: null});

      res.status(200).json({
        success: true,
        total: totalCourierPrice,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All couriers with pagination',
        data: courierprices
      });
    } catch (error) {
      let message = 'Error in Get All couriers with pagination';
      res.status(400).json({
        success: false,
        message
      });
    }
  },
};

