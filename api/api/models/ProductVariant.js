/**
 * ProductVariant.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var algoliasearch = require('algoliasearch');
var client = algoliasearch('BI1ZMP4LVX', '9b25e2784cdf1d97cb3e7ef310940172');
var index = client.initIndex('bitspeck.bitcommerce');

module.exports = {

    attributes: {
        id: {
            type: 'integer',
            primaryKey: true,
            unique: true,
            autoIncrement: true
        },
        product_id: {
            model: 'product',
            required: true,
        },
        variant_id: {
            model: 'variant',
            required: true,
        },
        warehouses_variant_id: {
            model: 'warehouseVariant',
        },
        name: {
            type: 'string',

        },
        quantity: {
            type: 'integer',
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
        },
    },
    tableName: "product_variants",
    autoCreatedAt: true,
    autoUpdatedAt: true,
    autoDeletedAt: true,
};

