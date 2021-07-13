/**
 * InvestorOTP.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    phone: {
      type: 'string',
      columnType: 'varchar',
      required: true
    },
    otp: {
      type: 'string',
      columnType: 'varchar',
      allowNull: true
    },
    status: {
      type: 'number',
      defaultsTo: 1,
      columnType: 'tinyint'
    }
  },

  tableName: 'investors_otp'
};

