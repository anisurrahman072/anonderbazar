/**
 * Warehouse.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    attributes: {
        id: {
            type: 'integer',
            primaryKey: true,
            unique: true,
            autoIncrement: true
        },
        buffer_time: {
            type: 'integer',
        },
        code: {
            type: 'string',
            required: false
        },
        name: {
            type: 'string',
            required: true
        },
        employee_count:{
          type: 'integer',
          required: false
        },
        license_no: {
            type: 'string',
            required: false
        },
        tin_no: {
            type: 'string',
            required: false
        },
        vat_no: {
            type: 'string',
            required: false
        },
        address: {
            type: 'string',
            required: true
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
            required: true
        },
        country: {
            type: 'string',
            required: true
        },
        phone: {
            type: 'string',
            required: true
        },
        email: {
            type: 'string',
            required: true
        },
        invoice_footer: {
            type: 'text'
        },
        logo: {
            type: 'string'
        },
        award_points: {
            type: 'integer',
            defaultsTo: 0
        },
        status: {
            type: 'integer',
            defaultsTo: 0
        },
        user: {
            collection: 'User',
            via: 'warehouse_id'
        },
        createdAt: {
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
        }
    },
    tableName: 'warehouses',
    autoCreatedAt: true,
    autoUpdatedAt: true,
    autoDeletedAt: true
};
