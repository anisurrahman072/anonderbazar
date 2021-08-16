/**
 * GroupPermissions.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    perm_key: {
      type: 'string',
      columnType: 'varchar',
      required: true
    },
    perm_label: {
      type: 'string',
      columnType: 'varchar',
      required: true
    },
    perm_section: {
      type: 'string',
      columnType: 'varchar',
      required: true
    },
  },

  tableName: 'group_permissions'
};

