/**
 * CouponLotteryPrize.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    name: {
      type: 'string',
      columnType: 'varchar',
      required: true
    },
    place: {
      type: 'number',
      columnType: 'integer',
      required: true
    },
    image: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true,
    },
    coupon_lottery_id: {
      model: 'couponLottery',
    },
    row_status: {
      type: 'number',
      columnType: 'integer',
      required: false,
      defaultsTo: 1
    },
  },
  tableName: 'coupon_lottery_prizes',
};
