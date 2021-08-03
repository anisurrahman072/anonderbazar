/**
 * isAdminUser
 *
 * @description :: Policy to check if user is authorized with JSON web token
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Policies
 */
module.exports = (req, res, next) => {
  /*console.log('tokens: ', req.token.userInfo.group_id.accessList);*/
  if (!req.token) {
    return res.status(401).json({err: 'No Authorization header was found'});
  }
  try {
    if (!(req.token.userInfo && req.token.userInfo.group_id.name && req.token.userInfo.group_id.name !== 'customer' && req.token.userInfo.is_admin_user === true)) {
      return res.status(401).json({err: 'You\'re not allowed to access this route'});
    }
    return next();
  } catch (err) {
    console.log(err);
    return res.status(400).json({err: 'server error'});
  }

};
