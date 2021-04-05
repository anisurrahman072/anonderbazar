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
      required: false,
      allowNull: true,
    },
    code: {
      type: 'string',
      columnType: 'varchar',
      required: true,
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
      allowNull: true,
    },
    frontend_position: {
      type: 'number',
      columnType: 'integer',
      required: false,
      defaultsTo: 111,
    },
    slug: {
      type: 'string',
      columnType: 'varchar',
      required: true,
    },
  },
  tableName: 'brands',

/*  // generating slug from name before creating a row
  beforeCreate: function (req, next) {
    if (req.name) {
      let stringForMakingSlug = req.name;
      stringForMakingSlug = stringForMakingSlug.replace(' ', '-');
      stringForMakingSlug = stringForMakingSlug.toLowerCase();
      req.slug = stringForMakingSlug;
    }
    next();
  },

  // generating slug from name before updating a row
  beforeUpdate: function (req, next) {
    if (req.name) {
      let stringForMakingSlug = req.name;
      stringForMakingSlug = stringForMakingSlug.replace(' ', '-');
      stringForMakingSlug = stringForMakingSlug.toLowerCase();
      req.slug = stringForMakingSlug;
    }
    next();
  }*/
};

