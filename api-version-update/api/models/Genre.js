/**
 * Genre.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
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
    details: {
      type: 'string',
      required: false,
      allowNull: true,
    },
    image: {
      type: 'string',
      required: false,
      allowNull: true,
    },
    slug: {
      type: 'string',
      required: false,
      allowNull: true,
    },
  },
  tableName: 'genres',

  // generating slug from name before creating a row
  beforeCreate: function(req, next) {
    if (req.name) {
      var stringForMakingSlug = req.name;
      stringForMakingSlug = stringForMakingSlug.replace(' ', '-');
      stringForMakingSlug = stringForMakingSlug.toLowerCase();
      req.slug = stringForMakingSlug;
    }
    next();
  },

  // generating slug from name before updating a row
  beforeUpdate: function(req, next) {
    if (req.name) {
      var stringForMakingSlug = req.name;
      stringForMakingSlug = stringForMakingSlug.replace(' ', '-');
      stringForMakingSlug = stringForMakingSlug.toLowerCase();
      req.slug = stringForMakingSlug;
    }
    next();
  }
};
