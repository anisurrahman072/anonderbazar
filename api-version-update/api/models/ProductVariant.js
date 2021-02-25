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
      columnType: 'varchar',
      required: true
    },
    quantity: {
      type: 'number',
      columnType: 'integer',
      required: false,
      allowNull: true
    },
  },
  tableName: 'product_variants',
};

