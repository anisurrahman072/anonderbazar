/**
 * UserLoginController
 *
 * @description :: Server-side logic for managing userlogins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {performance} = require('perf_hooks');

module.exports = {
  destroy: async (req, res) => {
    try {
      const time1 = performance.now();

      const user = await UserLogin.update({id: req.param('id')}, {deletedAt: new Date()}).fetch();

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(user[0]);
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);
      return res.json(error.status, {message: '', error, success: false});
    }
  }
};

