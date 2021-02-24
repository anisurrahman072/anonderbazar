/**
 * CartItem.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    /*    id: {
      type: 'integer',
      primaryKey: true,
      unique: true,
      autoIncrement: true
    },*/
    cart_id: {
      model: 'cart'
    },
    product_id: {
      model: 'product'
    },
    product_unit_price: {
      type: 'float'
    },
    product_quantity: {
      type: 'float'
    },
    product_total_price: {
      type: 'float'
    },
    cart_item_variants: {
      collection: 'cartItemVariant',
      via: 'cart_item_id'
    },
    /*    createdAt: {
      type: 'datetime',
      columnName: 'created_at',
      defaultsTo: function () {
        return new Date();
      }
    },
    updatedAt: {
      type: 'datetime',
      columnName: 'updated_at',
      defaultsTo: function () {
        return new Date();
      }
    },
    deletedAt: {
      type: 'datetime',
      columnName: 'deleted_at',
      defaultsTo: null
    }*/
  },
  tableName: 'cart_items',
  /*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true,*/

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

