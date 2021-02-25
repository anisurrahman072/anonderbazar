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
    data_value: {
      type: 'json',
      columnType: 'text',
      required: false,
    },
    user_id: {
      model: 'user',
      required: false
    },
  },
  tableName: 'cms',
/*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true*/
};
