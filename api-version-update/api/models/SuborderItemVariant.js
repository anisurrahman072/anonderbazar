/**
 * SuborderItemVariant.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    /*    id: {
      type: 'integer',
      primaryKey: true,
      unique: true,
      autoIncrement: true
    },*/
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
    },
    /*    createdAt: {
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
    }*/
  },
  tableName: 'product_suborder_item_variants',
/*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true*/
};

