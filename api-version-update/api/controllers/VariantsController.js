/**
 * VariantsController
 *
 * @description :: Server-side logic for managing variants
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const {pagination} = require('../../libs/pagination');
const {performance} = require('perf_hooks');

module.exports = {
  //Method called for getting all variant data
  //Model models/Variant.js
  getAll: async (req, res) => {
    try {

      const time1 = performance.now();

      let _pagination = pagination(req.query);

      let _where = {};
      _where.deletedAt = null;

      if (req.query.searchTermName) {
        _where.name = {'like': `%${req.query.searchTermName}%`};
      }

      let _sort = [];
      if (req.query.sortKey && req.query.sortValue) {
        _sort.push({[req.query.sortKey]: req.query.sortValue});
      } else {
        _sort.push({createdAt: 'DESC'});
      }

      let totalVariant = await Variant.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalVariant;
      let variants = await Variant.find(
        {
          where: _where,
          limit: _pagination.limit,
          skip: _pagination.skip,
          sort: _sort,
        });

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      res.status(200).json({
        success: true,
        total: totalVariant,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All variant with pagination',
        data: variants
      });
    } catch (error) {
      let message = 'Error in Get All Variant with pagination';
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);
      res.status(400).json({
        success: false,
        message
      });
    }
  },


};

