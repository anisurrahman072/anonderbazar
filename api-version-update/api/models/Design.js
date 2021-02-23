/**
 * Design.js
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
    code: {
      type: 'string'
    },
    name: {
      type: 'string',
      required: true,
    },
    warehouse_id: {
      model: 'warehouse',
      required: true
    },
    image: {
      type: 'string',
    },
    rating: {
      type: 'float'
    },
    design_category_id: {
      type: 'json',
    },
    design_subcategory_id: {
      type: 'json',

    },
    genre_id: {
      type: 'json',
    },
    details: {
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
  tableName: "designs",
/*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true,*/

};
