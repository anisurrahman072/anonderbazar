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
      required: false
    },
    name: {
      type: 'string',
      columnType: 'varchar',
      required: true
    },
    employee_count: {
      type: 'number',
      columnType: 'integer',
      required: false
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
      defaultsTo: 0,
      required: true
    },
    user: {
      collection: 'User',
      via: 'warehouse_id'
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
    }*/
  },
  tableName: 'warehouses',
/*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true*/
};
