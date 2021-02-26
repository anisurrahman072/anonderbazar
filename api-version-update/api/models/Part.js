/**
 * Part.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */


module.exports = {

  attributes: {
    name: {
      type: 'string',
      columnType: 'varchar',
      required: true,
    },
    type_id: {
      model: 'Category',
      required: false,
    },
    category_id: {
      model: 'Category',
      required: false,
    },
    subcategory_id: {
      model: 'Category',
      required: false,
    },
    image: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true
    },
    details: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true
    },
  },
  tableName: 'parts',
  customToJSON: function () {
    return this.toObject();
  }
};
