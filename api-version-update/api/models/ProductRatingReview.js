/**
 * ProductRatingReview.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const he = require('he');

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
    review: {
      type: 'string',
      columnType: 'text',
      required: true
    },
  },
  tableName: 'product_rating_review',
  beforeCreate: function (valuesToSet, proceed) {
    valuesToSet.review = he.encode(valuesToSet.review);
    return proceed();
  },

  beforeUpdate: function (valuesToSet, proceed) {
    if (valuesToSet && valuesToSet.review) {
      valuesToSet.review = he.encode(valuesToSet.review);
    }
    return proceed();
  }
};
