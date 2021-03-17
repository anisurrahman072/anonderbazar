/**
 * PaymentTransactionLog.js
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
      required: false,
      allowNull: true
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
  tableName: 'payment_transaction_logs'
};

