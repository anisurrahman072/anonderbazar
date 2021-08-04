/**
 * AnonderJhor.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    status: {
      type: 'number',
      columnType: 'integer',
      required: true,
    },
    banner_image: {
      type: 'json',
      columnType: 'text',
      required: true
    },
    homepage_banner_image: {
      type: 'json',
      columnType: 'text',
      required: false
    },
    show_in_homepage: {
      type: 'boolean',
      columnType: 'integer',
      defaultsTo: false
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
    pay_by_sslcommerz: {
      type: 'number',
      columnType: 'tinyint',
      defaultsTo: 0
    },
    pay_by_bKash: {
      type: 'number',
      columnType: 'tinyint',
      defaultsTo: 0
    },
    pay_by_offline: {
      type: 'number',
      columnType: 'tinyint',
      defaultsTo: 0
    },
    pay_by_cashOnDelivery: {
      type: 'number',
      columnType: 'tinyint',
      defaultsTo: 0
    }
  },

  tableName: 'anonder_jhor'
};

