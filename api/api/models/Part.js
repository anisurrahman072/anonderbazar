/**
 * Part.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */


module.exports = {

  attributes: {
    id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: 'string',
      required: true,
    },
    type_id: {
      model: 'Category',
    },
    category_id: {
      model: 'Category',
    },
    subcategory_id: {
      model: 'Category',
    },
    image: {
      type: 'string'
    },
    details: {
      type: 'string'
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
    },
  },
  tableName: "parts",
  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true,

};
