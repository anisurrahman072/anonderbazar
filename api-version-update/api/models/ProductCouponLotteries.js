/**
 * ProductCouponLotteriesController.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string',
      columnType: 'varchar',
      required: true
    },
    image: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true
    },
    winner_id: {
      model: 'user'
    },
    coupon_id: {
      model: 'productPurchasedCouponCode'
    }
  },
  tableName: 'product_coupon_lotteries',

};

