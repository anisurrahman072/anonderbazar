/**
 * OrdersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { Helper } = require('../../libs');


//Method called for getting all order products data
//Model models/Product.js
exports.index = async (req, res) => {
  try {
    // initLogPlaceholder(req, `${_model}List`);

    console.log('--- lsdjflsjdfj -------------------- ----');

    const _pagination = Helper.pagination(req.query);

    /* WHERE condition for .......START..................... */
    const _where = {};
    _where.deletedAt = null;

    if (req.query.warehouse_id) {
      _where.warehouse_id = req.query.warehouse_id;
    }
    if (req.token && req.token.userInfo.warehouse_id) {
      _where.warehouse_id = req.token.userInfo.warehouse_id.id;
    }
    if (req.query.category_id) {
      _where.category_id = req.query.category_id;
    }
    if (req.query.subcategory_id) {
      _where.subcategory_id = req.query.subcategory_id;
    }

    if (req.query.search_term) {

      _where.or = [
        { name: { like: `%${req.query.search_term}%` } }
      ];
    }
    /* WHERE condition..........END................ */

    /* sort................ */
    const _sort = {};
    if (req.query.sortName) {
      _sort.name = req.query.sortName;
    }
    if (req.query.sortPrice) {
      _sort.price = req.query.sortPrice;
    }
    /* .....SORT END.............................. */

    const totalProduct = await Product.count().where(_where);
    _pagination.limit = _pagination.limit ? _pagination.limit : totalProduct;
    const products = await Product.find({
      where: _where,
      limit: _pagination.limit,
      skip: _pagination.skip,
      sort: _sort
    })
      .populate('brand_id')
      .populate('type_id')
      .populate('category_id')
      .populate('subcategory_id')
      .populate('warehouse_id')
      .populate('craftsman_id')
      .populate('updated_by')
      .populate('created_by')
      .populate('product_variants', {deletedAt: null})
      .populate('product_images', {deletedAt: null})
      .populate('coupon_banner_images', {deletedAt: null});
    res.status(200).json({
      success: true,
      total: totalProduct,
      limit: _pagination.limit,
      skip: _pagination.skip,
      page: _pagination.page,
      message: 'Get All products with pagination',
      data: products
    });
  } catch (error) {
    const message = 'Error in Get All products with pagination';
    res.status(400).json({
      success: false,
      message
    });
  }
};

exports.create = async (req, res) => {
  try {
    initLogPlaceholder(req, 'productList');

    const _pagination = pagination(req.query);

    /* WHERE condition for .......START..................... */
    const _where = {};
    _where.deletedAt = null;

    if (req.query.warehouse_id) {
      _where.warehouse_id = req.query.warehouse_id;
    }
    if (req.token && req.token.userInfo.warehouse_id) {
      _where.warehouse_id = req.token.userInfo.warehouse_id.id;
    }
    if (req.query.category_id) {
      _where.category_id = req.query.category_id;
    }
    if (req.query.subcategory_id) {
      _where.subcategory_id = req.query.subcategory_id;
    }

    if (req.query.search_term) {

      _where.or = [
        { name: { like: `%${req.query.search_term}%` } }
      ];
    }
    /* WHERE condition..........END................ */

    /* sort................ */
    const _sort = {};
    if (req.query.sortName) {
      _sort.name = req.query.sortName;
    }
    if (req.query.sortPrice) {
      _sort.price = req.query.sortPrice;
    }
    /* .....SORT END.............................. */

    const totalProduct = await Product.count().where(_where);
    _pagination.limit = _pagination.limit ? _pagination.limit : totalProduct;
    const products = await Product.find({
      where: _where,
      limit: _pagination.limit,
      skip: _pagination.skip,
      sort: _sort
    })
      .populate('brand_id')
      .populate('type_id')
      .populate('category_id')
      .populate('subcategory_id')
      .populate('warehouse_id')
      .populate('craftsman_id')
      .populate('updated_by')
      .populate('created_by')
      .populate('product_variants', {deletedAt: null})
      .populate('product_images', {deletedAt: null})
      .populate('coupon_banner_images', {deletedAt: null});

    res.status(200).json({
      success: true,
      total: totalProduct,
      limit: _pagination.limit,
      skip: _pagination.skip,
      page: _pagination.page,
      message: 'Get All products with pagination',
      data: products
    });
  } catch (error) {
    const message = 'Error in Get All products with pagination';
    res.status(400).json({
      success: false,
      message
    });
  }
};
