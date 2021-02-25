/**
 * CourierPrice.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    courier_id: {
      model: 'courier',
      required: true
    },
    weight: {
      type: 'string',
      columnType: 'text',
      required: true,
    },
    price: {
      type: 'number',
      columnType: 'float',
      required: true
    },
    remarks: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true,
    },
  },
  tableName: 'courier_price',
  /*  autoCreatedAt: true,
    autoUpdatedAt: true,
    autoDeletedAt: true,*/
};

