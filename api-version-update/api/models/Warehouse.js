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
      allowNull: true
    },
    license_no: {
      type: 'string',
      columnType: 'varchar',
      required: false
    },
    tin_no: {
      type: 'string',
      columnType: 'varchar',
      required: false
    },
    vat_no: {
      type: 'string',
      columnType: 'varchar',
      required: false
    },
    address: {
      type: 'string',
      columnType: 'varchar',
      required: false
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
      required: false
    },
    country: {
      type: 'string',
      columnType: 'varchar',
      required: false
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
      allowNull: true
    },
    logo: {
      type: 'string',
      columnType: 'varchar',
      allowNull: true
    },
    award_points: {
      type: 'number',
      columnType: 'integer',
      allowNull: true,
      defaultsTo: 0
    },
    status: {
      type: 'number',
      columnType: 'integer',
      required: true
    },
    user: {
      collection: 'User',
      via: 'warehouse_id'
    },
  },
  tableName: 'warehouses',
};
