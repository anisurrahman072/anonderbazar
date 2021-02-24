/**
 * CartItem.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    cart_id: {
      model: 'cart',
      required: true,
    },
    product_id: {
      model: 'product',
      required: true
    },
    product_unit_price: {
      type: 'number',
      columnType: 'float',
      allowNull: true
    },
    product_quantity: {
      type: 'number',
      columnType: 'float',
      required: true
    },
    product_total_price: {
      type: 'number',
      columnType: 'float',
      required: true,
    },
    cart_item_variants: {
      collection: 'cartItemVariant',
      via: 'cart_item_id'
    },
  },
  tableName: 'cart_items',

  // generating slug from name before creating a row
  beforeCreate: function (req, next) {
    let unit_price = req.product_total_price / req.product_quantity;
    req.product_unit_price = unit_price;
    next();
  },

  // // generating slug from name before creating a row
  afterCreate: function (req, next) {

    Cart.find(req.cart_id).exec((err, cart) => {
      if (err) {
        return next(err);
      }
      var requestPayload = [];
      requestPayload.push({
        'total_price': cart[0].total_price + req.product_total_price,
        'total_quantity': cart[0].total_quantity + req.product_quantity,
      });

      Cart.update({id: req.cart_id}, requestPayload[0]).exec((err, cart) => {
        if (err) {
          return next(err);
        }
        return next();
      });
    });

  },
};

