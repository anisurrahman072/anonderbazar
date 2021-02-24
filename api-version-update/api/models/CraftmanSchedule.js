/**
 * CraftmanSchedule.js
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
    craftman_id: {
      type: 'integer',
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
      type: 'float',
      required: true
    },
    start_time: {
      type: 'string', columnType: 'datetime',
      required: true
    },
    end_time: {
      type: 'string', columnType: 'datetime',
      required: true
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
  tableName: 'craftman_schedules',
/*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true,*/
};

