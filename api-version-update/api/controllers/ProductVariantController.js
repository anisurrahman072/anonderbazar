/**
 * ProductVariantController
 *
 * @description :: Server-side logic for managing productvariants
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const _ = require('lodash');
const async = require('async');
const {performance} = require('perf_hooks');

module.exports = {
  //Method called for deleting a product variant
  //Model models/ProductVariant.js
  destroy: async (req, res) => {
    try {
      const time1 = performance.now();

      const productVariant = await ProductVariant.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(productVariant);
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      let message = 'Error in Get All category with pagination';
      return res.status(400).json({
        success: false,
        message,
        error
      });
    }

  },
  //Method called for creating a product variant
  //Model models/ProductVariant.js
  create: async (req, res) => {

    try {
      const time1 = performance.now();

      // eslint-disable-next-line eqeqeq
      if (req.body.variant_type == 0) {

        let body = {
          product_id: req.body.product_id,
          variant_id: req.body.variant_id,
          name: req.body.name,
          quantity: 0,
          warehouses_variant_id: req.body.warehouses_variant_id
        };
        const productVariant = await ProductVariant.create(body).fetch();

        const time2 = performance.now();
        sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

        return res.json(200, productVariant);
      } else {
        const productVariant = await ProductVariant.create(req.body).fetch();
        const time2 = performance.now();
        sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

        return res.json(200, productVariant);
      }
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      let message = '';
      return res.status(400).json({
        success: false,
        message,
        error
      });
    }
    // eslint-disable-next-line eqeqeq

  },

  //Method called for getting a  variant by product
  //Model models/ProductVariant.js
  byvariant: async (req, res) => {
    if (!req.param('product_id')) {
      return res.json({status: 400, error: 'no product provided'});
    }

    try {
      const time1 = performance.now();

      const productVariants = await ProductVariant.find({product_id: req.param('product_id'), deletedAt: null})
        .populate(['variant_id', 'warehouses_variant_id']);

      if (!(productVariants && productVariants.length > 0)) {
        return res.json([]);
      }

      let variants = _.uniq(_.map(productVariants, 'variant_id.id'));
      let data = [];
      async.each(variants, (v, callback) => {
        // eslint-disable-next-line eqeqeq
        const dd = productVariants.filter(pv => pv.variant_id.id == v);
        data.push({
          variant: dd[0].variant_id,
          warehouse_variants: dd
        });
        callback();
      }, (error) => {

        if (error) {
          return res.negotiate(error);
        }
        const time2 = performance.now();
        sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

        return res.ok(data);
      });
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      let message = '';
      return res.status(400).json({
        success: false,
        message,
        error
      });
    }
  }
};

