/**
 * UserLogin.js
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
    user_id: {
      model: 'user',
      required: true,
    },
    warehouse_id: {
      model: 'warehouse',
      required: true,
    },
    ip_address: {
      type: 'text',
    },
    username: {
      type: 'string',
      required: true,
    },
    time: {
      type: 'string', columnType: 'datetime'
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
  tableName: 'user_logins',
/*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true,*/
};

