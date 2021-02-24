/**
 * CartItemVariant.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    cart_item_id: {
      model: 'cartItem',
      required: true
    },
    variant_id: {
      model: 'variant',
      required: false,
    },
    product_id: {
      model: 'product',
      required: true
    },
    warehouse_variant_id: {
      model: 'WarehouseVariant',
      required: true
    },
    product_variant_id: {
      model: 'ProductVariant',
      required: false
    },
  },
  tableName: 'cart_items_variants',
  /*  autoCreatedAt: true,
    autoUpdatedAt: true,
    autoDeletedAt: true*/
};

