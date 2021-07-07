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
      type: 'number',
      columnType: 'decimal',
      required: true
    },
    status: {
      type: 'number',
      columnType: 'integer',
      defaultsTo: 1
    },
    date: {
      type: 'ref',
      columnType: 'datetime',
      required: false,
    },
    suborderItemVariants: {
      collection: 'suborderItemVariant',
      via: 'product_suborder_item_id'
    },
    offer_type: {
      type: 'number',
      columnType: 'integer',
    },
    offer_id_number: {
      type: 'number',
      columnType: 'integer'
    }
  },
  tableName: 'product_suborder_items',
};

