/**
 * EventManagement.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
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
      type: 'ref',
      columnType: 'date',
      required: false
    },
    event_enddate: {
      type: 'ref',
      columnType: 'date',
      required: false
    },
    event_starttime: {
      type: 'ref',
      columnType: 'datetime',
      required: false
    },
    event_endtime: {
      type: 'ref',
      columnType: 'datetime',
      required: false
    },
    registration_lastdate: {
      type: 'ref',
      columnType: 'date',
      required: false
    },
    event_price_ids: {
      type: 'json',
      columnType: 'text',
      required: false
    },
  },
  tableName: 'events',
};

