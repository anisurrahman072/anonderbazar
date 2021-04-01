module.exports = {

  friendlyName: 'Generate users',

  description: 'Generating Missing Users',

  inputs: {
    username: {
      description: 'Username of the user',
      type: 'string',
    },
    first_name: {
      description: 'First Name of a user',
      type: 'string'
    },
    last_name: {
      description: 'Last Name of a user',
      type: 'string'
    },
    password: {
      description: 'Password of a user',
      type: 'string'
    }
  },

  fn: async function ({username, first_name, last_name, password}, exits) {
    sails.log('Running custom shell script... (`sails run create-user`)');

    try {
      const users = await User.find({
        username: username,
        deletedAt: null
      });
      if (users && users.length > 0) {
        return exits.error(new Error('User is already existed with this username.'));
      }

      await User.create({
        username: username,
        phone: username,
        last_name,
        first_name,
        group_id: 2,
        password
      });

      return exits.success();
    } catch (error) {
      return exits.error(error);
    }
  }
};
