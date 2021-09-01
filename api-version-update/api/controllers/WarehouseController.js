/**
 * WarehouseController
 *
 * @description :: Server-side logic for managing warehouses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {pagination} = require('../../libs/pagination');
const {uploadImages} = require('../../libs/helper');
const {performance} = require('perf_hooks');
const Promise = require('bluebird');
module.exports = {
  //Method called for getting all warehouse data
  //Model models/Warehouse.js
  getAll: async (req, res) => {
    try {
      const time1 = performance.now();

      const warehouseQuery = Promise.promisify(Warehouse.getDatastore().sendNativeQuery);
      let _pagination = pagination(req.query);


      let rawSelect = `
        SELECT
            warehouses.id as id,
            warehouses.code as code,
            warehouses.name as name,
            warehouses.phone as phone,
            warehouses.email as email,
            warehouses.status as status,
            warehouses.buffer_time as buffer_time,
            warehouses.upazila_id as upazila_id,
            warehouses.zila_id as zila_id,
            warehouses.division_id as division_id,
            division.name as division_name,
            zilla.name as zilla_name,
            upazila.name as upazila_name
            `;

      let fromSQL = ' FROM warehouses as warehouses  ';
      fromSQL += ' LEFT JOIN areas as division ON division.id = warehouses.division_id   ';
      fromSQL += ' LEFT JOIN areas as zilla ON zilla.id = warehouses.zila_id   ';
      fromSQL += ' LEFT JOIN areas as upazila ON upazila.id = warehouses.upazila_id   ';

      let _where = ` WHERE warehouses.deleted_at IS NULL `;

      let query = req.query;
      if (query.warehouse_id) {
        _where += ` AND warehouses.id = '${parseInt(query.warehouse_id)}' `;
      }

      if (query.warehouseName) {
        _where += ` AND warehouses.name LIKE '%${query.warehouseName}%' `;
      }

      let _sort = ' ORDER BY warehouses.created_at DESC ';

      const totalWarehousesRaw = await warehouseQuery('SELECT COUNT(*) as totalCount ' + fromSQL + _where, []);

      let totalWarehouses = 0;
      let allWarehouses = [];
      if (totalWarehousesRaw && totalWarehousesRaw.rows && totalWarehousesRaw.rows.length > 0) {
        totalWarehouses = totalWarehousesRaw.rows[0].totalCount;
        _pagination.limit = _pagination.limit ? _pagination.limit : totalWarehouses;

        let limitSQL = ` LIMIT ${_pagination.skip}, ${_pagination.limit} `;
        const rawResult = await warehouseQuery(rawSelect + fromSQL + _where + _sort + limitSQL, []);

        allWarehouses = rawResult.rows;
      }

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      res.status(200).json({
        success: true,
        total: totalWarehouses,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All Warehouses with pagination',
        data: allWarehouses
      });
    } catch (error) {
      let message = 'Error in Get All Warehouses with pagination';

      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);
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
      const time1 = performance.now();

      await Warehouse.updateOne({id: req.param('id')}).set({deletedAt: new Date()});

      await User.update({warehouse_id: req.param('id')}).set({deletedAt: new Date()});

      await Product.update({warehouse_id: req.param('id')}).set({deletedAt: new Date()});

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json({
        success: false,
        message: 'Warehouse successfully deleted',
      });
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);
      res.status(400).json({
        success: false,
        message: 'Failed to delete warehouse',
        error
      });
    }
  },
  //Method called for creating a warehouse data
  //Model models/Warehouse.js
  createCustom: async (req, res) => {
    try {
      const time1 = performance.now();


      console.log(req.body);
      let postBody = {...req.body};
      // console.log(postBody);

      try {
        postBody.userdata = JSON.parse(postBody.userdata);
      } catch (__) {
        sails.log.error(`Request Uri: ${req.path} ########## ${error}`);
        return res.status(422).json({
          success: false,
          message: 'Invalid User data'
        });
      }
      let userData = postBody.userdata;
      delete postBody.userdata;


      try {

        if ((postBody.hasLogo && postBody.hasLogo === 'true') || (postBody.hasAvatar && postBody.hasAvatar === 'true')) {
          const uploaded = await uploadImages(req.file('image'));
          if (uploaded.length === 0) {
            return res.badRequest('No file was uploaded');
          }

          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
          if (postBody.hasLogo && postBody.hasLogo === 'true' && postBody.hasAvatar && postBody.hasAvatar === 'true') {
            postBody.logo = '/' + newPath;
            if (typeof uploaded[1] !== 'undefined') {
              const newPathBanner = uploaded[1].fd.split(/[\\//]+/).reverse()[0];
              userData.avatar = '/' + newPathBanner;
            }
          } else if (postBody.hasLogo && postBody.hasLogo === 'true') {
            postBody.logo = '/' + newPath;
          } else if (postBody.hasAvatar && postBody.hasAvatar === 'true') {
            userData.avatar = '/' + newPath;
          }
        }

      } catch (err) {
        console.log('err', err);
        sails.log.error(`Request Uri: ${req.path} ########## ${error}`);
        return res.status(err.status).json({err: err});
      }

      const {
        warehouse,
        user
      } = await sails.getDatastore()
        .transaction(async (db) => {
          postBody.status = 0;
          const warehouse = await Warehouse.create(postBody).fetch().usingConnection(db);

          userData.warehouse_id = warehouse.id;
          userData.active = 1;
          userData.group_id = 4; // 4 for owner / warehouse

          let user = await User.create(userData).fetch().usingConnection(db);

          return {
            warehouse,
            user
          };
        });

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        user,
        warehouse
      });

    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);
      return res.status(400).json({message: 'Something went wrong!', error});
    }
  },

  //Method called for updating a warehouse data
  //Model models/Warehouse.js
  updateCustom: async (req, res) => {
    try {
      const time1 = performance.now();

      console.log('update warehouse', req.body);
      let postBody = {...req.body};

      try {
        postBody.userdata = JSON.parse(postBody.userdata);
      } catch (__) {
        return res.status(422).json({
          success: false,
          message: 'Invalid User data'
        });
      }
      let userData = postBody.userdata;
      delete postBody.userdata;

      try {

        if ((postBody.hasLogo && postBody.hasLogo === 'true') || (postBody.hasAvatar && postBody.hasAvatar === 'true')) {
          const uploaded = await uploadImages(req.file('image'));
          if (uploaded.length === 0) {
            return res.badRequest('No file was uploaded');
          }
          console.log(uploaded);
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
          if (postBody.hasLogo && postBody.hasLogo === 'true' && postBody.hasAvatar && postBody.hasAvatar === 'true') {
            postBody.logo = '/' + newPath;
            if (typeof uploaded[1] !== 'undefined') {
              const newPathBanner = uploaded[1].fd.split(/[\\//]+/).reverse()[0];
              userData.avatar = '/' + newPathBanner;
            }
          } else if (postBody.hasLogo && postBody.hasLogo === 'true') {
            postBody.logo = '/' + newPath;
          } else if (postBody.hasAvatar && postBody.hasAvatar === 'true') {
            userData.avatar = '/' + newPath;
          }
        }

      } catch (err) {
        console.log('err', err);
        sails.log.error(`Request Uri: ${req.path} ########## ${error}`);
        return res.status(err.status).json({err: err});
      }

      const {warehouse, user} = await sails.getDatastore()
        .transaction(async (db) => {
          postBody.status = 0;
          const warehouse = await Warehouse.updateOne({id: req.param('id')}).set(postBody).usingConnection(db);

          const userId = userData.id;
          delete userData.id;

          let user = await User.updateOne({id: userId}).set(userData).usingConnection(db);

          return {
            warehouse,
            user
          };
        });

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        user,
        warehouse
      });
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);
      res.status(400).json({
        success: false,
        message: 'Failed to update warehouse',
        error
      });
    }
  },

  updateUserStatus: async (req, res) => {
    try {
      const time1 = performance.now();

      const status = req.body.status;
      await Warehouse.updateOne({id: req.param('id')}).set({status: status});
      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true,
        message: 'Use status updated successfully'
      });

    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);
      res.status(400).json({
        success: false,
        message: 'Failed to update user status',
        error: error
      });
    }
  }
};

