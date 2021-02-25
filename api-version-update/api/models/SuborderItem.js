/**
 * SuborderItem.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    product_suborder_id: {
      model: 'suborder',
      required: true
    },
    product_id: {
      model: 'product',
      required: true
    },
    warehouse_id: {
      model: 'warehouse',
      required: true
    },
    product_quantity: {
      type: 'number',
      columnType: 'integer',
      required: true
    },
    product_total_price: {
      type: 'float',
      columnType: 'decimal',
      required: true
    },
    date: {
      type: 'string',
      columnType: 'datetime',
      required: false,
      allowNull: true
    },
    suborderItemVariants: {
      collection: 'suborderItemVariant',
      via: 'product_suborder_item_id'
    },
  },
  tableName: 'product_suborder_items',
};

