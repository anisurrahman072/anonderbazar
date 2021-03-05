/**
 * ProductCategoriesController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const {asyncForEach} = require('../../libs/helper');
const {pagination} = require('../../libs/pagination');

module.exports = {
  //Method called for getting all product categories data
  //Model models/Category.js
  getAll: async (req, res) => {
    try {

      let _pagination = pagination(req.query);

      /* WHERE condition for .............START ...............................*/
      let _where = {};
      _where.type_id = 2;
      _where.deletedAt = null;

      if (req.query.category_id) {
        _where.category_id = req.query.category_id;
      }
      if (req.query.subcategory_id) {
        _where.subcategory_id = req.query.subcategory_id;
      }
      if (req.query.search_term) {
        _where.or = [
          {name: {'like': `%${req.query.search_term}%`}}
        ];
      }

      /*  WHERE condition ...................END ...........*/
      /*sort.....................*/
      let _sort = [];
      if (req.query.sortName) {
        _sort.push({name: req.query.sortName});
      }
      if (req.query.sortPrice) {
        _sort.push({price: req.query.sortPrice});
      }
      /*...........SORT END .................*/
      let totalCategory = await Category.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalCategory;

      let categories = await Category.find({
        where: _where,
        limit: _pagination.limit,
        skip: _pagination.skip,
        sort: _sort,
      })
        .populate('offer_id');

      return res.status(200).json({
        success: true,
        total: totalCategory,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get all category with pagination ',
        data: categories
      });
    } catch (error) {
      let message = 'Error in Get All category with pagination';
      return res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
  //Method called for getting all product categories data with subcategories
  //Model models/Category.js
  withProductSubcategory: async (req, res) => {
    try {

      let _pagination = pagination(req.query);

      /* WHERE condition for .............START ...............................*/
      let _where = {};
      _where.type_id = 2;
      _where.deletedAt = null;
      _where.parent_id = 0;

      let _sort = [];
      if (req.query.sortName) {
        _sort.push({name: req.query.sortName});
      }

      if (req.query.search_term) {
        _where.or = [
          {name: {'like': `%${req.query.search_term}%`}}
        ];
      }

      let totalCategory = await Category.count().where(_where);
      let categories = await Category.find({
        where: _where,
        limit: _pagination.limit,
        skip: _pagination.skip,
        sort: _sort,
      });


      await asyncForEach(categories, async (_category) => {
        _category.subCategories = await Category.find({type_id: 2, parent_id: _category.id, deletedAt: null});
      });

      return res.status(200).json({
        success: true,
        total: totalCategory,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'product category  withsubcategory',
        data: categories

      });
    } catch (error) {

      console.log(error);
      return res.status(400).json({
        success: false,
        message: '',
        error
      });
    }

  }
};
