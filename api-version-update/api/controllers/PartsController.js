/**
 * PartsController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const {pagination} = require('../../libs/pagination');
const {performance} = require('perf_hooks');

module.exports = {
  //Method called for getting all product part data
  //Model models/Part.js
  getAll: async (req, res) => {
    try {
      const time1 = performance.now();


      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};
      _where.deletedAt = null;


      if (req.query.category_id) {
        _where.category_id = req.query.category_id;
      }
      if (req.query.subcategory_id) {
        _where.subcategory_id = req.query.subcategory_id;
      }

      if (req.query.search_term) {
        _where.or = [
          {name: {'like': `%${req.query.search_term}%`}},
        ];
      }
      let _sort = [];
      if (req.query.sortName) {
        _sort.push({name : req.query.sortName});
      }
      let totalPart = await  Part.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalPart;
      let parts = await Part.find(
        {
          where: _where,
          limit: _pagination.limit,
          skip: _pagination.skip,
          sort: _sort,
        })
        .populate('type_id')
        .populate( 'category_id')
        .populate( 'subcategory_id');

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      res.status(200).json({
        success: true,
        total: totalPart,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get all parts with pagination',
        data: parts
      });
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      let message = 'Error in getting all parts with pagination';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
};

