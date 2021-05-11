/**
 * MissingOrderController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const {sslcommerzInstance} = require('../../libs/sslcommerz');
const {dhakaZilaId} = require('../../config/softbd');
const _ = require('lodash');
const countTotalPrice = require('../../libs/helper');

module.exports = {
  findSSLTransaction: async (req, res) => {
    try {
      console.log('req asce');

      let usernameTmp = req.body.username;
      if (usernameTmp.charAt(0) === '+') {
        usernameTmp = usernameTmp.substr(1);
      } else if (usernameTmp.charAt(0) === '0') {
        usernameTmp = '88' + usernameTmp;
      } else if (!(usernameTmp.charAt(0) === '8' || usernameTmp.charAt(1) === '8')) {
        usernameTmp = '0' + usernameTmp;
      }
      console.log('-----------------------------------------');
      console.log(req.body.username, usernameTmp, req.body.ssl_transaction_id);

      const users = await User.find({
        username: usernameTmp,
        deletedAt: null
      });

      console.log(users);
      if (!(users && users.length > 0)) {
        return res.status(400).json({
          success: false,
          message: 'User not found!'
        });
      }

      const customer = users[0];

      let shippingAddress = await PaymentAddress.find({
        user_id: customer.id,
        deletedAt: null
      }).populate('division_id')
        .populate('zila_id')
        .populate('upazila_id');

      if (_.isUndefined(shippingAddress) || _.isEmpty(shippingAddress)) {
        return res.status(400).json({
          success: false,
          message: 'No shipping address found for the user!'
        });
      }

      let globalConfigs = await GlobalConfigs.findOne({
        deletedAt: null
      });

      console.log('tttt', globalConfigs);
      const sslcommerz = sslcommerzInstance(globalConfigs);
      console.log('qqqqq', sslcommerz);

      // const validationResponse = await sslcommerz.validate_transaction_order(req.body.val_id);
      const transResponse = await sslcommerz.transaction_status_id(req.body.ssl_transaction_id);

      console.log('transResponse: ', transResponse);

      if (transResponse && transResponse.no_of_trans_found) {
        const noOfTrans = parseInt(transResponse.no_of_trans_found, 10);
        if (!(noOfTrans > 0 && transResponse.element && transResponse.element.length > 0 &&
          (transResponse.element[0].status &&
            (transResponse.element[0].status === 'VALID' || transResponse.element[0].status === 'VALIDATED')))) {
          return res.status(400).json({
            success: false,
            message: 'Invalid SSL Commerz Transaction ID'
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid SSL Commerz Transaction ID'
        });
      }

      const sslCommerzResponse = transResponse.element[0];

      const numberOfOrderFound = await Order.count().where({
        ssl_transaction_id: req.body.ssl_transaction_id
      });

      if (numberOfOrderFound > 0) {
        return res.status(400).json({
          success: false,
          message: 'This SSL Commerz Transaction ID is already exists in database.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Successfully found the transaction details from SSL commerz',
        data: sslCommerzResponse,
        shippingAddress,
        customer
      });

    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error occurred while fetching SSL Transaction ID info',
        error
      });
    }
  },

  generateMissingOrders: async (req, res) => {
    try {
      console.log('asce', req.body);
      let allProducts = JSON.parse(req.body.products);
      let totalQty = allProducts.length;

      let total_price = await countTotalPrice(allProducts, req.body.shippingAddress.zila_id);
      console.log('asce2', total_price);


      await sails.getDatastore()
        .transaction(async (db) => {
          const carts = await Cart.update({user_id: req.body.customerId}, {deletedAt: new Date()}).fetch().usingConnection(db);
          const cartIds = carts.map((cart) => cart.id);
          console.log('cartIds', cartIds);


          if (cartIds && cartIds.length > 0) {
            await CartItem.update({cart_id: cartIds}, {deletedAt: new Date()}).usingConnection(db);
          }

          let cart = await Cart.create({
            user_id: req.body.customerId,
            ip_address: '',
            total_quantity: totalQty,
            total_price: total_price,
            status: 1
          }).fetch().usingConnection(db);
          console.log('cart result: ', cart);

          let cartItem;
          allProducts.map(async product => {
            let productUnitPrice = product.promotion ? parseFloat(product.promo_price) : parseFloat(product.price);
            cartItem = await CartItem.create({
              cart_id: cart.id,
              product_id: product.id,
              product_unit_price: productUnitPrice,
              product_quantity: product.orderQuantity,
              product_total_price: productUnitPrice * product.orderQuantity
            }).fetch().usingConnection(db);
          });
          console.log('cartItem: ', cartItem);


          const order = await Order.create({
            user_id: req.body.customerId,
            cart_id: cart.id,
            total_price: total_price,
            total_quantity: totalQty,
            billing_address: req.body.shippingAddress.id,
            shipping_address: req.body.shippingAddress.id,
            ssl_transaction_id: req.body.ssl_transaction_id,
            status: 1,
            courier_charge: 0,
            courier_status: 0,
          }).fetch().usingConnection(db);
          console.log('order: ', order);



          let productsByWarehouseId = _.keyBy(allProducts, 'warehouse_id');
          console.log('productsByWarehouseId: ',productsByWarehouseId);

          for (const warehouseProducts in productsByWarehouseId) {
            let products = [...productsByWarehouseId[warehouseProducts]];
            console.log;
            let totalPrice = await countTotalPrice(products, req.body.shippingAddress.zila_id);

            const suborder = await Suborder.create({
              product_order_id: order.id,
              warehouse_id: products[0].warehouse_id,
              total_price: totalPrice,
              total_quantity: products.length,
              status: 1
            }).fetch().usingConnection(db);

            products.map(async product => {
              const suborderItem = await SuborderItem.create({
                product_suborder_id: suborder.id,
                product_id: product.id,
                warehouse_id: products[0].warehouse_id,
                product_quantity: product.orderQuantity,
                product_total_price: product.orderQuantity,
                status: 1
              }).fetch().usingConnection(db);
            });
          }
        });


    } catch (error) {

    }
  }

};

