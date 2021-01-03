/**
 * Brand.js
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
    product_id: {
      model: 'product',
      required: true
    },
    combination: {
      type: 'json',
      defaultsTo: []
    },
    warehouse_id: {
      model: 'warehouse',
      required: true
    },
    images: {
      type: 'json',
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
  tableName: "design_images",
  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true,

  // generating slug from name before creating a row
  beforeCreate: function (req, next) {

    next();
  },

  // generating slug from name before updating a row
  beforeUpdate: function (req, next) {

    next();
  }
};

