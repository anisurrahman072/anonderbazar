/**
 * Product Design.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */


module.exports = {

  attributes: {
    /*    id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: true
    },*/
    type_id: {
      model: 'category',
      required: true
    },
    category_id: {
      model: 'category',
      required: true
    },
    subcategory_id: {
      model: 'category',
      required: true
    },
    product_id: {
      model: 'product',
      required: true
    },
    part_id: {
      model: 'part',
      required: true
    },
    design_category_id: {
      model: 'designCategory',
      required: true
    },
    design_subcategory_id: {
      model: 'designCategory',
    },
    design_id: {
      model: 'design',
      required: true
    },
    genre_id: {
      model: 'genre',
      required: true
    },
    warehouse_id: {
      model: 'warehouse',
      required: true
    },
    price: {
      type: 'float'
    },
    comment: {
      type: 'string'
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
    },*/
  },
  tableName: 'product_designs',
  /*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true,*/

};