import {
  asyncForEach,
  initLogPlaceholder,
} from "../../libs";
import {imageUploadConfig} from "../../libs/helper";

const fs = require('fs');

module.exports = {
  //Method called for getting a product data
  //Model models/Product.js

  findOne: async (req, res) => {
    try {
      res
        .status(200)
        .json(
          await Product.findOne(req.params.id)
            .populate("product_images", {deletedAt: null})
            .populate("product_variants", {deletedAt: null})
            .populate("category_id", {deletedAt: null})
            .populate("subcategory_id", {deletedAt: null})
            .populate("type_id", {deletedAt: null})
            .populate("warehouse_id", {deletedAt: null})
            .populate("craftsman_id", {deletedAt: null})
            .populate("brand_id", {deletedAt: null})
        );
    } catch (error) {
      let message = "Error in Geting the product";
      res.status(400).json({
        success: false,
      });
    }
  },
  //Method called for deleting a product data
  //Model models/Product.js
  destroy: function (req, res) {
    Product.update({id: req.param("id")}, {deletedAt: new Date()}).exec(
      function (err, user) {
        if (err) return res.json(err, 400);
        return res.json(user[0]);
      }
    );
  },
  //Method called for finding product max price data
  //Model models/Product.js
  maxPrice: function (req, res) {
    Product.query(`SELECT MAX(price) as max FROM products WHERE approval_status = 2`, function (
      err,
      rawResult
    ) {
      if (err) {
        return res.serverError(err);
      }
      return res.ok(rawResult[0]);
    });
  },
  //Method called for finding product min price data
  //Model models/Product.js
  minPrice: function (req, res) {
    Product.query(`SELECT MIN(price) as min FROM products WHERE approval_status = 2`, function (
      err,
      rawResult
    ) {
      if (err) {
        return res.serverError(err);
      }
      return res.ok(rawResult[0]);
    });
  },
  //Method called for creating a product data
  //Model models/Product.js,models/ProductImage.js
  create: async function (req, res) {
    try {
      req.body.price = parseFloat(req.body.price); //parseFloat(req.body.craftsman_price) + parseFloat((req.body.craftsman_price * 0.1));
      var imageCounter = parseInt(req.body.imageCounter);
      var i = 0;
      if (req.body.hasImageFront === 'true') {

        req.file("frontimage").upload(imageUploadConfig(), async function (err, uploaded) {
          if (err) {
            console.log(err)
            return res.json(err.status, {err: err});
          }

          if (uploaded.length === 0) {
            return res.badRequest('No file was uploaded');
          }

          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];

          const body = req.body;
          body.image = '/' + newPath;

          if (body.brand_id === '' || body.brand_id === 'undefined') {
            body.brand_id = null
          }
          if (body.tag === '' || body.tag === 'undefined') {
            body.tag = null
          }

          console.log('request body: ', body)

          /*          fs.copyFile(sails.config.appPath + "/.tmp/public/images/" + newPath, sails.config.appPath + "/assets/images/" + newPath, (err) => {
                      if (err) throw err;
                      console.log(`${newPath} was copied to assets dir`);
                    });*/

          const product = await Product.create(body);

          if (req.body.ImageBlukArray) {
            let imagearraybulk = JSON.parse("[" + req.body.ImageBlukArray + "]");
            for (i = 0; i < imagearraybulk.length; i++) {
              console.log('bulk image: ', imagearraybulk[i])
              await ProductImage.update(imagearraybulk[i], {product_id: product.id});
            }
            return res.json(200, product);
          } else {
            return res.json(200, product);
          }
        });
      } else {
        req.body.price = parseFloat(req.body.price); // parseFloat(req.body.craftsman_price) + parseFloat((req.body.craftsman_price * 0.1));
        let body = req.body;
        if (body.brand_id === '' || body.brand_id === 'undefined') {
          body.brand_id = null
        }
        if (body.tag === '' || body.tag === 'undefined') {
          body.tag = null
        }

        let product = await Product.create(body);

        if (req.body.ImageBlukArray) {
          var imagearraybulk = JSON.parse("[" + req.body.ImageBlukArray + "]");
          for (i = 0; i < imagearraybulk.length; i++) {
            if (i === 0) {
              var productimage = ProductImage.findOne(product.id);
              await product.update(product.id, {image: productimage.image_path});
            }
            await ProductImage.update(imagearraybulk[i], {product_id: product.id});
          }
        }
        return res.json(200, product);
      }
    } catch (err) {
      res.json(400, {message: "wrong"});
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

      let imageCounter = parseInt(req.body.imageCounter);
      let i = 0;
      if (req.body.hasImageFront === 'true') {
        req.file("frontimage").upload(imageUploadConfig(), async function (err, uploaded) {
          if (err) {
            return res.json(err.status, {err: err});
          }
          if (err) return res.serverError(err);
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];

          let body = req.body;
          if (body.brand_id === '' || body.brand_id === 'undefined') {
            body.brand_id = null
          }
          if (body.tag === '' || body.tag === 'undefined') {
            body.tag = null
          }
          console.log('request body: ', body)

          /*          fs.copyFile(sails.config.appPath + "/.tmp/public/images/" + newPath, sails.config.appPath + "/assets/images/" + newPath, (err) => {
                      if (err) throw err;
                      console.log(`${newPath} was copied to assets dir`);
                    });*/

          body.image = '/' + newPath;
          let product = await Product.update({id: req.param("id")}, body);
          return res.json(200, product);
        });
      } else {
        let body = req.body;
        if (body.brand_id === '' || body.brand_id === 'undefined') {
          body.brand_id = null
        }
        if (body.tag === '' || body.tag === 'undefined') {
          body.tag = null
        }
        let product = await Product.update({id: req.param("id")}, body);
        return res.json(200, product);
      }
    } catch (err) {
      console.log(err);
      res.json(400, {message: "Something went wrong!"});
    }
  },
  //Method called for uploading product images
  //Model models/ProductImage.js
  upload: async function (req, res) {
    try {
      if (req.body.hasImage === "true" && req.body.product_id) {
        req.file("image").upload(imageUploadConfig(), async function (err, uploaded) {
          if (err) {
            return res.json(err.status, {err: err});
          }

          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
          console.log('uploaded-newPath', newPath)
          /*
                    fs.copyFile(sails.config.appPath + "/.tmp/public/images/" + newPath, sails.config.appPath + "/assets/images/" + newPath, (err) => {
                                if (err) throw err;
                                console.log(`${newPath} was copied to assets dir`);
                    });
          */

          const product = await ProductImage.create({
            product_id: req.body.product_id,
            image_path: '/' + newPath,
            created_at: new Date(),
          });
          return res.json(200, product);
        });
      } else if (req.body.hasImage === "true") {
        req.file("image").upload(imageUploadConfig(), async function (err, uploaded) {

          if (err) {
            return res.json(err.status, {err: err});
          }
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
          console.log('uploaded-newPath', newPath)
          /*          fs.copyFile(sails.config.appPath + "/.tmp/public/images/" + newPath, sails.config.appPath + "/assets/images/" + newPath, (err) => {
                      if (err) throw err;
                      console.log(`${newPath} was copied to assets dir`);
                    });
          */

          const product = await ProductImage.create({
            product_id: null,
            image_path: '/' + newPath,
            created_at: new Date(),
          });
          return res.json(200, product);
        });

      } else if (req.body.id) {
        ProductImage.update({id: req.body.id}, {deletedAt: new Date()}).exec(function (err, product) {
          if (err) return res.json(err, 400);
          return res.json(product[0]);
        });
      } else {
        res.json(400, {message: "wrong"});
      }
    } catch (err) {
      res.json(400, {message: "wrong"});
    }
  },
  //Method called for getting a product available date
  //Model models/Product.js
  getAvailableDate: async function (req, res) {
    initLogPlaceholder(req, "getAvailableDate");
    try {
      function randomDate(start, end) {
        return new Date(
          start.getTime() + Math.random() * (end.getTime() - start.getTime())
        );
      }

      let product = req.param("product");
      let productQuantity = req.param("quantity");
      let produceTimeMin = product.produce_time;
      let craftsmanId = product.craftsman_id.id;

      let craftmanSchedule = await CraftmanSchedule.findOne({
        craftman_id: craftsmanId,
        deletedAt: null,
      });
      if (craftmanSchedule && craftmanSchedule.end_time != null) {
        let existingCraftsTime =
          craftmanSchedule.end_time.getTime() -
          craftmanSchedule.start_time.getTime();
        var _time_milli =
          ((produceTimeMin * productQuantity) / 60 / 8) * 84300000;
        var newDateObj = new Date(craftmanSchedule.end_time).setMilliseconds(
          ((produceTimeMin * productQuantity) / 60 / 8) * 86400000
        );
        return res.json({date: newDateObj, miliseconds: _time_milli});
      } else {
        var _time = new Date();
        var _time_milli =
          ((produceTimeMin * productQuantity) / 60 / 8) * 84300000;
        var total_time = _time.getTime() + _time_milli + 84300000;
        var newDateObj = new Date(total_time);
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
        sort: "updated_at DESC",
      });

      await asyncForEach(categories, async (_category) => {
        _category.products = await Product.find({
          where: {type_id: _category.id, deletedAt: null, approval_status: 2},
          limit: 5,
          sort: "updated_at DESC",
        });
      });

      res.status(200).json({
        success: true,
        message: "product type  with Product",
        data: categories,
      });
    } catch (error) {

      res.status(400).json({
        success: false,
        message: "",
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
        function (err, rawResult) {
          if (err) {
            res.status(400).json({
              success: false,
              message: "",
              err,
            });
          }
          res.status(200).json({
            success: true,
            message: "product type  with Product",
            data: rawResult,
          });
        }
      );
    } catch (error) {

      res.status(400).json({
        success: false,
        message: "",
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
        function (err, rawResult) {
          if (err) {
            res.status(400).json({
              success: false,
              message: "",
              err,
            });
          }
          res.status(200).json({
            success: true,
            message: "product type  with Product",
            data: rawResult,
          });
        }
      );
    } catch (error) {

      res.status(400).json({
        success: false,
        message: "",
        error,
      });
    }
  },

};
