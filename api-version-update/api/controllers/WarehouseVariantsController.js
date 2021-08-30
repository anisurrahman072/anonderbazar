/**
 * WarehouseVariantsController
 * @description :: Server-side logic for managing warehousevariants
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 **/

const {pagination} = require('../../libs/pagination');
const {performance} = require('perf_hooks');

module.exports = {
  //Method called for getting all warehouse variant data
  //Model models/WarehouseVariant.js
  getAll: async (req, res) => {
    try {
      const time1 = performance.now();


      let _pagination = pagination(req.query);

      let _where = {};
      _where.deletedAt = null;

      if (req.query.searchTermName) {
        _where.name = {'like': `%${req.query.searchTermName}%`};
      }
      if (req.query.warehouse_id) {
        _where.warehouse_id = req.query.warehouse_id;
      }

      let _sort = [];
      if (req.query.sortKey && req.query.sortValue) {
        _sort.push({[req.query.sortKey]: req.query.sortValue});
      } else {
        _sort.push({createdAt: 'DESC'});
      }

      let totalWarehouseVariant = await WarehouseVariant.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalWarehouseVariant;
      let warehouseVariants = await WarehouseVariant.find(
        {
          where: _where,
          limit: _pagination.limit,
          skip: _pagination.skip,
          sort: _sort,
        })
        .populate('variant_id')
        .populate('brand_id');

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      res.status(200).json({

        success: true,
        total: totalWarehouseVariant,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All WarehouseVariant with pagination',
        data: warehouseVariants
      });
    } catch (error) {
      let message = 'Error in Get All WarehouseVariant  with pagination';
      console.log('error', error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
};

