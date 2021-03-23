/**
 * ProductCategoriesController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const Promise = require('bluebird');
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
      const categoryNativeQuery = Promise.promisify(Category.getDatastore().sendNativeQuery);
      let _pagination = pagination(req.query);

      let rawSelect = `
        SELECT
            categories.id as id,
            categories.code as code,
            categories.name as name,
            categories.parent_id as parent_id,
            categories.image as image,
            categories.slug as slug,
            parent.name as parent_name
      `;

      let fromSQL = ' FROM categories as categories  ';
      fromSQL += ' LEFT JOIN categories as subCategory ON subCategory.parent_id = categories.id   ';
      fromSQL += ' LEFT JOIN categories as parent ON parent.id = categories.parent_id   ';
      let _where = ` WHERE categories.deleted_at IS NULL  `;

      let _groupBy = ' GROUP By categories.id ';

      if (req.query.name_search) {
        _where += ` AND categories.name LIKE '%${req.query.name_search}%' `;
      }
      if (req.query.code_search) {
        _where += ` AND categories.code LIKE '%${req.query.code_search}%' `;
      }
      if (req.query.id_search) {
        _where += ` AND categories.id = '${req.query.id_search}' `;
      }

      let _sort = '';
      if (req.query.sortKey && req.query.sortVal) {
        if(req.query.sortKey !== 'child_count'){
          _sort = ` ORDER BY categories.${req.query.sortKey} ${req.query.sortVal} `;
        } else {
          _sort = ` ORDER BY COUNT(categories.id) ${req.query.sortVal} `;
        }
      } else {
        _sort = ` ORDER BY COUNT(categories.id) DESC `;
      }

      const totalCategoryRaw = await categoryNativeQuery('SELECT COUNT(*) as totalCount FROM categories ' + _where, []);

      rawSelect += ' , (COUNT(categories.id) -1) as total_sub_categories ';

      let totalCategories = 0;
      let allCategories = [];
      if (totalCategoryRaw && totalCategoryRaw.rows && totalCategoryRaw.rows.length > 0) {
        totalCategories = totalCategoryRaw.rows[0].totalCount;
        _pagination.limit = _pagination.limit ? _pagination.limit : totalCategories;

        let limitSQL = ` LIMIT ${_pagination.skip}, ${_pagination.limit} `;
        const rawResult = await categoryNativeQuery(rawSelect + fromSQL + _where + _groupBy + _sort + limitSQL, []);

        allCategories = rawResult.rows;
      }

      return res.status(200).json({
        success: true,
        total: totalCategories,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'product categories  with subcategory ccount ',
        data: allCategories

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
