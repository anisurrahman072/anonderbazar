/**
 * AnonderJhorOffers.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    anonder_jhor_id: {
      model: 'anonderJhor',
      required: true
    },
    category_id: {
      model: 'category'
    },
    sub_category_id: {
      model: 'category'
    },
    sub_sub_category_id: {
      model: 'category'
    },
    calculation_type: {
      type: 'string',
      columnType: 'varchar',
      required: true
    },
    discount_amount: {
      type: 'number',
      columnType: 'decimal',
    },
    start_date: {
      type: 'ref',
      columnType: 'datetime',
      required: true
    },
    end_date: {
      type: 'ref',
      columnType: 'datetime',
      required: true
    },
    status: {
      type: 'number',
      columnType: 'integer',
      required: true,
    },
    image: {
      type: 'json',
      columnType: 'text',
      required: true,
    }
  },

  tableName: 'anonder_jhor_offers'
};

