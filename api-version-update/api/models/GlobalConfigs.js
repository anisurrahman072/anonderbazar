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
      required: true,
    },
    outside_dhaka_charge: {
      type: 'number',
      columnType: 'decimal',
      required: true,
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
      required: true,
    },
    default_image_height_ratio: {
      type: 'number',
      columnType: 'int',
      required: true,
    },
  },
  tableName: 'global_configs',
};

