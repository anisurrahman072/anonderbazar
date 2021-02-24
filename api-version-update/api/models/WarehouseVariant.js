/**
 * WarehouseVariant.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
/*    id: {
      type: 'integer',
      primaryKey: true,
      unique: true,
      autoIncrement: true
    },*/
    variant_id: {
      model: 'variant',
      required: true
    },
    warehouse_id: {
      model: 'warehouse',
      required: true
    },
    name: {
      type: 'string',
      required: true
    },
    quantity: {
      type: 'float',
      required: false
    },
    unit_price: {
      type: 'float',
      required: false,
      defaultsTo: 0
    },
    unit_name: {
      type: 'string',
      required: false
    },
    image: {
      type: 'string',
      required: false
    },
    brand_id: {
      model: 'brand'
    },
    rack: {
      type: 'string',
      required: false
    },

  },
  tableName: 'warehouses_variants',
/*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true*/
};
