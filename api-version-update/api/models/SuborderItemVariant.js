/**
 * SuborderItemVariant.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    product_suborder_item_id: {
      model: 'suborderItem',
      required: true
    },
    product_id: {
      model: 'product',
      required: true
    },
    variant_id: {
      model: 'variant',
      required: true
    },
    warehouse_variant_id: {
      model: 'warehouseVariant',
      required: true
    },
    product_variant_id: {
      model: 'ProductVariant'
    }
  },
  tableName: 'product_suborder_item_variants',
};

