/**
 * Investor.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    first_name: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    last_name: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    investor_code: {
      type: 'string',
      columnType: 'varchar',
      allowNull: true
    },
    phone: {
      type: 'string',
      columnType: 'varchar',
      required: true
    },
    email: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    status: {
      type: 'number',
      columnType: 'integer',
      required: false,
      defaultsTo: 1
    },
  },
  tableName: 'investors'
};

