const moment = require('moment');
const {imageUploadConfig, uploadImages} = require('../../libs/helper');
const Promise = require('bluebird');
const {removeCacheForProduct} = require('../../libs/cache-manage');
const {asyncForEach} = require('../../libs/helper');
const {storeToCache} = require('../../libs/cache-manage');
const {fetchFromCache} = require('../../libs/cache-manage');

module.exports = {

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
          deletedAt: null
        });
        return res.status(200).json(products);
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
      if (body.brand_id === '' || body.brand_id === 'undefined') {
        body.brand_id = null;
      }
      if (body.tag === '' || body.tag === 'undefined') {
        body.tag = null;
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

      if(body.start_date){
        body.start_date = moment(body.start_date).format('YYYY-MM-DD');
      }

      if(body.end_date){
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

      res.status(400).json({
        success: false,
        message: '',
        error,
      });
    }
  },

};
