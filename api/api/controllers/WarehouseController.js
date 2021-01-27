/**
 * WarehouseController
 *
 * @description :: Server-side logic for managing warehouses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
import {
  initLogPlaceholder,
  pagination
} from "../../libs";
import {imageUploadConfig} from "../../libs/helper";

module.exports = {
  //Method called for getting all warehouse data
  //Model models/Warehouse.js
  getAll: async (req, res) => {
    try {
      initLogPlaceholder(req, 'craftsman');
      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};
      _where.deletedAt = null;
      let query = req.query
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
      })
    } catch
      (error) {
      let message = 'Error in Get All Warehouses with pagination';

      res.status(400).json({
        success: false,
        message
      })
    }
  },
  //Method called for deleting a warehouse data
  //Model models/Warehouse.js
  destroy: function (req, res) {
    Warehouse.update({id: req.param('id')}, {deletedAt: new Date()})
      .exec(function (err, warehouse) {
        User.update({warehouse_id: req.param("id")}, {deletedAt: new Date()}).exec(
          function (err, user) {
            if (err) return res.json(err, 400);
            return res.json(user[0]);
          }
        );
        Product.update({warehouse_id: req.param("id")}, {deletedAt: new Date()}).exec(
          function (err, product) {
            if (err) return res.json(err, 400);
            return res.json(product[0]);
          }
        );
        if (err) return res.json(err, 400);
        return res.json(warehouse[0]);
      });
  },
  //Method called for creating a warehouse data
  //Model models/Warehouse.js
  create: function (req, res) {

    if (req.body.haslogo === 'true') {
      req.file('logo').upload(imageUploadConfig(), function (err, uploaded) {
        if (err) {
          return res.json(err.status, {err: err});
        }
        var newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
        if (err) return res.serverError(err);
        req.body.logo = '/' + newPath;
        Warehouse.create(req.body).exec(function (err, Warehouse) {
          if (err) {
            return res.json(err.status, {err: err});
          }
          if (Warehouse) {
            res.json(200, Warehouse);
          }
        });
      });
    } else {
      Warehouse.create(req.body).exec(function (err, Warehouse) {
        if (err) {
          return res.json(err.status, {err: err});
        }
        if (Warehouse) {
          res.json(200, Warehouse);
        }
      });
    }
  },
  //Method called for updating a warehouse data
  //Model models/Warehouse.js
  update: function (req, res) {
    if (req.body.haslogo === 'true') {
      req.file('logo').upload(imageUploadConfig(), function (err, uploaded) {
        if (err) {
          return res.json(err.status, {err: err});
        }
        const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];

        if (err) return res.serverError(err);
        req.body.logo = '/' + newPath;
        Warehouse.update({id: req.param('id')}, req.body)
          .exec(function (err, warehouse) {
            if (err) return res.json(err, 400);
            return res.json(200, warehouse);
          });
      });
    } else {
      Warehouse.update({id: req.param('id')}, req.body)
        .exec(function (err, warehouse) {
          if (err) return res.json(err, 400);
          return res.json(200, warehouse);
        });
    }
  }
};

