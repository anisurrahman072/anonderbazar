/**
 * Cart.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    /*    id: {
      type: 'integer',
      primaryKey: true,
      unique: true,
      autoIncrement: true
    },*/
    user_id: {
      model: 'user'
    },
    ip_address: {
      type: 'text'
    },
    total_quantity: {
      type: 'number',
      columnType: 'integer',
      defaultsTo: 0
    },
    total_price: {
      type: 'float',
      defaultsTo: 0
    },
    status: {
      type: 'number',
      columnType: 'integer',
    },
    cart_items: {
      collection: 'cartItem',
      via: 'cart_id'
    },
    /*    createdAt: {
      type: 'datetime',
      columnName: 'created_at',
      defaultsTo: function () {
        return new Date();
      }
    },
    updatedAt: {
      type: 'datetime',
      columnName: 'updated_at',
      defaultsTo: function () {
        return new Date();
      }
    },
    deletedAt: {
      type: 'datetime',
      columnName: 'deleted_at',
      defaultsTo: null
    },*/

  },
  tableName: 'carts',
  customToJSON: function () {
    return this.toObject();
  }
/*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true*/
};
