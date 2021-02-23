/**
 * Order.js
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
    user_id: {
      model: 'user',
      required: true
    },
    cart_id: {
      model: 'cart',
      required: true
    },
    billing_address: {
      model: 'paymentaddress'
    },
    shipping_address: {
      model: 'paymentaddress'
    },
    suborders: {
      collection: 'suborder',
      via: 'product_order_id'
    },
    couponProductCodes: {
      collection: 'productPurchasedCouponCode',
      via: 'order_id'
    },
    payment: {
        collection: 'payment',
        via: 'order_id'
    },
    total_quantity: {
      type: 'integer',
      defaultsTo: 0
    },
    total_price: {
      type: 'float',
      defaultsTo: 0
    },
    type: {
      type: 'integer',
    },
    ssl_transaction_id: {
      type: 'string',
    },
    changed_by: {
      model: 'user'
    },
    status: {
      type: 'integer',
      required: true
    },
    courier_status: {
      type: 'integer',
      defaultsTo: 0
    },
    courier_charge: {
      type: 'float',
      defaultsTo: 0
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
    },*/

  },
  tableName: "product_orders",
  customToJSON: function () {
    return this.toObject();
  }
/*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true*/
};

