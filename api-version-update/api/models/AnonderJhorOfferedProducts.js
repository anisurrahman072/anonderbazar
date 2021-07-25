/**
 * AnonderJhorOfferedProducts.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    anonder_jhor_offer_id: {
      model: 'anonderJhorOffers',
      required: true
    },
    product_id: {
      model: 'product',
      required: true
    },
    calculation_type: {
      type: 'string',
      columnType: 'varchar',
    },
    discount_amount: {
      type: 'number',
      columnType: 'decimal',
    },
    status: {
      type: 'number',
      columnType: 'integer',
      required: true,
    },
  },
  tableName: 'anonder_jhor_offered_products'
};

