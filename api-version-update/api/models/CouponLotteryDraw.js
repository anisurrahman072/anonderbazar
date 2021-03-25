/**
 * CouponLotteryDrawController.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    user_id: {
      model: 'user',
    },
    coupon_lottery_id: {
      model: 'couponLottery',
    },
    coupon_lottery_prize_id: {
      model: 'couponLotteryPrize',
    },
    order_id: {
      model: 'order',
    },
    product_purchased_coupon_code_id: {
      model: 'productPurchasedCouponCode',
    },
    status: {
      type: 'number',
      columnType: 'integer',
      required: false,
      defaultsTo: 1
    },
  },
  tableName: 'coupon_lottery_draws',
};
