/**
 * Shipping.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const he = require('he');

module.exports = {

  attributes: {
    user_id: {
      model: 'user',
      required: true
    },
    order_id: {
      model: 'order'
    },
    first_name: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    last_name: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    phone: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true,
    },
    postal_code: {
      type: 'string',
      columnType: 'varchar',
      required: true
    },
    address: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true,
    },
    upazila_id: {
      model: 'area',
      required: true,
    },
    zila_id: {
      model: 'area'
    },
    division_id: {
      model: 'area'
    },
    status: {
      type: 'number',
      columnType: 'integer',
      defaultsTo: 1
    },
  },
  tableName: 'shipping_addresses',
  beforeCreate: function (valuesToSet, proceed) {
    valuesToSet.first_name = he.encode(valuesToSet.first_name);
    valuesToSet.last_name = he.encode(valuesToSet.last_name);
    valuesToSet.address = he.encode(valuesToSet.address);
    return proceed();
  },

  beforeUpdate: function (valuesToSet, proceed) {
    if (valuesToSet && valuesToSet.first_name) {
      valuesToSet.first_name = he.encode(valuesToSet.first_name);
      valuesToSet.last_name = he.encode(valuesToSet.last_name);
      valuesToSet.address = he.encode(valuesToSet.address);
    }
    return proceed();
  }
};

