/**
 * DesignCategory.js
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
    parent_id: {
      type: 'integer',
    },
    code: {
      type: 'string',

    },
    name: {
      type: 'string',
      required: true,
    },
    image: {
      type: 'string',
    },
    slug: {
      type: 'string',
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
  tableName: 'design_categories',
  /*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true,*/

  // generating slug from name before creating a row
  beforeCreate: function (req, next) {
    var stringForMakingSlug = req.name;
    stringForMakingSlug = stringForMakingSlug.replace(' ', '-');
    stringForMakingSlug = stringForMakingSlug.toLowerCase();
    req.slug = stringForMakingSlug;
    next();
  },

  // generating slug from name before creating a row
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
