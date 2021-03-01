/**
 * CourierList.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    dhaka_charge: {
      type: 'number',
      columnType: 'decimal',
      defaultsTo: 50.00
    },
    outside_dhaka_charge: {
      type: 'number',
      columnType: 'decimal',
      defaultsTo: 80.00
    },
    sslcommerce_user: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true,
    },
    sslcommerce_pass: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true,
    },
    delivery_charge_text_en: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true,
    },
    delivery_charge_text_bn: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true,
    },
    status: {
      type: 'number',
      columnType: 'int',
      required: false,
      defaultsTo: 1,
    },
    default_image_width_ratio: {
      type: 'number',
      columnType: 'int',
      defaultsTo: 9
    },
    default_image_height_ratio: {
      type: 'number',
      columnType: 'int',
      defaultsTo: 6
    },
  },
  tableName: 'global_configs',
};

