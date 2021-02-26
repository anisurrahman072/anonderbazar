/**
 * FavouriteProduct.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    user_id: {
      model: 'user',
      required: true,
    },
    product_id: {
      model: 'product',
      required: true
    },
  },
  tableName: 'favourite_products',

};

