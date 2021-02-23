/**
 * SuborderItem.js
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
      type: 'integer',
      required: true
    },
    product_total_price: {
      type: 'float',
      required: true
    },
    date: {
      type: 'datetime',
    },
    suborderItemVariants: {
      collection: 'suborderItemVariant',
      via: 'product_suborder_item_id'
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
  tableName: "product_suborder_items",
/*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true*/
};

