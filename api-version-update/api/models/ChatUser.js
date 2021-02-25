/**
 * ChatUser.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    user_id: {
      model: 'user',
      required: true,
    },
    product_id: {
      model: 'product',
      required: true,
    },
    warehouse_id: {
      model: 'warehouse',
      required: true,
    },
    person_status: {
      type: 'number',
      columnType: 'integer',
      required: true,
    },
  },
  tableName: 'chat_user',
  /*  autoCreatedAt: true,
    autoUpdatedAt: true,
    autoDeletedAt: true,*/
};

