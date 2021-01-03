/**
 * BrandController
 *
 * @description :: Server-side logic for managing brands
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
import { initLogPlaceholder, pagination } from '../../libs';

module.exports = {
  //Method called for getting shopbybrand data
  //Model models/Brand.js
  shopbybrand: async (req, res) => {
    let _where = {};

    if (req.body.category_id) {
      _where.type_id = req.body.category_id;
    }
    let products = await Product.find(
      { where: _where },
      { select: ['brand_id'] }
      );

    let notDistinctBrand = [];
    let distinctBrand = [];
    let modifiedBrands = [];
    products.forEach(element => {
      notDistinctBrand.push(element.brand_id);
    });
    notDistinctBrand.forEach(element => {
      if (!distinctBrand.includes(element) && element != null) {
        distinctBrand.push(element);
      }
    });
    for (const iterator of distinctBrand) {
      let brand = await Brand.findOne({
        where: {
          id: iterator
        }
      });
      modifiedBrands.push(brand);
    }
    res.status(200).json({
      data: modifiedBrands,
      message: req.body.category_id,
    });
  },
  //Method called for getting all brand data
  //Model models/Brand.js
  index: async (req, res) => {
    try {
      initLogPlaceholder(req, 'brand');

      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};
      _where.deletedAt = null;

      if (req.query.warehouse_id) {
        _where.warehouse_id = req.query.warehouse_id;
      }
      if (req.token && req.token.userInfo.warehouse_id) {
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
      /* WHERE condition..........END................*/

      /*sort................*/
      let _sort = {};
      if (req.query.sortName) {
        _sort.name = req.query.sortName;
      }

      if (req.query.sortCode) {
        _sort.code = req.query.sortCode;
      }

      if (req.query.sortSlug) {
        _sort.slug = req.query.sortSlug;
      }
      /*.....SORT END..............................*/

      let totalBrand = await Brand.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalBrand;
      let brands = await Brand.find({
        where: _where,
        limit: _pagination.limit,
        skip: _pagination.skip,
        sort: _sort
      }).populateAll();

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
        message
      });
    }
  },
  //Method called for getting a brand data
  //Model models/Brand.js
  findOne: async (req, res) => {
    try {

      let brand = await Brand.findOne({
        where: {
          id: req.params._id
        }
      });

      res.status(200).json({
        success: true,
        message: 'read single farmer',
        data: product ? product : {}
      });
    } catch (error) {
      let message = 'error in read single farmer';
      res.status(400).json({
        success: false,
        message
      });
    }
  },
};
