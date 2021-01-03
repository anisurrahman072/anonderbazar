import { uploadImgAsync } from '../../libs';

module.exports = {
  //Method called for deleting a warehouse variant data
  //Model models/WarehouseVariant.js
  destroy: function(req, res) {
    WarehouseVariant.update(
      { id: req.param('id') },
      { deletedAt: new Date() }
    ).exec(function(err, user) {
      if (err) return res.json(err, 400);
      return res.json(user[0]);
    });
  },
  //Method called for creating a warehouse variant data
  //Model models/WarehouseVariant.js
  create: async (req, res) => {
    try {
      if (req.body.hasImage === 'true') {
        let tempImg = await uploadImgAsync(req.file('image'), {
          dirname: '../../.tmp/public/images/',
          saveAs: Date.now() + '_warehouse_variant.jpg'
        });
        let newPath = '/images/' + tempImg[0].fd.split(/[\\//]+/).reverse()[0];

        req.body.image = newPath;

        let warehouseVariant = await WarehouseVariant.create(req.body);
        return res.json(200, warehouseVariant);
      } else {
        let warehouseVariant = await WarehouseVariant.create(req.body);

        return res.json(200, warehouseVariant);
      }
    } catch (err) {
      res.json(400, { message: 'wrong' });
    }
  },

  //Method called for updating a warehouse variant data
  //Model models/WarehouseVariant.js
  update: function(req, res) {
    if (req.body.hasImage === 'true') {
      req.file('image').upload(
        {
          dirname: '../../.tmp/public/images/'
        },
        function(err, uploaded) {
          if (err) {
            return res.json(err.status, { err: err });
          }
          var newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
          if (err) return res.serverError(err);
          req.body.image = '/images/' + newPath;
          WarehouseVariant.update({ id: req.param('id') }, req.body).exec(
            function(err, warehouseVariant) {
              if (err) return res.json(err, 400);
              return res.json(200, warehouseVariant);
            }
          );
        }
      );
    } else {
      WarehouseVariant.update({ id: req.param('id') }, req.body).exec(function(
        err,
        warehouseVariant
      ) {
        if (err) return res.json(err, 400);
        return res.json(200, warehouseVariant);
      });
    }
  }
};
