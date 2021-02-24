/**
 * SuborderItemVariant.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    product_suborder_item_id: {
      model: 'suborderItem'
    },
    product_id: {
      model: 'product'
    },
    variant_id: {
      model: 'variant'
    },
    warehouse_variant_id: {
      model: 'warehouseVariant'
    },
    product_variant_id: {
      model: 'ProductVariant'
    }
  },
  tableName: 'product_suborder_item_variants',
};

