/**
 * Rating.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    user_id: {
      model: 'user',
      required: true
    },
    product_id: {
      model: 'product',
      required: true
    },
    rating: {
      type: 'number',
      columnType: 'decimal',
      required: true
    },
    status: {
      type: 'number',
      columnType: 'integer',
      required: true
    },
  },
  tableName: 'ratings',
};

