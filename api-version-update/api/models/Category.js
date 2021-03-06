/**
 * Category.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

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
      allowNull: true,
    },
    mobile_image: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true,
    },
    banner_image: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true,
    },
    slug: {
      type: 'string',
      columnType: 'varchar',
      allowNull: true,
    },
    show_in_nav: {
      type: 'boolean',
      columnType: 'integer',
      defaultsTo: false
    },
  },
  tableName: 'categories',

  // generating slug from name before creating a row
  beforeCreate: function (req, next) {
    let stringForMakingSlug = req.name;
    stringForMakingSlug = stringForMakingSlug.replace(' ', '-');
    stringForMakingSlug = stringForMakingSlug.toLowerCase();
    req.slug = stringForMakingSlug;
    next();
  },

  // generating slug from name before creating a row
  beforeUpdate: function (req, next) {
    if (req.name) {
      let stringForMakingSlug = req.name;
      stringForMakingSlug = stringForMakingSlug.replace(' ', '-');
      stringForMakingSlug = stringForMakingSlug.toLowerCase();
      req.slug = stringForMakingSlug;
    }
    next();
  }
};
