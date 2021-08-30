/**
 * QuestionsController
 */

const {pagination} = require('../../libs/pagination');
const {performance} = require('perf_hooks');


module.exports = {

  /*method called for getting all the products in which a user has asked a question*/
  getAllQuestionedProducts: async (req, res) => {
    try {
      const time1 = performance.now();

      let _pagination = pagination(req.query);

      let rawSQL = `
      SELECT
            product_question_answer.*,
            products.code,
            products.name,
            products.warehouse_id,
            users.first_name,
            users.last_name,
            users.username,
            users.phone,
            warehouses.name AS warehouse_name
        FROM
            product_question_answer
        LEFT JOIN products ON product_question_answer.product_id = products.id
        LEFT JOIN users ON product_question_answer.user_id = users.id
        LEFT JOIN warehouses ON products.warehouse_id = warehouses.id
      `;

      let _where = ' WHERE product_question_answer.deleted_at IS NULL ';

      if (req.query.warehouseId) {
        _where += ` AND products.warehouse_id = ${req.query.warehouseId}`;
      }

      let _sort = '';
      if (req.query.sortKey && req.query.sortValue) {
        _sort += ` ORDER BY product.${req.query.sortKey} ${req.query.sortValue} `;
      } else {
        _sort += ` ORDER BY product_question_answer.id DESC `;
      }

      let limit = ` LIMIT ${_pagination.skip}, ${_pagination.limit} `;

      let finalSQL = rawSQL + _where + _sort + limit;

      const questionedProducts = await sails.sendNativeQuery(finalSQL, []);

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true,
        data: questionedProducts.rows,
        message: 'all questioned products with pagination',
      });
    } catch (error) {
      console.log('error', error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      let message = 'Error in getting all questioned products';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },

  //Method called for deleting a question data
  //Model models/ProductQuestionAnswer.js
  destroy: async (req, res) => {
    try {
      const time1 = performance.now();

      await ProductQuestionAnswer.updateOne({id: req.param('id')}).set({deletedAt: new Date()});

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json({
        success: true,
        message: 'Question successfully deleted',
      });
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.status(400).json({
        success: false,
        message: 'Failed to delete question',
        error
      });
    }
  },

  findOne: async (req, res) => {
    try {
      const time1 = performance.now();

      let rawSQL = `
      SELECT
            product_question_answer.*,
            products.code,
            products.name,
            products.warehouse_id,
            users.first_name,
            users.last_name,
            users.username,
            warehouses.name AS warehouse_name
        FROM
            product_question_answer
        LEFT JOIN products ON product_question_answer.product_id = products.id
        LEFT JOIN users ON product_question_answer.user_id = users.id
        LEFT JOIN warehouses ON products.warehouse_id = warehouses.id
      `;

      let _where = ` WHERE product_question_answer.deleted_at IS NULL AND product_question_answer.id = ${req.params.id}`;

      if (req.query.warehouseId) {
        _where += ` AND products.warehouse_id = ${req.query.warehouseId}`;
      }


      let finalSQL = rawSQL + _where;

      const questionedProducts = await sails.sendNativeQuery(finalSQL, []);
      const questionedProduct = questionedProducts.rows;

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true,
        questionedProduct,
        message: 'all questioned products with pagination',
      });
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      let message = 'Error in read product';
      return res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },

  addAnswer: async (req, res) => {
    try {
      const time1 = performance.now();

      await ProductQuestionAnswer.updateOne({id: req.param('id')})
        .set({answer: req.body.answer, answered_by: req.body.answeredBy});

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json({
        success: true,
        message: 'Answer added successfully'
      });
    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.status(400).json({
        success: false,
        message: 'Failed to add the answer',
        error
      });
    }
  }

};
