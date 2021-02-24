/**
 * ProductVariantController
 *
 * @description :: Server-side logic for managing productvariants
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const _ = require('lodash');

module.exports = {
  //Method called for deleting a product variant
  //Model models/ProductVariant.js
  destroy: function (req, res) {
    ProductVariant.update({id: req.param('id')}, {deletedAt: new Date()})
          .exec((err, user) => {
            if (err) {return res.json(err, 400);}
            return res.json(user[0]);
          });
  },
  //Method called for creating a product variant
  //Model models/ProductVariant.js
  create: function (req, res) {


    if (req.body.variant_type == 0) {
      var ar = [];
      var name= req.body.name;
      var i=0;
      var body={
        product_id: req.body.product_id,
        variant_id: req.body.variant_id,
        name: req.body.name,
        quantity: 0,
        warehouses_variant_id: req.body.warehouses_variant_id
      };
      ProductVariant.create(body).exec((err, productVariant) => {
        if (err) {
          return res.json(err.status, {err: err});
        }
        if (productVariant) {
          res.json(200, productVariant);
        }
      });
    } else {
      ProductVariant.create(req.body).exec((err, productVariant) => {
        if (err) {
          return res.json(err.status, {err: err});
        }
        if (productVariant) {
          res.json(200, productVariant);
        }
      });
    }
  },

  //Method called for getting a  variant by product
  //Model models/ProductVariant.js
  byvariant: function (req, res) {
    if (!req.param('product_id')) {
      return res.json({status: 400, error: 'no product provided'});
    }

    ProductVariant.find({product_id: req.param('product_id'), deletedAt: null})
          .populate(['variant_id', 'warehouses_variant_id'])
          .exec((err, productVariants) => {

            let variants = _.uniq(_.map(productVariants, 'variant_id.id'));


            let data = [];
            async.each(variants, (v, callback) => {
              var dd = productVariants.filter(pv => pv.variant_id.id == v);
              data.push({
                variant: dd[0].variant_id,
                warehouse_variants: dd
              });
              callback();
            }, (error) => {

              if (error) {return res.negotiate(error);}
              return res.ok(data);
            });
          });
  }
};

