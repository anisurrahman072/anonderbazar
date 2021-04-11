/**
 * BrandsController
 *
 * @description :: Server-side logic for managing brands
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const Promise = require('bluebird');
const _ = require('lodash');
const {pagination} = require('../../libs/pagination');

module.exports = {
  //Method called for getting brandsByCategories data
  //Model models/Brand.js
  brandsByCategories: async (req, res) => {
    /*    let _where = {};

    if (req.body && req.body.category_id) {
      _where.type_id = req.body.category_id;
    }*/
    try {

      const productNativeQuery = Promise.promisify(Product.getDatastore().sendNativeQuery);

      let rawSelect = `
        SELECT
            category_id,
            GROUP_CONCAT(brand_id) as brand_ids
    `;
      let fromSQL = ` FROM products `;

      let _where = ` WHERE deleted_at IS NULL  GROUP BY category_id `;

      const rawResult = await productNativeQuery(rawSelect + fromSQL + _where, []);

      if (!(rawResult && rawResult.rows && rawResult.rows.length > 0)) {
        return exits.error(new Error('No Coupon code found'));
      }

      console.log('numberOfUser: ', rawResult.rows.length);
      const allRows = rawResult.rows.map((row) => {
        return {
          category_id: row.category_id,
          brand_ids: _.uniq(row.brand_ids.split(','))
        };
      });

      console.log('allRows', allRows);

      let allBrandIds = [];
      allRows.forEach((row) => {
        allBrandIds = allBrandIds.concat(row.brand_ids);
      });
      allBrandIds = _.uniq(allBrandIds);

      const brandIdsByCategory = _.keyBy(allRows, 'category_id');

      console.log('brandIdsByCategory', brandIdsByCategory);

      let brands = await Brand.find({
        where: {
          id: allBrandIds
        }
      });

      return res.status(200).json({
        data: brands,
        message: 'success'
      });
    } catch (error) {
      console.log(error);
      return res.json(400, {message: 'Something went wrong!', error});
    }
  },
  //Method called for getting shopbybrand data
  //Model models/Brand.js
  shopbybrand: async (req, res) => {
    /*    let _where = {};

    if (req.body && req.body.category_id) {
      _where.type_id = req.body.category_id;
    }*/
    try {
      const productNativeQuery = Promise.promisify(Product.getDatastore().sendNativeQuery);

      let rawSelect = `
        SELECT
            COUNT(*) as productCount,
            brand_id as brand_id
    `;
      let fromSQL = ` FROM products `;

      let _where = ` WHERE deleted_at IS NULL `;
      if (req.body && req.body.category_id) {
        _where += ` AND category_id = ${req.body.category_id} `;
      }
      _where += ' GROUP BY brand_id ';

      const rawResult = await productNativeQuery(rawSelect + fromSQL + _where, []);

      if (!(rawResult && rawResult.rows && rawResult.rows.length > 0)) {
        return exits.error(new Error('No Coupon code found'));
      }

      console.log('numberOfUser: ', rawResult.rows.length);
      const allBrandIds = rawResult.rows.map((item) => item.id);
      /*

      let products = await Product.find(
      {where: _where}
      );

*/
      let brands = await Brand.find({
        where: {
          id: allBrandIds
        }
      });

      return res.status(200).json({
        data: brands,
        message: req.body.category_id,
      });
    } catch (error) {
      console.log(error);
      return res.json(400, {message: 'Something went wrong!', error});
    }
  },
  //Method called for getting all brand data
  //Model models/Brand.js
  index: async (req, res) => {
    try {

      let _pagination = pagination(req.query);

      let _where = {};
      _where.deletedAt = null;

      if (req.query.warehouse_id) {
        _where.warehouse_id = req.query.warehouse_id;
      } else if (req.token && req.token.userInfo.warehouse_id) {
        _where.warehouse_id = req.token.userInfo.warehouse_id.id;
      }

      if (req.query.search_term) {

        _where.or = [
          {
            name: {
              like: `%${req.query.search_term}%`
            }
          }
        ];
      }
      let _sort = [];
      if (req.query.sortKey && req.query.sortValue) {
        _sort.push({[req.query.sortKey]: req.query.sortValue});
      } else {
        _sort.push({createdAt: 'DESC'});
      }

      /*.....SORT END..............................*/

      let totalBrand = await Brand.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalBrand;
      let brands = await Brand.find({
        where: _where,
        limit: _pagination.limit,
        skip: _pagination.skip,
        sort: _sort
      });

      res.status(200).json({
        success: true,
        total: totalBrand,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All brands with pagination',
        data: brands
      });
    } catch (error) {
      let message = 'Error in Get All brands with pagination';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
  //Method called for getting a brand data
  //Model models/Brand.js
  findOne: async (req, res) => {
    try {

      let brand = await Brand.findOne({
        id: req.params.id
      });

      return res.status(200).json({
        success: true,
        message: 'read single brand',
        data: brand
      });
    } catch (error) {
      let message = 'error in read single farmer';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
};
