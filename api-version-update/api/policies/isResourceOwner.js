/**
 * isResourceOwner
 */
module.exports = (req, res, next) => {
  if (!req.token) {
    return res.status(401).json({err: 'No Authorization header was found'});
  }
  try {
    return next();
  } catch (err) {
    console.log(err);
    return res.status(400).json({err: 'server error'});
  }
};
