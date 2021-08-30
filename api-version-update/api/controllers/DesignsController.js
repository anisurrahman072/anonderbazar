/**
 * DesignsController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {performance} = require('perf_hooks');
const {pagination} = require('../../libs/pagination');
module.exports = {
  //Method called for getting all design image list data
  //Model models/DesignImage.js
  getAll: async (req, res) => {
    try {
      const time1 = performance.now();


      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};

      _where.deletedAt = null;

      if (req.query.searchTermName) {
        _where.name = {'like': `%${req.query.searchTermName}%`};
      }

      if (req.query.warehouse_id) {
        _where.warehouse_id = req.query.warehouse_id;
      }

      let _sort = [];
      if (req.query.sortName) {
        _sort.push({name: req.query.sortName});
      } else {
        _sort.push({createdAt: 'DESC'});
      }

      let totalDesign = await Design.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalDesign;
      let designs = await Design.find(
        {
          where: _where,
          limit: _pagination.limit,
          skip: _pagination.skip,
          sort: _sort,
        })
        .populate('product_id')
        .populate('warehouse_id');

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true,
        total: totalDesign,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All design with pagination',
        data: designs
      });
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      let message = 'Error in Get All design with pagination';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
};

