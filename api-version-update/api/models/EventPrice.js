/**
 * EventPrice.js
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
    price: {
      type: 'number',
      columnType: 'double',
      required: true,
    },
    remarks: {
      type: 'string',
      columnType: 'text',
      required: true,
    },
  },
  tableName: 'event_price',
  /*  autoCreatedAt: true,
    autoUpdatedAt: true,
    autoDeletedAt: true,*/
};

