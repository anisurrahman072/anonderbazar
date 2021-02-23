/**
 * CMS.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
/*    id: {
      type: 'integer',
      primaryKey: true,
      unique: true,
      autoIncrement: true
    },*/
    page: {
      type: 'string',
      required: true
    },
    section: {
      type: 'string',
      required: true
    },
    sub_section: {
      type: 'string'
    },
    data_value: {
      type: 'json',
      required: true
    },
    user_id: {
      model: 'user'
    },
/*    createdAt: {
      type: 'datetime',
      columnName: 'created_at',
      defaultsTo: function() {
        return new Date();
      }
    },
    updatedAt: {
      type: 'datetime',
      columnName: 'updated_at',
      defaultsTo: function() {
        return new Date();
      }
    },
    deletedAt: {
      type: 'datetime',
      columnName: 'deleted_at',
      defaultsTo: null
    }*/
  },
  tableName: 'cms',
/*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true*/
};
