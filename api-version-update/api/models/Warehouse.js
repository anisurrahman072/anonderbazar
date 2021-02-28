/**
 * Warehouse.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    buffer_time: {
      type: 'number',
      columnType: 'integer',
      required: false,
      allowNull: true
    },
    code: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    name: {
      type: 'string',
      columnType: 'varchar',
      required: true
    },
    employee_count: {
      type: 'number',
      columnType: 'integer',
      required: false,
      allowNull: true
    },
    license_no: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    tin_no: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    vat_no: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    address: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    upazila_id: {
      model: 'area',
      required: true
    },
    zila_id: {
      model: 'area',
      required: true
    },
    division_id: {
      model: 'area',
      required: true
    },
    postal_code: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    country: {
      type: 'string',
      columnType: 'varchar',
      required: false,
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
      required: true
    },
    invoice_footer: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true
    },
    logo: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    award_points: {
      type: 'number',
      columnType: 'integer',
      required: false,
      defaultsTo: 0
    },
    status: {
      type: 'number',
      columnType: 'integer',
      defaultsTo: 0
    },
    user: {
      collection: 'User',
      via: 'warehouse_id'
    },
  },
  tableName: 'warehouses',
};
