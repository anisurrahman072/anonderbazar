/**
 * CourierPricesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const {performance} = require('perf_hooks');

const {pagination} = require('../../libs/pagination');
module.exports = {
  //Method called for getting all courier price list data
  //Model models/CourierPrice.js
  index: async (req, res) => {

    try {
      const time1 = performance.now();


      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};
      _where.deletedAt = null;
      if (req.query.courier_id) {
        _where.courier_id.id = req.query.courier_id;
      }
      let totalCourierPrice = await CourierPrice.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalCourierPrice;
      let courierprices = await CourierPrice.find({
        where: _where,
      }).populate('courier_id');

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

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
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      let message = 'Error in Get All couriers with pagination';
      res.status(400).json({
        success: false,
        message
      });
    }
  },
  //Method called for getting one courier price data
  //Model models/CourierPrice.js
  findOne: async (req, res) => {
    try {
      const time1 = performance.now();

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      res.status(200).json(
        await CourierPrice.findOne(req.params.id)
      );
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      let message = 'Error in Geting the product';
      res.status(400).json({
        success: false,
        message: message
      });
    }
  },
  //Method called for getting all courier price by ids
  //Model models/CourierPrice.js
  getPriceByIds:async (req, res)=>{
    try {

      const time1 = performance.now();

      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};
      _where.deletedAt = null;
      let ids = JSON.parse(req.query.ids);

      let totalEventPrices = await EventPrice.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalEventPrices;
      let eventprices = await EventPrice.find().where({id: ids});

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      res.status(200).json({
        success: true,
        total: totalEventPrices,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All products with pagination',
        data: eventprices
      });
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      let message = 'Error in Get All products with pagination';
      res.status(400).json({
        success: false,
        message
      });
    }
  }

};

