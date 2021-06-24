/**
 * Variant.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string',
      columnType: 'varchar',
      required: true
    },
    type: {
      type: 'number',
      columnType: 'integer',
      required: true
    },
    warehouseVariants: {
      collection: 'warehouseVariant',
      via: 'variant_id'
    }
  },
  tableName: 'variants',
};

