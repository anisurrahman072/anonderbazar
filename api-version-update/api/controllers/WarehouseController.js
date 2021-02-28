/**
 * WarehouseController
 *
 * @description :: Server-side logic for managing warehouses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {
  initLogPlaceholder,
  pagination
} = require('../../libs');
const {imageUploadConfig} = require('../../libs/helper');

module.exports = {
  //Method called for getting all warehouse data
  //Model models/Warehouse.js
  getAll: async (req, res) => {
    console.log('rouzexgggggggggggggggggggggggggggggggggggggggggggggg');
    try {
      initLogPlaceholder(req, 'craftsman');
      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};
      _where.deletedAt = null;
      let query = req.query;
      if (query.warehouse_id) {
        _where.id = parseInt(query.warehouse_id);
      }

      /* WHERE condition..........END................*/

      let totalWarehouse = await Warehouse.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalWarehouse;
      let Warehouses = await Warehouse.find(
        {
          where: _where,
          limit: _pagination.limit,
          skip: _pagination.skip
        }).populateAll();


      res.status(200).json({
        success: true,
        total: totalWarehouse,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All Warehouses with pagination',
        data: Warehouses
      });
    } catch
    (error) {
      let message = 'Error in Get All Warehouses with pagination';

      res.status(400).json({
        success: false,
        message
      });
    }
  },
  //Method called for deleting a warehouse data
  //Model models/Warehouse.js
  destroy: async (req, res) => {
    try {
      const updatedWarehouse = await Warehouse.update({id: req.param('id')}, {deletedAt: new Date()}).fetch();
      const updatedUser = await User.update({warehouse_id: req.param('id')}, {deletedAt: new Date()}).fetch();
      return res.json(200, updatedUser[0]);
      const updatedProduct = await Product.update({warehouse_id: req.param('id')}, {deletedAt: new Date()}).fetch();
      return res.json(200, updatedProduct[0]);
      return res.json(200, updatedWarehouse[0]);
    }
    catch (error){
      return res.json(error.status, {message: '', error, success: false});
    }

  },


  // destroy: function (req, res) {
  //   Warehouse.update({id: req.param('id')}, {deletedAt: new Date()})
  //     .exec((err, warehouse) => {
  //       User.update({warehouse_id: req.param('id')}, {deletedAt: new Date()}).exec(
  //         (err, user) => {
  //           if (err) {
  //             return res.json(err, 400);
  //           }
  //           return res.json(user[0]);
  //         }
  //       );
  //       Product.update({warehouse_id: req.param('id')}, {deletedAt: new Date()}).exec(
  //         (err, product) => {
  //           if (err) {
  //             return res.json(err, 400);
  //           }
  //           return res.json(product[0]);
  //         }
  //       );
  //       if (err) {
  //         return res.json(err, 400);
  //       }
  //       return res.json(warehouse[0]);
  //     });
  // },
  //Method called for creating a warehouse data
  //Model models/Warehouse.js
  create: async (req, res) => {
    try {
      if (req.body.haslogo === 'true') {
        const uploaded = await uploadImages(req.file('logo'));
        if (uploaded.length === 0) {
          return res.badRequest('No file was uploaded');
        }
        let newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
        req.body.logo = '/' + newPath;
      }
      const warehouseCreate = await Warehouse.create(req.body).fetch();
      return res.json(200, warehouseCreate);

    } catch (error) {
      return res.json(error.status, {message: '', error, success: false});
    }
  },

  //Method called for updating a warehouse data
  //Model models/Warehouse.js
  update: function (req, res) {
    if (req.body.haslogo === 'true') {
      req.file('logo').upload(imageUploadConfig(), (err, uploaded) => {
        if (err) {
          return res.json(err.status, {err: err});
        }
        const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];

        if (err) {
          return res.serverError(err);
        }
        req.body.logo = '/' + newPath;
        Warehouse.update({id: req.param('id')}, req.body)
          .exec((err, warehouse) => {
            if (err) {
              return res.json(err, 400);
            }
            return res.json(200, warehouse);
          });
      });
    } else {
      Warehouse.update({id: req.param('id')}, req.body)
        .exec((err, warehouse) => {
          if (err) {
            return res.json(err, 400);
          }
          return res.json(200, warehouse);
        });
    }
  }
};

