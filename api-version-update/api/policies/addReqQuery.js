module.exports = function(req, res, next) {
  if (req.method === 'GET') {
    req.params.deletedAt = null;
    if (req.query.where !== null) {
      var array = JSON.parse(req.query.where);
      array['deletedAt'] = null;
      req.query.where = JSON.stringify(array);
    }
    else
    {req.query.where = JSON.stringify({'deletedAt': null});}
  }
  return next();
};
