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
    start_date: {
      type: 'ref',
      columnType: 'datetime',
      required: true
    },
    end_date: {
      type: 'ref',
      columnType: 'datetime',
      required: true
    }
  },

  tableName: 'anonder_jhor'
};

