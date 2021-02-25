/**
 * ChatFile.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    chat_id: {
      type: 'number',
      columnType: 'integer',
      required: true,
    },
    file_name: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true,
    },
    file_location: {
      type: 'json',
      columnType: 'text',
      required: true,
    },
  },
  tableName: 'chat_files',
  /*  autoCreatedAt: true,
    autoUpdatedAt: true,
    autoDeletedAt: true,*/
};

