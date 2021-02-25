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
      type: 'number',
      columnType: 'integer',
      required: true,
    },
    name: {
      type: 'string',
      columnType: 'text',
      required: true,
    },
    admin_email: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true,
    },
    admin_phone: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true,
    },
    image: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true,
    },
    description: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true,
    },
    event_place: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true,
    },
    event_startdate: {
      type: 'string',
      columnType: 'date',
      required: false,
      allowNull: true,
    },
    event_enddate: {
      type: 'string',
      columnType: 'date',
      required: false,
      allowNull: true,
    },
    event_starttime: {
      type: 'string',
      columnType: 'datetime',
      required: false,
      allowNull: true,
    },
    event_endtime: {
      type: 'string',
      columnType: 'datetime',
      required: false,
      allowNull: true,
    },
    registration_lastdate: {
      type: 'string',
      columnType: 'date',
      required: false,
      allowNull: true,
    },
    event_price_ids: {
      type: 'json',
      columnType: 'text',
      required: false,
      allowNull: true,
    },
  },
  tableName: 'events',
  /*  autoCreatedAt: true,
    autoUpdatedAt: true,
    autoDeletedAt: true,*/
};

