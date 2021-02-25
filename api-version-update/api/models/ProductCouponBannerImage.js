/**
 * ProductCouponBannerImage.js
 *
 * @description ::  sldksl
 * @docs  :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    product_id: {
      model: 'product'
    },
    banner_images: {
      type: 'json',
      columnType: 'text',
      required: false,
      allowNull: true
    },
  },
  tableName: 'product_coupon_banner_images',
};
