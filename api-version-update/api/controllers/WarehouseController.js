/**
 * WarehouseController
 *
 * @description :: Server-side logic for managing warehouses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {uploadImages} = require('../../libs/helper');
const {
  initLogPlaceholder,
  pagination
} = require('../../libs');
const {imageUploadConfig} = require('../../libs/helper');

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
        }).populate('upazila_id').populate('zila_id').populate('division_id').populate('user', {deletedAt: null});


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
        message,
        error
      });
    }
  },
  //Method called for deleting a warehouse data
  //Model models/Warehouse.js
  destroy: async (req, res) => {
    try {
      await Warehouse.updateOne({id: req.param('id')}).set({deletedAt: new Date()});

      await User.update({warehouse_id: req.param('id')}).set({deletedAt: new Date()});

      await Product.update({warehouse_id: req.param('id')}).set({deletedAt: new Date()});

      return res.json({
        success: false,
        message: 'Warehouse successfully deleted',
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'Failed to delete warehouse',
        error
      });
    }
  },
  //Method called for creating a warehouse data
  //Model models/Warehouse.js
  create: async (req, res) => {
    try {


      if (req.body.haslogo === 'true') {
        const uploaded = await uploadImages(req.file('logo'));
        if (uploaded.length === 0) {
          return res.badRequest('No image was uploaded');
        }
        let newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
        req.body.logo = '/' + newPath;
      }

      // const warehouseCreate = await Warehouse.create(req.body).fetch();

      return res.status(200).json(req.body);

    } catch (error) {
      return res.json(error.status, {message: '', error, success: false});
    }
  },

  //Method called for updating a warehouse data
  //Model models/Warehouse.js
  update: async (req, res) => {
    try {
      if (req.body.haslogo === 'true') {
        try {
          const uploaded = await uploadImages(req.file('logo'));
          if (uploaded.length === 0) {
            return res.badRequest('No file was uploaded');
          }
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];

          req.body.logo = '/' + newPath;

        } catch (err) {
          console.log('err', err);
          return res.json(err.status, {err: err});
        }
      }
      const warehouse = await Warehouse.updateOne({id: req.param('id')}).set(req.body);

      return res.json(200, warehouse);
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'Failed to update warehouse',
        error
      });
    }

  }
};

