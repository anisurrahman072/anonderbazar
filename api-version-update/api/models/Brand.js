/**
 * Brand.js
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
    warehouse_id: {
      type: 'number',
      columnType: 'integer',
    },
    code: {
      type: 'string'
    },
    name: {
      type: 'string',
      required: true,
    },
    image: {
      type: 'string',
    },
    slug: {
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
  tableName: 'brands',
  /*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true,*/

  // generating slug from name before creating a row
  beforeCreate: function (req, next) {
    if (req.name) {
      var stringForMakingSlug = req.name;
      stringForMakingSlug = stringForMakingSlug.replace(' ', '-');
      stringForMakingSlug = stringForMakingSlug.toLowerCase();
      req.slug = stringForMakingSlug;
    }
    next();
  },

  // generating slug from name before updating a row
  beforeUpdate: function (req, next) {
    if (req.name) {
      var stringForMakingSlug = req.name;
      stringForMakingSlug = stringForMakingSlug.replace(' ', '-');
      stringForMakingSlug = stringForMakingSlug.toLowerCase();
      req.slug = stringForMakingSlug;
    }
    next();
  }
};

