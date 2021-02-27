/**
 * Chat.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    chat_user_id: {
      model: 'chatuser',
      required: true,
    },
    message: {
      type: 'string',
      columnType: 'text',
      allowNull: true,
    },
    person_status: {
      type: 'number',
      columnType: 'integer',
      required: true,
    },
    notification_view_status: {
      type: 'number',
      columnType: 'integer',
      defaultTo: 1
    },
  },
  tableName: 'chat',
/*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true,*/
};

