/**
 * RegularOfferProducts.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes:  {
    regular_offer_id: {
      model: 'offer',
      required: true
    },
    product_id: {
      model: 'product',
      required: true
    },
    product_deactivation_time:  {
      type: 'ref',
      columnType: 'datetime',
    },
  },
  tableName: 'regular_offer_products'
};
