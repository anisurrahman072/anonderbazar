/**
 * Question.js
 *
 * @description :: TODO: Stores the questions of customers related to the products.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    review_id: {
      model: 'ProductRatingReview',
      required: true
    },
    user_id: {
      model: 'user',
      required: true
    },
    likes: {
      type: 'number',
      columnType: 'integer',
    },
    unlikes: {
      type: 'number',
      columnType: 'integer',
    }
  },
  tableName: 'review_like_unlike',
};

