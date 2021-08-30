/**
 * CraftmanPricesController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const {pagination} = require('../../libs/pagination');
const {performance} = require('perf_hooks');
module.exports = {
  //Method called for getting all craftsman price list data
  //Model models/CraftmanPrice.js
  getAll: async (req, res) => {
    try {
      const time1 = performance.now();

      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};
      _where.deletedAt = null;

      //for craft man username
      if (req.query.warehouse_id) {
        _where.warehouse_id = req.query.warehouse_id;
      }
      //for craft man username
      if (req.query.nameSearchValue) {
        _where.craftman_id = {like: `%${req.query.nameSearchValue}%`};
      }

      if (req.query.productClassSearchValue) {
        _where.total_quantity = {
          like: `%${req.query.productClassSearchValue}%`
        };
      }
      if (req.query.categorySearchValue) {
        _where.total_quantity = {like: `%${req.query.categorySearchValue}%`};
      }
      if (req.query.subCategorySearchValue) {
        _where.total_quantity = {
          like: `%${req.query.subCategorySearchValue}%`
        };
      }
      if (req.query.partSearchValue) {
        _where.part_id = {like: `%${req.query.partSearchValue}%`};
      }
      if (req.query.genreSearchValue) {
        _where.genre_id = {like: `%${req.query.genreSearchValue}%`};
      }
      if (req.query.designCategorySearchValue) {
        _where.design_category_id = {
          like: `%${req.query.designCategorySearchValue}%`
        };
      }
      if (req.query.designSubcategorySearchValue) {
        _where.design_subcategory_id = {
          like: `%${req.query.designSubcategorySearchValue}%`
        };
      }
      if (req.query.designSearchValue) {
        _where.total_quantity = {like: `%${req.query.designSearchValue}%`};
      }
      if (req.query.priceSearchValue) {
        _where.price = {like: `%${req.query.priceSearchValue}%`};
      }
      if (req.query.timeSearchValue) {
        _where.time = {like: `%${req.query.timeSearchValue}%`};
      }

      if (req.query.category_id) {
        _where.category_id = {like: `%${req.query.category_id}%`};
      }
      if (req.query.subcategory_id) {
        _where.subcategory_id = {like: `%${req.query.subcategory_id}%`};
      }

      /* WHERE condition..........END................*/

      /*sort................*/
      let _sort = [];
      if (req.query.sortName) {
        _sort.push({name: req.query.sortName});
      }

      /*.....SORT END..............................*/

      let totalCraftmanPrice = await CraftmanPrice.count().where(_where);
      _pagination.limit = _pagination.limit || totalCraftmanPrice;
      let craftmanPrices = await CraftmanPrice.find({
        where: _where,
        limit: _pagination.limit,
        skip: _pagination.skip,
        sort: _sort
      })
        .populate('craftman_id')
        .populate('type_id')
        .populate('category_id')
        .populate('subcategory_id')
        .populate('part_id')
        .populate('design_category_id')
        .populate('design_subcategory_id')
        .populate('design_id')
        .populate('genre_id')
        .populate('warehouse_id');

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      res.status(200).json({
        success: true,
        total: totalCraftmanPrice,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All CraftmanPrice  with pagination',
        data: craftmanPrices
      });
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      let message = 'Error in Getting All CraftmanPrice with pagination';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  }
};
