/**
 * CourierList.js
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
    dhaka_charge: {
      type: 'float',
      defaultsTo: 50
    },
    outside_dhaka_charge: {
      type: 'float',
      defaultsTo: 80
    },
    sslcommerce_user: {
      type: 'string'
    },
    sslcommerce_pass: {
      type: 'string'
    },
    delivery_charge_text_en: {
      type: 'string'
    },
    delivery_charge_text_bn: {
      type: 'string'
    },
    status: {
      type: 'integer',
    },
    default_image_width_ratio: {
      type: 'integer',
    },
    default_image_height_ratio: {
      type: 'integer',
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
  tableName: "global_configs",
/*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true,*/
};

