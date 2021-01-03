/**
 * Suborder.js
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
    product_order_id: {
      model: 'order',
      required: true
    },
    warehouse_id: {
      model: 'warehouse',
      required: true
    },
    total_quantity: {
      type: 'integer',
      defaultsTo: 0
    },
    total_price: {
      type: 'float',
      defaultsTo: 0
    },
    delivery_date: {
      type: 'date',
    },
    suborderItems: {
      collection: 'suborderItem',
      via: 'product_suborder_id'
    },
    courier_status: {
      type: 'integer',
    },
    PR_status: {
      type: 'integer',
    },
    status: {
      type: 'integer',
    },
    changed_by: {
      model: 'user'
    },
    date: {
      type: 'datetime',
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
    },
    toJSON: function () {
      var obj = this.toObject();

      return obj;
    }
  },
  tableName: "product_suborders",
  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true
};

