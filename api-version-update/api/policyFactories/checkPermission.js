/**
 * checkPermission
 *
 * @description :: Policy to check if user is authorized with JSON web token
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Policies
 */

module.exports = function(){
  let permissions = Object.values(arguments);

  return function(req, res, next){

    if(req.token && req.token.userInfo && req.token.userInfo.group_id.accessList && req.token.userInfo.group_id.accessList.length > 0){
      let isAllowed = false;
      permissions.forEach(permission => {
        let index = req.token.userInfo.group_id.accessList.findIndex(accessPerm => accessPerm === permission);

        if(index !== -1){
          isAllowed = true;
        }
      });

      if(!isAllowed){
        return res.status(401).json({err: 'Access not found!'});
      }
      return next();

    } else {
      return res.status(401).json({err: 'You are not authorized to access this route'});
    }
  };
};
