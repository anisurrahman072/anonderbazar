/**
 * EventRegistration.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    user_id: {
      model: 'user',
      required: true,
    },
    event_id: {
      model: 'eventmanagement',
      required: true,
    },
    person_or_stallamount: {
      type: 'string',
      required: false,
      allowNull: true,
    },
    total: {
      type: 'integer',
      required: false,
      allowNull: true,
    },
    reg_fee: {
      type: 'float',
      required: true,
    },
    entry_number: {
      type: 'integer',
      required: true,
    },
    exhibition_products: {
      type: 'string',
      required: true,
    },
  },
  tableName: 'event_registration',
};

