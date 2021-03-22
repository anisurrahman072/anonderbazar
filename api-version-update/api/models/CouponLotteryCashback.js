/**
 * CouponLotteryCashback.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    user_id: {
      model: 'user',
    },
    amount: {
      type: 'number',
      columnType: 'decimal',
      required: true
    },
    expired_date: {
      type: 'ref',
      columnType: 'datetime',
      required: false
    },
    status: {
      type: 'number',
      columnType: 'integer',
      required: false,
      defaultsTo: 1
    }
  },
  tableName: 'coupon_lottery_cashbacks',
};
