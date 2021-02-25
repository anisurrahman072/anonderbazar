/**
 * ProductPurchasedCouponCode.js
 *
 * @description ::  sldksl
 * @docs  :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    product_id: {
      model: 'product'
    },
    order_id: {
      model: 'order'
    },
    suborder_id: {
      model: 'suborder'
    },
    suborder_item_id: {
      model: 'suborderItem'
    },
    user_id: {
      model: 'product'
    },
  },
  tableName: 'product_purchased_coupon_codes',
};
