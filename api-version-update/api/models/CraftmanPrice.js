/**
 * CraftmanPrice.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */


module.exports = {

  attributes: {
    craftman_id: {
      model: 'user',
      required: true
    },
    type_id: {
      model: 'category',
      required: true
    },
    category_id: {
      model: 'category',
      required: true
    },
    subcategory_id: {
      model: 'category',
      required: false
    },
    part_id: {
      model: 'part',
      required: true
    },
    design_category_id: {
      model: 'designCategory',
      required: true
    },
    design_subcategory_id: {
      model: 'designCategory',
      required: false
    },
    design_id: {
      model: 'design',
      required: true
    },
    genre_id: {
      model: 'genre',
      required: true
    },
    warehouse_id: {
      model: 'warehouse',
      required: true
    },
    price: {
      type: 'number',
      columnType: 'decimal',
      required: true
    },
    time: {
      type: 'number',
      columnType: 'integer',
      required: true,
    },
    comment: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true
    },
  },
  tableName: 'craftman_price',
  /*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true,*/

};
