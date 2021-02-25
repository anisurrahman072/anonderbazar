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
  },
  tableName: 'parts',
};
