/**
 * UserLoginController
 *
 * @description :: Server-side logic for managing userlogins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  destroy: async (req, res) => {
    try{
      const user = await UserLogin.update({id: req.param('id')}, {deletedAt: new Date()}).fetch();
      return res.json(user[0]);
    }
    catch (error){
      return res.json(error.status, {message: '', error, success: false});
    }
  }
};

