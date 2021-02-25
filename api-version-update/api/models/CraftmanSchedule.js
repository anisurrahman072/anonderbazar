/**
 * CraftmanSchedule.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    craftman_id: {
      type: 'number',
      columnType: 'integer',
      required: true,
    },
    warehouse_id: {
      model: 'warehouse',
      required: true
    },
    order_id: {
      model: 'order',
      required: true
    },
    product_id: {
      model: 'product',
      required: true
    },
    product_quantity: {
      type: 'number',
      columnType: 'decimal',
      required: true
    },
    start_time: {
      type: 'string',
      columnType: 'datetime',
      required: true
    },
    end_time: {
      type: 'string',
      columnType: 'datetime',
      required: true
    },
  },
  tableName: 'craftman_schedules',
  /*  autoCreatedAt: true,
    autoUpdatedAt: true,
    autoDeletedAt: true,*/
};

