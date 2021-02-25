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
      defaultsTo: 0
    },
    total_price: {
      type: 'float',

      defaultsTo: 0
    },
    delivery_date: {
      type: 'string', columnType: 'date',
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
      type: 'integer',
    },
    PR_status: {
      type: 'integer',
    },
    status: {
      type: 'integer',
    },
    changed_by: {
      model: 'user'
    },
    date: {
      type: 'string', columnType: 'datetime',
    },
  },
  tableName: 'product_suborders',
  customToJSON: function () {
    return this.toObject();
  }
};

