/**
 * PRStatus.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    warehouse_id: {
      model: 'warehouse'
    },
    total_quantity: {
      type: 'number',
      columnType: 'integer',
      required: false,
      allowNull: true
    },
    total_amount: {
      type: 'number',
      columnType: 'double',
      required: false,
      allowNull: true
    },
    info: {
      type: 'json',
      columnType: 'text'
    },
    items: {
      type: 'json',
      columnType: 'text'
    },
    created_by: {
      model: 'user'
    },
    date: {
      type: 'ref',
      columnType: 'datetime',
      required: false,
    },
  },
  tableName: 'pr_status',
};

