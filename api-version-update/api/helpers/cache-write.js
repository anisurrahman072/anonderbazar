const util = require('util');

module.exports = {

  friendlyName: 'Cache write',

  description: 'used to save data into cache using a key and a TTL in seconds until the cache expires the data.',

  inputs: {
    key: {
      type: 'string',
      description: 'key used to write the data from the cache',
      required: true
    },
    ttlInSeconds: {
      type: 'number',
      defaultsTo: 3600, // for 3600 seconds
      description: 'how long till the cache expires, in seconds',
    },
    data: {
      type: 'string',
      description: 'data (simple string or complex object). data is stringified before its stored, has to be parsed when it is retrieved from storage.',
      required: true
    }
  },

  exits: {
    success: {
      description: 'All done.',
    },
  },

  fn: async function (inputs) {
    await sails.getDatastore('cache').leaseConnection(async (db)=>{
      await (util.promisify(db.setex).bind(db))(inputs.key, inputs.ttlInSeconds, inputs.data);
    });
  }

};
