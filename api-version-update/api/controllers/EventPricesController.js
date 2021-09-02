/**
 * EventPricesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const {performance} = require('perf_hooks');

const {pagination} = require('../../libs/pagination');
module.exports = {
  //Method called for getting all event price data
  //Model models/EventPrice.js
  index: async (req, res) => {

    try {
      const time1 = performance.now();


      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};
      _where.deletedAt = null;
      /*.....SORT END..............................*/

      let totalEventPrices = await EventPrice.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalEventPrices;
      let eventprices = await EventPrice.find({
        where: _where,
        limit: _pagination.limit,
        skip: _pagination.skip,
      });

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

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

      let message = 'Error in Getting All products with pagination';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
  //Method called for getting event price data by ids
  //Model models/EventPrice.js
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
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

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
        message,
        error
      });
    }
  }

};

