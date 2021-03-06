/**
 * CMS.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    page: {
      type: 'string',
      columnType: 'varchar',
      required: true
    },
    section: {
      type: 'string',
      columnType: 'varchar',
      required: true
    },
    sub_section: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true,
    },
    frontend_position: {
      type: 'number',
      columnType: 'integer',
      required: false,
      defaultsTo: 111,
    },
    data_value: {
      type: 'json',
      columnType: 'text',
      required: false,
    },
    user_id: {
      model: 'user'
    },
  },
  tableName: 'cms',
};
