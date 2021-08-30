/**
 * DesignCategoriesController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


const {asyncForEach} = require('../../libs/helper');
const {pagination} = require('../../libs/pagination');
const {performance} = require('perf_hooks');

module.exports = {
  //Method called for getting all category design list data
  //Model models/DesignCategory.js
  getAll: async (req, res) => {
    try {
      const time1 = performance.now();

      let _pagination = pagination(req.query);

      let _where = {};
      _where.deletedAt = null;
      _where.parent_id = 0;

      if (req.query.searchTermName) {
        _where.name = {'like': `%${req.query.searchTermName}%`};
      }

      let _sort = [];
      if (req.query.sortName) {
        _sort.push({name: req.query.sortName});
      }

      let totalDesignCategories = await DesignCategory.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalDesignCategories;
      let designCategories = await DesignCategory.find(
        {
          where: _where,
          limit: _pagination.limit,
          skip: _pagination.skip,
          sort: _sort,
        });


      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true,
        total: totalDesignCategories,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All designCategories with pagination',
        data: designCategories
      });
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      let message = 'Error in Get All designCategories with pagination';
      return res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
  //Method called for getting all category design list with sub categories
  //Model models/DesignCategory.js
  withDesignSubcategory: async (req, res) => {
    try {
      const time1 = performance.now();


      let _pagination = pagination(req.query);

      let _where = {};
      _where.deletedAt = null;
      _where.parent_id = 0;

      let _sort = [];
      if (req.query.sortName) {
        _sort.push({name: req.query.sortName});
      }

      if (req.query.searchTermName) {
        _where.or = [
          {name: {'like': `%${req.query.searchTermName}%`}}
        ];
      }

      let totalCategory = await DesignCategory.count().where(_where);
      let categories = await DesignCategory.find({
        where: _where,
        limit: _pagination.limit,
        skip: _pagination.skip,
        sort: _sort,
      });

      await asyncForEach(categories, async (_category) => {
        _category.subCategories = await DesignCategory.find({parent_id: _category.id, deletedAt: null});
      });

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true,
        total: totalCategory,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'product category with subcategory',
        data: categories
      });

    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        success: false,
        message: '',
        error
      });
    }
  }

};

