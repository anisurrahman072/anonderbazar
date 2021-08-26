const util = require('util');

module.exports = {

  friendlyName: 'Cache read',

  description: 'used to retrieve data from cache via a key, undefined if data doesnt exist or expired.',

  inputs: {
    key: {
      type: 'string',
      description: 'key used to read the data from the cache',
      required: true
    }
  },

  exits: {
    success: {
      description: 'All done.',
    },
  },

  fn: async function (inputs, exits) {
    await sails.getDatastore('cache').leaseConnection(async (db)=>{
      const found = await (util.promisify(db.get).bind(db))(inputs.key);
      if (found === null) {
        return exits.success(undefined);
      } else {
        return exits.success(JSON.parse(found));
      }
    });
  }

};

