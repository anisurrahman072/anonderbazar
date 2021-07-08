/**
 * ProductController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const moment = require('moment');
const {imageUploadConfig, uploadImages} = require('../../libs/helper');
const Promise = require('bluebird');
const {removeCacheForProduct} = require('../../libs/cache-manage');
const {asyncForEach} = require('../../libs/helper');
const {storeToCache} = require('../../libs/cache-manage');
const {fetchFromCache} = require('../../libs/cache-manage');
const _ = require('lodash');
const {SUB_ORDER_STATUSES} = require('../../libs/subOrders');
const {ACTIVE_WAREHOUSE_STATUS} = require('../../libs/constants');

module.exports = {

  details: async (req, res) => {
    try {
      let key = 'product-' + req.param('id') + '-details';

      let product = await fetchFromCache(key);

      if (product === undefined) {

        product = await Product.findOne({id: req.param('id')})
          .populate('warehouse_id')
          .populate('type_id')
          .populate('brand_id')
          .populate('category_id')
          .populate('subcategory_id')
          .populate('product_images', {deletedAt: null})
          .populate('product_variants', {deletedAt: null});

        console.log('My product: ', product);

        if(!product || product.){

        }

        if(!product.warehouse_id || product.warehouse_id.deletedAt || product.warehouse_id.status != ACTIVE_WAREHOUSE_STATUS){
          return res.status(400).json({
            success: false,
            code: 'warehouseNotFound',
            message: `${product.name} warehouse has been rejected!`
          });
        }

        await storeToCache(key, product);
      }

      let questionRawSQL = `
      SELECT
            product_question_answer.*,
            users.first_name,
            users.last_name
        FROM
            product_question_answer
        LEFT JOIN users ON product_question_answer.user_id = users.id
        LEFT JOIN products ON product_question_answer.product_id = products.id
        WHERE
            products.id = ${req.param('id')} and users.first_name is not null and product_question_answer.deleted_at IS NULL
            order by product_question_answer.id desc
      `;

      const questions = await sails.sendNativeQuery(questionRawSQL, []);

      let ratingRawSQL = `
      SELECT
            product_rating_review.*,
            users.first_name,
            users.last_name
        FROM
            product_rating_review
        LEFT JOIN users ON product_rating_review.user_id = users.id
        LEFT JOIN products ON product_rating_review.product_id = products.id
        WHERE
            products.id = ${req.param('id')} and product_rating_review.deleted_at IS NULL
            order by product_rating_review.id desc
      `;

      const rating = await sails.sendNativeQuery(ratingRawSQL, []);

      return res.status(200).json({
        success: true,
        data: [product, questions.rows, rating.rows],
        message: 'Detail of the requested product'
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        success: false,
        error
      });
    }
  },
  findOne: async (req, res) => {

    try {
      let key = 'product-' + req.param('id') + '-with-pop';
      if (req.query.populate === 'false') {
        key = 'product-' + req.param('id') + '-no-pop';
      }

      let product = await fetchFromCache(key);

      if (product === undefined) {
        if (req.query.populate === 'false') {
          product = await Product.findOne({id: req.param('id')});
        } else {
          product = await Product.findOne({id: req.param('id')})
            .populate('warehouse_id')
            .populate('product_images', {deletedAt: null})
            .populate('product_variants', {deletedAt: null});
        }

        await storeToCache(key, product);
      }
      return res.status(200).json(product);
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        success: false,
        error
      });
    }
  },
  byIds: async (req, res) => {
    try {
      req.query.ids = JSON.parse(req.query.ids);
      console.log(req.query);

      if (req.query.ids && Array.isArray(req.query.ids) && req.query.ids.length > 0) {
        let products = await Product.find({
          id: req.query.ids,
          deletedAt: null,
          approval_status: 2
        }).populate('warehouse_id');
        let productsById = _.keyBy(products, 'id');

        let productsByFrontendPosition = products.map(product => {
          return {id: product.id, frontend_position: product.frontend_position};
        })
          .sort((a, b) => (a.frontend_position > b.frontend_position) ? 1 : -1)
          .map(product => {
            return productsById[`${product.id}`];
          });

        return res.status(200).json(productsByFrontendPosition);
      }

      return res.status(422).json({
        success: false,
        message: 'Invalid'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error
      });
    }
  },

  byIdsWithPopulate: async (req, res) => {

    try {
      const productNativeQuery = Promise.promisify(Product.getDatastore().sendNativeQuery);
      let rawSelect = `
      SELECT
          products.id as id,
          products.code  as code,
          products.name as name,
          products.price,
          products.vendor_price as vendor_price,
          products.image as image,
          products.category_id  as category_id ,
          products.subcategory_id  as subcategory_id ,
          products.type_id   as type_id  ,
          products.brand_id    as brand_id   ,
          products.quantity as quantity,
          products.promotion as promotion,
          products.promo_price as promo_price,
          products.warehouse_id,
          types.name as type_name,
          category.name as category_name,
          subCategory.name as subcategory_name,
          brands.name as brand_name
      `;
      let fromSQL = ' FROM products  ';
      fromSQL += ' LEFT JOIN categories as types ON types.id = products.type_id   ';
      fromSQL += ' LEFT JOIN categories as category ON category.id = products.category_id   ';
      fromSQL += ' LEFT JOIN categories as subCategory ON subCategory.id = products.subcategory_id   ';
      fromSQL += ' LEFT JOIN brands ON brands.id = products.brand_id   ';
      let _where = ' WHERE products.approval_status  = 2 AND products.deleted_at IS NULL ';

      if (req.query.product_ids) {
        try {
          const productIds = JSON.parse(req.query.product_ids);
          if (Array.isArray(productIds) && productIds.length > 0) {
            _where += ` AND products.id IN  (${productIds.join(',')}) `;
          }
        } catch (errorr) {
          console.log(errorr);
          return res.badRequest('Invalid Data');
        }
      }

      const rawResult = await productNativeQuery(rawSelect + fromSQL + _where, []);

      const allProducts = rawResult.rows;

      res.status(200).json(allProducts);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },
  //Method called for deleting a product data
  //Model models/Product.js
  destroy: async (req, res) => {
    try {
      const product = await Product.updateOne({
        id: req.param('id')
      }).set({
        deletedAt: new Date()
      });
      await removeCacheForProduct(req.param('id'));
      return res.json(product);
    } catch (error) {
      return res.status(400).json(error);
    }
  },
  //Method called for finding product max price data
  //Model models/Product.js
  maxPrice: async (req, res) => {
    try {
      const nativeQuery = Promise.promisify(Product.getDatastore().sendNativeQuery);
      const rawResult = await nativeQuery(`SELECT MAX(price) as max FROM products WHERE approval_status = 2`);
      console.log(rawResult.rows[0]);

      if (rawResult && rawResult.rows) {
        return res.json(rawResult.rows[0]);
      }
      return res.status(400).json({success: false});
    } catch (error) {
      return res.status(400).json(error);
    }
  },
  //Method called for finding product min price data
  //Model models/Product.js
  minPrice: async (req, res) => {
    try {
      const nativeQuery = Promise.promisify(Product.getDatastore().sendNativeQuery);
      const rawResult = await nativeQuery(`SELECT MIN(price) as min FROM products WHERE approval_status = 2`);
      console.log(rawResult.rows);
      if (rawResult && rawResult.rows) {
        return res.json(rawResult.rows[0]);
      }
      return res.status(400).json({success: false});
    } catch (error) {
      return res.status(400).json(error);
    }

  },
  //Method called for creating a product data
  //Model models/Product.js,models/ProductImage.js
  create: async function (req, res) {
    try {
      req.body.price = parseFloat(req.body.price);

      let body = req.body;
      console.log('request body', body);

      const existingProduct = await Product.findOne({
        code: body.code
      });

      if (existingProduct) {
        return res.badRequest('Product already existed with this product code');
      }

      if (body.brand_id === '' || body.brand_id === 'undefined') {
        body.brand_id = null;
      }
      if (body.tag === '' || body.tag === 'undefined') {
        body.tag = null;
      }

      if (body.is_coupon_product === '' || body.is_coupon_product === 'undefined') {
        body.is_coupon_product = false;
      }

      if (req.body.hasImageFront === 'true') {
        try {
          const uploaded = await uploadImages(req.file('frontimage'));
          if (uploaded.length === 0) {
            return res.badRequest('No file was uploaded');
          }
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];

          body.image = '/' + newPath;

        } catch (err) {
          console.log('err', err);
          return res.json(err.status, {err: err});
        }
      }
      const product = await sails.getDatastore()
        .transaction(async (db) => {
          const product = await Product.create(body).fetch().usingConnection(db);

          if (body.ImageBlukArray) {
            let imagearraybulk = JSON.parse('[' + req.body.ImageBlukArray + ']');
            for (let i = 0; i < imagearraybulk.length; i++) {
              await ProductImage.update(imagearraybulk[i], {product_id: product.id});
            }
          }

          return product;
        });

      return res.json({
        success: true,
        message: 'Product successfully created',
        data: product
      });

    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'Failed to create product',
        error
      });
    }
  },
  //Method called for updating a product data
  //Model models/Product.js,models/ProductImage.js
  update: async function (req, res) {
    try {

      if (req.body.price) {
        req.body.price = parseFloat(req.body.price); //parseFloat(req.body.craftsman_price) + parseFloat((req.body.craftsman_price * 0.1));
      }
      if (req.body.promo_price) {
        req.body.promo_price = parseFloat(req.body.promo_price);
      }
      let body = req.body;
      if (body.brand_id === '' || body.brand_id === 'undefined' || body.brand_id === 'null') {
        body.brand_id = null;
      }
      if (body.tag === '' || body.tag === 'undefined' || body.tag === 'null') {
        body.tag = null;
      }
      if (body.weight === '' || body.weight === 'undefined' || body.weight === 'null') {
        body.weight = 0;
      }
      if (req.body.hasImageFront === 'true') {
        try {
          const uploaded = await uploadImages(req.file('frontimage'));
          if (uploaded.length === 0) {
            return res.badRequest('No file was uploaded');
          }
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];

          body.image = '/' + newPath;
        } catch (err) {
          console.log('err', err);
          return res.status(400).json(err.status, {err: err});
        }
      }

      if (body.start_date) {
        body.start_date = moment(body.start_date).format('YYYY-MM-DD');
      }

      if (body.end_date) {
        body.end_date = moment(body.end_date).format('YYYY-MM-DD');
      }

      let product = await Product.updateOne({id: req.param('id')}).set(body);

      await removeCacheForProduct(req.param('id'));

      return res.status(200).json(product);
    } catch (err) {
      console.log(err);
      res.json(400, {message: 'Something went wrong!', err});
    }
  },

  //Method called for uploading product images
  //Model models/ProductImage.js
  upload: async (req, res) => {

    try {
      if (req.body.hasImage === 'true' && req.body.product_id) {

        req.file('image').upload(imageUploadConfig(), async (err, uploaded) => {

          if (err) {
            console.log('err', err);
            return res.json(err.status, {err: err});
          }
          if (uploaded.length === 0) {
            return res.badRequest('No file was uploaded');
          }
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
          console.log('uploaded-newPath', newPath);

          const productImage = await ProductImage.create({
            product_id: req.body.product_id,
            image_path: '/' + newPath
          }).fetch();

          return res.json(200, productImage);
        });
      } else if (req.body.hasImage === 'true') {

        req.file('image').upload(imageUploadConfig(), async (err, uploaded) => {

          if (err) {
            console.log('err', err);
            return res.json(err.status, {err: err});
          }
          if (uploaded.length === 0) {
            return res.badRequest('No image was uploaded');
          }
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
          console.log('uploaded-newPath', newPath);

          const productImage = await ProductImage.create({
            product_id: null,
            image_path: '/' + newPath
          }).fetch();

          return res.json(200, productImage);

        });

      } else if (req.body.id) {
        const productImage = await ProductImage.update({id: req.body.id}).set({deletedAt: new Date()}).fetch();
        return res.status(200).json({productImage: productImage});
      } else {
        res.json(400, {message: 'wrong'});
      }
    } catch (err) {
      console.log(err);
      res.json(400, {message: 'wrong'});
    }
  },
  //Method called for uploading product images
  //Model models/ProductImage.js
  uploadCouponBanners: async (req, res) => {
    if (!req.body.product_id) {
      return res.badRequest('No Associated Product to attach banners');
    }

    try {
      let bannerImages = [];

      const uploaded = await uploadImages(req.file('images'));

      const uploadCount = uploaded.length;

      for (let i = 0; i < uploadCount; i++) {
        bannerImages.push('/' + uploaded[i].fd.split(/[\\//]+/).reverse()[0]);
      }

      console.log('uploaded images-', bannerImages);

      if (req.body.existingFiles && Array.isArray(req.body.existingFiles) && req.body.existingFiles.length) {
        bannerImages = req.body.existingFiles.concat(bannerImages);
      }

      let productBanner = await ProductCouponBannerImage.findOne({
        where: {product_id: req.body.product_id, deletedAt: null},
      });

      console.log('all bannerImages', bannerImages);

      if (productBanner && typeof productBanner.id !== 'undefined') {
        await ProductCouponBannerImage.updateOne({id: productBanner.id}).set({banner_images: bannerImages});
      } else {
        productBanner = await ProductCouponBannerImage.create({
          product_id: req.body.product_id,
          banner_images: bannerImages,
          created_at: new Date(),
        }).fetch();
      }

      return res.json(200, productBanner);

    } catch (err) {
      console.log('err', err);
      res.json(400, {message: 'wrong'});
    }
  },
  //Method called for getting a product available date
  //Model models/Product.js
  getAvailableDate: async (req, res) => {

    try {
      /*      function randomDate(start, end) {
        return new Date(
          start.getTime() + Math.random() * (end.getTime() - start.getTime())
        );
      }*/

      let product = req.param('product');
      let productQuantity = req.param('quantity');
      let produceTimeMin = product.produce_time;
      let craftsmanId = product.craftsman_id.id;

      let craftmanSchedule = await CraftmanSchedule.findOne({
        craftman_id: craftsmanId,
        deletedAt: null,
      });
      if (craftmanSchedule && craftmanSchedule.end_time !== null) {
        /*
          let existingCraftsTime =
          craftmanSchedule.end_time.getTime() -
          craftmanSchedule.start_time.getTime();
        */
        let _time_milli =
          ((produceTimeMin * productQuantity) / 60 / 8) * 84300000;
        let newDateObj = new Date(craftmanSchedule.end_time).setMilliseconds(
          ((produceTimeMin * productQuantity) / 60 / 8) * 86400000
        );
        return res.json({date: newDateObj, miliseconds: _time_milli});
      } else {
        let _time = new Date();
        let _time_milli =
          ((produceTimeMin * productQuantity) / 60 / 8) * 84300000;
        let total_time = _time.getTime() + _time_milli + 84300000;
        let newDateObj = new Date(total_time);
        return res.json({date: newDateObj, miliseconds: _time_milli});
      }
    } catch (err) {
      return res.json(400, {error: err});
    }
  },
  //Method called for getting all products with type
  //Model models/Product.js
  withProductType: async (req, res) => {
    try {
      let categories = await Category.find({
        where: {type_id: 1, deletedAt: null, parent_id: null},
        limit: 3,
        sort: 'created_at DESC',
      });

      await asyncForEach(categories, async (_category) => {
        _category.products = await Product.find({
          where: {type_id: _category.id, deletedAt: null, approval_status: 2},
          limit: 5,
          sort: 'created_at DESC',
        });
      });

      res.status(200).json({
        success: true,
        message: 'product type  with Product',
        data: categories,
      });
    } catch (error) {

      res.status(400).json({
        success: false,
        message: '',
        error,
      });
    }
  },
  //Method called for getting most selling warehouse
  //Model models/SuborderItem.js
  mostSellingWarehouse: async (req, res) => {
    try {
      await SuborderItem.query(
        `SELECT * FROM warehouses WHERE warehouses.id IN (select warehouses.id from warehouses left join product_suborders on warehouses.id=product_suborders.warehouse_id WHERE product_suborders.deleted_at is null and warehouses.deleted_at is null and warehouses.status ='2' GROUP by id ORDER by COUNT(warehouses.id) DESC) LIMIT 3`, //);
        (err, rawResult) => {
          if (err) {
            res.status(400).json({
              success: false,
              message: '',
              err,
            });
          }
          res.status(200).json({
            success: true,
            message: 'product type  with Product',
            data: rawResult,
          });
        }
      );
    } catch (error) {

      res.status(400).json({
        success: false,
        message: '',
        error,
      });
    }
  },
  //Method called for getting most selling warehouse
  //Model models/SuborderItem.js
  mostSellingProduct: async (req, res) => {
    try {
      await SuborderItem.query(
        `SELECT * FROM products WHERE products.id IN (select products.id from products left join product_suborder_items on products.id=product_suborder_items.product_id WHERE product_suborder_items.deleted_at is null and products.deleted_at is null GROUP by id ORDER by COUNT(products.id) DESC) LIMIT 3`, //);
        (err, rawResult) => {
          if (err) {
            res.status(400).json({
              success: false,
              message: '',
              err,
            });
          }
          res.status(200).json({
            success: true,
            message: 'product type  with Product',
            data: rawResult,
          });
        }
      );
    } catch (error) {

      return res.status(400).json({
        success: false,
        message: '',
        error,
      });
    }
  },
  uniqueCheckCode: async (req, res) => {
    try {
      console.log(req.query);
      const where = {
        code: req.param('code'),
        deletedAt: null
      };
      if (req.query.exclude_id) {
        where.id = {'!=': req.query.exclude_id};
      }
      console.log(where);

      let exists = await Product.find(where);
      if (exists && exists.length > 0) {
        return res.status(200).json({isunique: false});
      } else {
        return res.status(200).json({isunique: true});
      }
    } catch (error) {
      console.log(error);
      return res.status(400).json({isunique: true});
    }
  },

  getCountByBrandIds: async (req, res) => {

    try {
      let allIds = req.query.brand_ids.split(',').map(id => parseInt(id));

      const productNativeQuery = Promise.promisify(Product.getDatastore().sendNativeQuery);

      let rawSelect = `
            SELECT COUNT(*) as productCount, brand_id   FROM products
            LEFT JOIN warehouses as warehouse on warehouse.id = products.warehouse_id
            WHERE products.deleted_at IS NULL AND warehouse.deleted_at IS NULL AND warehouse.status = 2
             AND products.approval_status = 2 AND brand_id IN (${allIds.join(',')})
            GROUP BY brand_id
      `;

      const rawResult = await productNativeQuery(rawSelect, []);
      if (!(rawResult && rawResult.rows && rawResult.rows.length > 0)) {
        return res.status(200).json({
          data: [],
          message: 'success'
        });
      }

      const finalBrandCounts = _.keyBy(rawResult.rows, 'brand_id');

      res.status(200).json({
        success: true,
        message: 'Successfully counted all products by brand id',
        data: finalBrandCounts
      });

    } catch (error) {
      res.status(400).json({
        message: 'Error occurred: ' + error
      });
    }
  },

  getAllByBrandId: async (req, res) => {
    try {
      let brandId = req.param('brand_id');

      const productNativeQuery = Promise.promisify(Product.getDatastore().sendNativeQuery);
      let rawSelect = `
      SELECT
          products.id as id,
          products.code  as code,
          products.name as name,
          products.price,
          products.vendor_price as vendor_price,
          products.image as image,
          products.category_id  as category_id ,
          products.subcategory_id  as subcategory_id ,
          products.type_id   as type_id  ,
          products.brand_id    as brand_id   ,
          products.quantity as quantity,
          products.promotion as promotion,
          products.promo_price as promo_price,
          products.warehouse_id
      `;
      let fromSQL = ' FROM products  ';
      fromSQL += ' LEFT JOIN warehouses as warehouse ON warehouse.id = products.warehouse_id    ';
      let _where = ` WHERE  products.brand_id = ${brandId}  AND  products.approval_status = 2  AND  products.deleted_at IS NULL  AND
         warehouse.status = 2  AND  warehouse.deleted_at IS NULL ORDER BY products.frontend_position ASC,  products.updated_at DESC  `;

      const rawResult = await productNativeQuery(rawSelect + fromSQL + _where, []);

      return res.status(200).json({
        success: true,
        message: 'Successfully fetched all products by brand ID',
        data: rawResult.rows
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error while fetching all products by brand ID',
        error
      });
    }
  },

  getRecommendedProducts: async (req, res) => {
    try {
      let params = req.allParams();

      let allProducts = await Product.find({
        approval_status: params.approval_status,
        deletedAt: null
      }).limit(params.limit).skip(params.skip).sort([
        {frontend_position: 'ASC'},
        {updatedAt: 'DESC'},
      ]).populate('warehouse_id');

      return res.status(200).json({
        success: true,
        message: 'Successfully fetched all recommended products',
        data: allProducts
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error while fetching all recommended products',
        error
      });
    }
  },

  getFeedbackProducts: async (req, res) => {
    try {
      const params = req.allParams();

      let allProducts = await Product.find({
        approval_status: params.approval_status,
        deletedAt: null
      }).limit(params.limit).sort([
        {rating: 'DESC'},
        {frontend_position: 'ASC'},
        {updatedAt: 'DESC'},
      ]);

      return res.status(200).json({
        success: true,
        message: 'Successfully fetched all Feedback products',
        data: allProducts
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error while fetching all Feedback products',
        error
      });
    }
  },

  getTopSellProducts: async (req, res) => {
    try {
      const orderNativeQuery = Promise.promisify(Order.getDatastore().sendNativeQuery);

      let rawSelect = `
            SELECT
                 products.id as id,
                 products.promotion as promotion,
                 products.image as image,
                 products.promo_price as promo_price,
                 products.price as price,
                 products.name as name,
                 subOrderItems.product_id as productId,
                 SUM (subOrderItems.product_quantity) as total_quantity`;

      let fromSQL = ' FROM product_suborder_items as subOrderItems';
      fromSQL += ' LEFT JOIN product_suborders as subOrders ON subOrderItems.product_suborder_id = subOrders.id ';
      fromSQL += ' LEFT JOIN products as products ON products.id = subOrderItems.product_id ';
      fromSQL += ' LEFT JOIN warehouses as warehouse ON warehouse.id = products.warehouse_id ';

      let _where = `
          WHERE subOrders.status <> ${SUB_ORDER_STATUSES.canceled}
          AND subOrders.deleted_at IS NULL
          AND subOrderItems.deleted_at IS NULL
          AND products.deleted_at IS NULL
          AND warehouse.deleted_at IS NULL
          AND warehouse.status = 2
          AND products.approval_status = 2
        `;
      _where += ' GROUP BY productId ORDER BY total_quantity DESC ';

      const rawResult = await orderNativeQuery(rawSelect + fromSQL + _where);

      return res.status(200).json({
        success: true,
        message: 'Successfully fetched all sold products with Top Sell Order',
        data: rawResult.rows
      });

    } catch (error) {
      console.log(error);
      return res.status(200).json({
        success: false,
        message: 'Error while fetching products'
      });
    }
  },

  getNewProducts: async (req, res) => {
    try {
      const params = req.allParams();

      const productNativeQuery = Promise.promisify(Product.getDatastore().sendNativeQuery);
      let rawSelect = `
      SELECT
          products.id as id,
          products.code  as code,
          products.name as name,
          products.price,
          products.vendor_price as vendor_price,
          products.image as image,
          products.category_id  as category_id ,
          products.subcategory_id  as subcategory_id ,
          products.type_id   as type_id  ,
          products.brand_id    as brand_id   ,
          products.quantity as quantity,
          products.promotion as promotion,
          products.promo_price as promo_price,
          products.warehouse_id
      `;
      let fromSQL = ' FROM products  ';
      fromSQL += ' LEFT JOIN warehouses as warehouse ON warehouse.id = products.warehouse_id    ';
      let _where = ` WHERE  products.approval_status = ${params.approval_status}  AND  products.deleted_at IS NULL  AND
         warehouse.status = 2  AND  warehouse.deleted_at IS NULL ORDER BY products.created_at DESC,  products.frontend_position ASC,  products.updated_at DESC  LIMIT 4 `;

      const rawResult = await productNativeQuery(rawSelect + fromSQL + _where, []);

      return res.status(200).json({
        success: true,
        message: 'Successfully fetched all Feedback products',
        data: rawResult.rows
      });
    } catch (error) {
      console.log('Error is: ', error);
    }
  },

  /*Method called for saving review and ratings of a product by a user*/
  saveRating: async (req, res) => {
    try {
      if (req.query.userId) {
        const rating = await ProductRatingReview.create({
          user_id: req.query.userId,
          product_id: req.query.product_id,
          rating: parseFloat(req.query.rating),
          review: req.query.review,
        }).fetch();

        return res.status(201).json({
          success: true,
          message: 'Rating submitted successfully',
          rating
        });
      }

    } catch (error) {
      console.log('error: ', error);
      let message = 'Error in saving user rating';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },

  /*Method called for saving questions related to a product by a user*/
  saveQuestion: async (req, res) => {

    try {
      if (req.query.userId) {
        const question = await ProductQuestionAnswer.create({
          user_id: req.query.userId,
          product_id: req.query.product_id,
          question: req.query.question,
          answer: 'Not responded yet'
        }).fetch();
        return res.status(201).json(question);
      }

    } catch (error) {
      console.log('error: ', error);
      let message = 'Error in saving user question';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },

  /*Method called to decide whether a user can rate a product or not*/
  /*route: product/canRateProduct*/
  canRateProduct: async (req, res) => {
    try {
      if (req.query.userID) {
        let rawSQL = `
            SELECT
                cart_items.id
            FROM
                cart_items
            LEFT JOIN product_orders ON product_orders.cart_id = cart_items.cart_id
            LEFT JOIN users ON users.id = product_orders.user_id
            WHERE
                cart_items.product_id = ${req.query.productID} AND users.id = ${req.query.userID} AND product_orders.status = 11
        `;

        const canRateProduct = await sails.sendNativeQuery(rawSQL, []);

        return res.status(200).json({
          success: true,
          canRateProduct: canRateProduct.rows,
          message: 'User can rate the product, data received'
        });
      }

    } catch (error) {
      console.log('error: ', error);
      let message = 'Error in canRateProduct api call';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
};

