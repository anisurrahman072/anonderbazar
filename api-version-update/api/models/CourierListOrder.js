/**
 * CourierListOrder.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    order_id: {
      model: 'order',
      required: true
    },
    courier_id: {
      model: 'courier',
      required: true
    },
    courier_price_id: {
      model: 'courierprice',
      required: true
    },
    destination: {
      type: 'string',
      columnType: 'text',
      required: true,
    },
    shipping_date: {
      type: 'string',
      columnType: 'datetime',
      required: true,
    },
    arrival_date: {
      type: 'string',
      columnType: 'datetime',
      required: true,
    },
    status: {
      type: 'number',
      columnType: 'integer',
      required: true
    },
  },
  tableName: 'courier_order_list',
  /*  autoCreatedAt: true,
    autoUpdatedAt: true,
    autoDeletedAt: true,*/
};

