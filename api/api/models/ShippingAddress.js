/**
 * Shipping.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    id: {
      type: 'integer',
      primaryKey: true,
      unique: true,
      autoIncrement: true
    },
    user_id: {
      model: 'user',
      required: true
    },
    order_id: {
      model: 'order',
    },
    first_name: {
      type: 'string',
      required: true
    },
    last_name: {
      type: 'string',
      required: true
    },
    phone: {
      type: 'string',
      required: true
    },
    postal_code: {
      type: 'string',
      required: true
    },
    address: {
      type: 'string',
      required: true
    },
    upazila_id: {
      model: 'area',
      required: true,
    },
    zila_id: {
      model: 'area',
      required: true,
    },
    division_id: {
      model: 'area',
      required: true,
    },
    status: {
      type: 'integer',
      required: true
    },
    createdAt: {
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
    }
  },
  tableName: "shipping_addresses",
  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true
};

