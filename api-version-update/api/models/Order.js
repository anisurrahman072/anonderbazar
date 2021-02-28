/**
 * Order.js
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 **/

module.exports = {

  attributes: {
    user_id: {
      model: 'user',
      required: true
    },
    cart_id: {
      model: 'cart',
      required: true
    },
    billing_address: {
      model: 'paymentaddress',
      required: false
    },
    shipping_address: {
      model: 'paymentaddress',
      required: false
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
      type: 'number',
      columnType: 'integer',
      required: true,
    },
    total_price: {
      type: 'number',
      required: true,
      columnType: 'decimal',
    },
    type: {
      type: 'number',
      columnType: 'integer',
      defaultsTo: 0,
    },
    ssl_transaction_id: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    changed_by: {
      model: 'user',
      required: false,
    },
    status: {
      type: 'number',
      columnType: 'integer',
      required: false,
      defaultsTo: 1,
    },
    courier_status: {
      type: 'number',
      columnType: 'integer',
      defaultsTo: 0
    },
    courier_charge: {
      type: 'number',
      columnType: 'decimal',
      required: false,
      defaultsTo: 0
    },
  },
  tableName: 'product_orders',
  customToJSON: function () {
    return this;
  }
};

