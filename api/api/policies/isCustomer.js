/**
 * isCustomer
 *
 * @description :: Policy to check if user is authorized with JSON web token
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Policies
 **/
module.exports = (req, res, next) => {
  if (!req.token) {
    return res.status(401).json({err: 'No Authorization header was found'});
  }
  try {
    if (req.token.userInfo.group_id.name !== 'customer') {
      return res.status(401).json({err: 'No Authorization header was found'});
    }
    return next();
  } catch (err) {
    console.log('isCustomer', err);
    return res.status(400).json({err: 'server error'});
  }
};
