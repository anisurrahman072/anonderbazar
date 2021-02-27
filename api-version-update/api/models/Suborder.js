/**
 * Suborder.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    product_order_id: {
      model: 'order',
      required: true
    },
    warehouse_id: {
      model: 'warehouse',
      required: true
    },
    total_quantity: {
      type: 'number',
      columnType: 'integer',
      required: true,
    },
    total_price: {
      type: 'number',
      columnType: 'decimal',
      required: true,
    },
    delivery_date: {
      type: 'ref',
      columnType: 'date',
      required: false
    },
    suborderItems: {
      collection: 'suborderItem',
      via: 'product_suborder_id'
    },
    couponProductCodes: {
      collection: 'productPurchasedCouponCode',
      via: 'suborder_id'
    },
    courier_status: {
      type: 'number',
      columnType: 'integer',
      defaultsTo: 0
    },
    PR_status: {
      type: 'number',
      columnType: 'integer',
      allowNull: true,
      defaultsTo: 0
    },
    status: {
      type: 'number',
      columnType: 'integer',
      allowNull: true,
      defaultsTo: 1
    },
    changed_by: {
      model: 'user'
    },
    date: {
      type: 'ref',
      columnType: 'datetime',
      required: false
    },
  },
  tableName: 'product_suborders',
  customToJSON: function () {
    return this;
  }
};

