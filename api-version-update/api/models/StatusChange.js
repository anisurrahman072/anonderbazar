/**
 * StatusChange.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    order_id: {
      model: 'order',
    },
    suborder_id:{
      model:'suborder'
    },
    order_status: {
      type: 'integer'
    },
    status: {
      type: 'integer'
    },
    changed_by: {
      model: 'user'
    },
    date: {
      type: 'string', columnType: 'datetime'
    },
  },
  tableName: 'orders_status',
};

