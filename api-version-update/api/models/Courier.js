/**
 * Courier.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string',
      columnType: 'text',
      required: true,
    },
    origin_type: {
      type: 'number',
      columnType: 'integer',
      required: false,
      allowNull: true
    },
  },
  tableName: 'courier',
/*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true,*/
};

