/**
 * CouponLottery.js
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
    description: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true
    },
    image: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true,
    },
    draw_date: {
      type: 'ref',
      columnType: 'datetime',
      required: false
    },
    status: {
      type: 'number',
      columnType: 'integer',
      required: false,
      defaultsTo: 1
    },
    product_id: {
      model: 'product'
    },
    code: {
      type: 'string',
      columnType: 'varchar',
      required: true,
    },
  },
  tableName: 'coupon_lotteries',
};
