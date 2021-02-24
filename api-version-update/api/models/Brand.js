/**
 * Brand.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    warehouse_id: {
      type: 'number',
      columnType: 'integer',
      allowNull: true,
    },
    code: {
      type: 'string',
      columnType: 'varchar',
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
      allowNull: true,
    },
    slug: {
      type: 'string',
      columnType: 'varchar',
      allowNull: true,
    },
  },
  tableName: 'brands',

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

