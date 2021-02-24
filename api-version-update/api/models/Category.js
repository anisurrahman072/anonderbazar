/**
 * Category.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var photo;
module.exports = {

  attributes: {
    type_id: {
      type: 'number',
      columnType: 'integer',
      required: true,
    },
    parent_id: {
      type: 'number',
      columnType: 'integer',
      required: false,
      allowNull: true,
    },
    offer_id: {
      model: 'CMS',
      required: false,
    },
    code: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true,
    },
    name: {
      type: 'string',
      columnType: 'varchar',
      required: true,
    },
    image: {
      type: 'string',
      columnType: 'text',
      required: false,
    },
    slug: {
      type: 'string',
      columnType: 'varchar',
      required: false
    },
  },
  tableName: 'categories',
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

