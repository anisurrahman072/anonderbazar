module.exports = {
  destroy: async (req, res) => {
    Area.update({id: req.param('id')}, {deletedAt: new Date()})
      .exec((err, user) => {
        if (err) {return res.json(err, 400);}
        return res.json(user[0]);
      });
  }
};

