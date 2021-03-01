/**
 * WarehouseVariant.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
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
      columnType: 'varchar',
      required: true
    },
    quantity: {
      type: 'number',
      columnType: 'decimal',
      required: false,
      defaultsTo: 0
    },
    unit_price: {
      type: 'number',
      columnType: 'decimal',
      required: false,
      defaultsTo: 0
    },
    unit_name: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    image: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true,
    },
    brand_id: {
      model: 'brand',
      required: true
    },
    rack: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },

  },
  tableName: 'warehouses_variants',
/*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true*/
};
