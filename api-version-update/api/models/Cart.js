/**
 * Cart.js
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
    ip_address: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true,
    },
    total_quantity: {
      type: 'number',
      columnType: 'integer',
      defaultsTo: 0
    },
    total_price: {
      type: 'number',
      columnType: 'float',
      defaultsTo: 0
    },
    status: {
      type: 'number',
      columnType: 'integer',
      required: false,
      defaultsTo: 1
    },
    cart_items: {
      collection: 'cartItem', /*one to many: a cart can have multiple Cart_items*/
      via: 'cart_id'
    },
  },
  tableName: 'carts',
  customToJSON: function () {
    return this;
  }
};
