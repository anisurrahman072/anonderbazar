/**
 * EventRegistration.js
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
    user_id: {
      model: 'user',
    },
    event_id: {
      model: 'eventmanagement',
    },
    person_or_stallamount: {
      type: 'string',
    },
    total: {
      type: 'integer',
    },
    reg_fee: {
      type: 'float',
    },
    entry_number: {
      type: 'integer',
    },
    exhibition_products: {
      type: 'string',
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
  tableName: "event_registration",
/*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true,*/
};

