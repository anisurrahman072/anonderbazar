/**
 * PRStatus.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    id: {
      type: 'integer',
      primaryKey: true,
      unique: true,
      autoIncrement: true
    },
    warehouse_id:{
      model:'warehouse'
    },
    total_quantity:{
      type:'integer'
    },
    total_amount:{
      type:'float'
    },
    info:{
      type: 'text'
    },
    items:{
      type: 'text'
    },
    created_by: {
      model: 'user'
    },
    date: {
      type: 'datetime',
      defaultsTo: function () {
        return new Date();
      }
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
  },
  tableName: "pr_status",
  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true,
};

