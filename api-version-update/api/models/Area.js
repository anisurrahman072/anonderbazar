/**
 * Area.js
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
    type_id: {
      type: 'number',
      columnType: 'integer',
      required: true,
    },
    parent_id: {
      type: 'number',
      columnType: 'integer',
      required: true,
    },
    region_id: {
      type: 'number',
      columnType: 'integer',
      required: true,
    },
    name: {
      type: 'string',
      required: true,
    },
    eng_name: {
      type: 'string',
      required: true,
    },
    map_lat: {
      type: 'string',
      required: true,
    },
    map_lon: {
      type: 'string',
      required: true,
    },
    map_path: {
      type: 'text',
      required: true,
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
  tableName: 'areas',
/*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true,*/
};

