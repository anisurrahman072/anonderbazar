/**
 * ProductPurchasedCouponCode.js
 *
 * @description ::  sldksl
 * @docs  :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: true
    },
    product_id: {
      model: 'product',
      required: true
    },
    order_id: {
      model: 'order',
      required: true
    },
    suborder_id: {
      model: 'suborder',
      required: true
    },
    suborder_item_id: {
      model: 'suborderItem',
      required: true
    },
    user_id: {
      model: 'product',
      required: true
    },
    createdAt: {
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
    },
  },
  tableName: "product_purchased_coupon_codes",
  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true
}