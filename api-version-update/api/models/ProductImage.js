/**
 * ProductImage.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    product_id: {
      model: 'product',
    },
    image_path: {
      type: 'string',
      columnType: 'varchar',
      required: true
    },
  },
  tableName: 'product_images',
};

