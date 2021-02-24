/**
 * EventManagement.js
 *
 * @description :: A model definition represents a database table/collection.
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
    event_type: {
      type: 'integer',
    },
    name: {
      type: 'string',
      required: true,
    },
    admin_email: {
      type: 'string',
      required: true,
    },
    admin_phone: {
      type: 'string',
      required: true,
    },
    image: {
      type: 'string',
    },
    description: {
      type: 'string'
    },
    event_place: {
      type: 'string'
    },
    event_startdate: {
      type: 'string', columnType: 'date',
    },
    event_enddate: {
      type: 'string', columnType: 'date',
    },
    event_starttime: {
      type: 'string', columnType: 'datetime',
    },
    event_endtime: {
      type: 'string', columnType: 'datetime',
    },
    registration_lastdate: {
      type: 'string', columnType: 'date',
    },
    event_price_ids: {
      type: 'json'
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
  tableName: "events",
/*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true,*/
};

