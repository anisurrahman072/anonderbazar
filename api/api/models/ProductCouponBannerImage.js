/**
 * ProductCouponBannerImage.js
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
      type: 'integer',
      required: false
    },
    banner_images: {
      type: 'array',
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
  tableName: "product_coupon_banner_images",
  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true
}
