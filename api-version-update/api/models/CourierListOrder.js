/**
 * CourierListOrder.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
/*    id: {
      type: 'integer',
      primaryKey: true,
      unique: true,
      autoIncrement: true
    },*/
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
      required: true,
    },
    shipping_date: {
      type: 'string', columnType: 'datetime',
      required: true,
    },
    arrival_date: {
      type: 'string', columnType: 'datetime',
      required: true,
    },
    status: {
      type: 'number',
      columnType: 'integer',
    },
/*    createdAt: {
      type: 'datetime',
      columnName: 'created_at',
      defaultsTo: function () {
        return new Date();
      }
    },
    updatedAt: {
      type: 'datetime',
      columnName: 'updated_at',
      defaultsTo: function () {
        return new Date();
      }
    },
    deletedAt: {
      type: 'datetime',
      columnName: 'deleted_at',
      defaultsTo: null
    },*/
  },
  tableName: "courier_order_list",
/*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true,*/
};

