/**
 * Payment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    user_id: {
      model: 'user',
      required: true
    },
    order_id: {
      model: 'order',
      required: true,
    },
    suborder_id: {
      model: 'suborder',
      required: false
    },
    receiver_id: {
      model: 'user',
      required: false
    },
    transection_key: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    transaction_type: {
      type: 'number',
      columnType: 'integer',
      defaultsTo: 1
    },
    details: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true
    },
    payment_type: {
      type: 'string',
      columnType: 'varchar',
      required: true
    },
    payment_amount: {
      type: 'number',
      columnType: 'decimal',
      required: true
    },
    payment_date: {
      type: 'ref',
      columnType: 'datetime',
      required: false,
    },
    status: {
      type: 'number',
      columnType: 'integer',
      required: true
    },
  },
  tableName: 'payments',
  customToJSON: function () {
    return this;
  },
  // generating transection key before creating a row
  /* beforeCreate: function (req, next) {

    let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
    let string_length = 16;
    let randomstring = '';
    for (let i = 0; i < string_length; i++) {
      let rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    req.transection_key = randomstring;

    next();
  },*/
};

