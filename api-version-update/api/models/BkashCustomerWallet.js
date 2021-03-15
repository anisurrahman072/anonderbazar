/**
 * BkashCustomerWallet.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    user_id: {
      model: 'user',
      required: true,
    },
    wallet_no: {
      type: 'string',
      columnType: 'varchar',
      required: true,
    },
    agreement_id: {
      type: 'string',
      columnType: 'varchar',
      required: true,
    },
    payment_id: {
      type: 'string',
      columnType: 'varchar',
      required: true,
    },
    full_response: {
      type: 'json',
      columnType: 'text',
      required: false,
      allowNull: true,
    },
    /* pending = 1, create_success = 2, execute_success = 3, rejected = 99	 */
    row_status: {
      type: 'number',
      columnType: 'integer',
      isIn: [1, 2, 3, 99],
      defaultsTo: 1
    }
  },
  tableName: 'bkash_customer_wallets',
};

