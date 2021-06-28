/**
 * Question.js
 *
 * @description :: TODO: Stores the questions of customers related to the products.
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
    question: {
      type: 'string',
      columnType: 'text',
      required: true
    },
    answer: {
      type: 'string',
      columnType: 'text',
    },
    answered_by: {
      type: 'string',
      columnType: 'varchar'
    }
  },
  tableName: 'product_question_answer',
  beforeCreate: function (valuesToSet, proceed) {
    valuesToSet.question = he.encode(valuesToSet.question);
    valuesToSet.answer = he.encode(valuesToSet.answer);
    return proceed();
  }
};

