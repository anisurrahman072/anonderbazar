module.exports = {
  //Method called for deleting a variant data
  //Model models/Variant.js
  destroy: async (req, res) => {
    Variant.update(
      {
        id: req.param('id')
      },
      {
        deletedAt: new Date()
      }
    ).exec((err, user) => {
      if (err) {return res.json(err, 400);}
      return res.json(user[0]);
    });
  },
  //Method called for cerating a variant data
  //Model models/Variant.js
  create: function(req, res) {
    Variant.create(req.body).exec((err, variant) => {
      if (err) {
        return res.json(err.status, {
          err: err
        });
      }
      if (variant) {
        res.json(200, variant);
      }
    });
  }
};
