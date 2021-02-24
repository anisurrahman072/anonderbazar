/**
 * Area.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    type_id: {
      type: 'number',
      columnType: 'integer',
      required: true,
    },
    parent_id: {
      type: 'number',
      columnType: 'integer',
      required: false,
      defaultsTo: 0
    },
    region_id: {
      type: 'number',
      columnType: 'integer',
      required: false,
    },
    name: {
      type: 'string',
      columnType: 'varchar',
      required: true,
    },
    eng_name: {
      type: 'string',
      columnType: 'varchar',
      required: true,
    },
    map_lat: {
      type: 'string',
      columnType: 'varchar',
      required: false,
    },
    map_lon: {
      type: 'string',
      columnType: 'varchar',
      required: false,
    },
    map_path: {
      type: 'string',
      columnType: 'varchar',
      required: false,
    },
  },
  tableName: 'areas',
};

