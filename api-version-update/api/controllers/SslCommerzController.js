const {PAYMENT_STATUS_PARTIALLY_PAID, PAYMENT_STATUS_PAID, SSL_COMMERZ_PAYMENT_TYPE} = require('../../libs/constants');
const {hasPaymentTransactionBeenUsed, getPaymentRowPartial} = require('../services/PaymentService');
const {getGlobalConfig} = require('../../libs/helper');
const {sslWebUrl} = require('../../config/softbd');
const {sslcommerzInstance} = require('../../libs/sslcommerz');
const logger = require('../../libs/softbd-logger').Logger;

module.exports = {

  ipnPaymentSuccess: async function (req, res) {
    logger.orderLogAuth(req, '################ sslcommerz success IPN');
    logger.orderLogAuth(req, req.body);

    if (!(req.body.tran_id && req.query.user_id && req.body.val_id && req.query.billing_address && req.query.shipping_address)) {
      return res.status(422).json({
        failure: true
      });
    }

    try {
      let globalConfigs = await getGlobalConfig();

      let customer = await PaymentService.getTheCustomer(req.query.user_id);

      const sslcommerz = sslcommerzInstance(globalConfigs);
      const validationResponse = await sslcommerz.validate_transaction_order(req.body.val_id);

      logger.orderLog(customer.id,'validationResponse-sslCommerzIpnSuccess', validationResponse);

      if (!(validationResponse && (validationResponse.status === 'VALID' || validationResponse.status === 'VALIDATED'))) {
        return res.status(422).json({
          failure: true
        });
      }

      const hasAlreadyBeenUsed = await hasPaymentTransactionBeenUsed(SSL_COMMERZ_PAYMENT_TYPE, req.body.tran_id);

      if (hasAlreadyBeenUsed) {
        return res.status(422).json({
          failure: true
        });
      }

      let cart = await PaymentService.getCart(customer.id);
      let cartItems = await PaymentService.getCartItems(cart.id);
      let courierCharge = PaymentService.calcCourierCharge(cartItems, req.query.shipping_address.zila_id, globalConfigs);

      let {
        grandOrderTotal,
        totalQty
      } = PaymentService.calcCartTotal(cart, cartItems);

      logger.orderLog(customer.id, 'courierCharge', courierCharge);
      logger.orderLog(customer.id, 'GrandOrderTotal', grandOrderTotal);

      /** adding shipping charge with grandtotal */
      grandOrderTotal += courierCharge;
      logger.orderLog(customer.id, 'Final GrandOrderTotal', grandOrderTotal);
      const paidAmount = parseFloat(validationResponse.amount);

      logger.orderLog(customer.id, 'paidAmount', paidAmount);

      if (!(Math.abs(paidAmount - grandOrderTotal) < Number.EPSILON)) {
        logger.orderLog(customer.id,'grandOrderTotal & paid amount miss matched');
        throw new Error('Paid amount and order amount are different.');
      }

      const {
        order,
        suborders,
        payments,
        allCouponCodes,
      } = await sails.getDatastore()
        .transaction(async (db) => {
          /****** Finalize Order -------------------------- */
          const {
            order,
            suborders,
            payments,
            allCouponCodes,
          } = await SslCommerzService.createOrder(
            db,
            customer,
            {
              paymentType: SSL_COMMERZ_PAYMENT_TYPE,
              sslCommerztranId: req.body.tran_id,
              paymentResponse: req.body
            },
            {
              billingAddressId: req.query.billing_address,
              shippingAddressId: req.query.shipping_address
            },
            {
              courierCharge,
              grandOrderTotal,
              totalQty,
              cart,
              cartItems
            },
            globalConfigs,
          );
          return {
            order,
            suborders,
            payments,
            allCouponCodes,
          };
        });

      let shippingAddress = await PaymentAddress.find({
        user_id: customer.id
      });

      let orderForMail = await PaymentService.findAllOrderedProducts(order.id, suborders);
      orderForMail.payments = payments;

      if (customer.phone || (shippingAddress && shippingAddress.length > 0 && shippingAddress[0].phone)) {
        await PaymentService.sendSms(customer, order, allCouponCodes, shippingAddress[0]);
      }

      await PaymentService.sendEmail(orderForMail);

      return res.status(200).json({
        success: true
      });
    } catch (finalError) {
      console.log('finalError', finalError);
      return res.status(400).json({
        failure: true
      });
    }
  },
  //Method called when sslCommerzSuccess from frontend
  paymentSuccess: async function (req, res) {
    logger.orderLogAuth(req, '################ sslcommerz success');
    logger.orderLogAuth(req, req.body);

    if (!(req.body.tran_id && req.query.user_id && req.body.val_id && req.query.billing_address && req.query.shipping_address)) {

      res.writeHead(301,
        {
          Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Invalid Request')
        }
      );
      res.end();
      return;
    }

    try {
      let globalConfigs = await getGlobalConfig();

      let customer = await PaymentService.getTheCustomer(req.query.user_id);

      const sslcommerz = sslcommerzInstance(globalConfigs);
      const validationResponse = await sslcommerz.validate_transaction_order(req.body.val_id);

      logger.orderLog(customer.id,'validationResponse-sslCommerzSuccess', validationResponse);

      if (!(validationResponse && (validationResponse.status === 'VALID' || validationResponse.status === 'VALIDATED'))) {
        throw new Error('SSL Commerz Payment Validation Failed!');
      }

      const ordersFound = await Order.find({
        ssl_transaction_id: req.body.tran_id,
        deletedAt: null
      });

      if (ordersFound && Array.isArray(ordersFound) && ordersFound.length > 0) {
        res.writeHead(301,
          {
            Location: sslWebUrl + '/checkout?order=' + ordersFound[0].id
          }
        );
        res.end();
        return;
      }

      const paidAmount = parseFloat(validationResponse.amount);

      let cart = await PaymentService.getCart(customer.id);
      let cartItems = await PaymentService.getCartItems(cart.id);
      let courierCharge = PaymentService.calcCourierCharge(cartItems, req.query.shipping_address.zila_id, globalConfigs);

      let {
        grandOrderTotal,
        totalQty
      } = PaymentService.calcCartTotal(cart, cartItems);

      /** adding shipping charge with grandtotal */
      grandOrderTotal += courierCharge;

      if (!(Math.abs(paidAmount - grandOrderTotal) < Number.EPSILON)) {
        console.log('grandOrderTotal & paid amount miss matched');
        throw new Error('Paid amount and order amount are different.');
      }

      const {
        order,
        suborders,
        payments,
        allCouponCodes,
      } = await sails.getDatastore()
        .transaction(async (db) => {
          /****** Finalize Order -------------------------- */
          const {
            order,
            suborders,
            payments,
            allCouponCodes,
          } = await SslCommerzService.createOrder(
            db,
            customer,
            {
              paymentType: SSL_COMMERZ_PAYMENT_TYPE,
              paidAmount,
              sslCommerztranId: req.body.tran_id,
              paymentResponse: req.body
            },
            {
              billingAddressId: req.query.billing_address,
              shippingAddressId: req.query.shipping_address
            },
            {
              courierCharge,
              grandOrderTotal,
              totalQty,
              cart,
              cartItems
            },
            globalConfigs
          );
          return {
            order,
            suborders,
            payments,
            allCouponCodes,
          };
        });

      let shippingAddress = await PaymentAddress.find({
        user_id: customer.id
      });
      let orderForMail = await PaymentService.findAllOrderedProducts(order.id, suborders);
      orderForMail.payments = payments;

      if (customer.phone || (shippingAddress && shippingAddress.length > 0 && shippingAddress[0].phone)) {
        await PaymentService.sendSms(customer, order, allCouponCodes, shippingAddress[0]);
      }

      await PaymentService.sendEmail(orderForMail);

      res.writeHead(301,
        {
          Location: sslWebUrl + '/checkout?order=' + order.id
        }
      );
      res.end();
    } catch (finalError) {
      console.log('finalError', finalError);

      res.writeHead(301,
        {
          Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent(finalError.message)
        }
      );
      res.end();
    }
  },
  //Method called when sslCommerzFail fails sends redirectory route
  paymentFailure: function (req, res) {
    res.writeHead(301,
      {Location: sslWebUrl + '/checkout'}
    );
    res.end();
  },
  //Method called when sslCommerzError error sends redirectory route
  paymentError: function (req, res) {
    res.writeHead(301,
      {Location: sslWebUrl + '/checkout'}
    );
    res.end();
  },
  ipnPaymentSuccessForPartial: async function (req, res) {
    console.log('################ SSLCOMMERZ success IPN (Partial)', req.body);
    const tranId = req.body.tran_id;

    if (!(tranId && req.query.user_id && req.query.order_id && req.body.val_id && req.query.billing_address && req.query.shipping_address)) {
      return res.status(422).json({
        failure: true
      });
    }
    try {
      let globalConfigs = await getGlobalConfig();

      let customer = await PaymentService.getTheCustomer(req.query.user_id);

      const order = await Order.findOne({id: req.query.order_id, deletedAt: null})
        .populate('shipping_address');

      if (!order) {
        throw new Error('Order doesn\'t exist.');
      }

      const sslcommerz = sslcommerzInstance(globalConfigs);
      const validationResponse = await sslcommerz.validate_transaction_order(req.body.val_id);

      logger.orderLog(customer.id,'validationResponse-sslCommerzIpnSuccess', validationResponse);

      if (!(validationResponse && (validationResponse.status === 'VALID' || validationResponse.status === 'VALIDATED'))) {
        return res.status(422).json({
          failure: true
        });
      }

      const hasAlreadyBeenUsed = await hasPaymentTransactionBeenUsed(SSL_COMMERZ_PAYMENT_TYPE, tranId);

      if (hasAlreadyBeenUsed) {
        return res.status(422).json({
          failure: true
        });
      }

      let paidAmount = parseFloat(validationResponse.amount);

      await sails.getDatastore()
        .transaction(async (db) => {

          let pay = await Payment.create({
            transection_key: tranId,
            payment_amount: paidAmount,
            user_id: customer.id,
            order_id: order.id,
            payment_type: SSL_COMMERZ_PAYMENT_TYPE,
            details: JSON.stringify(req.body),
            status: 1
          }).fetch().usingConnection(db);

          const totalPrice = parseFloat(order.total_price);
          const totalPaidAmount = parseFloat(order.paid_amount) + paidAmount;

          let paymentStatus = PAYMENT_STATUS_PARTIALLY_PAID;
          if (totalPrice <= totalPaidAmount) {
            paymentStatus = PAYMENT_STATUS_PAID;
          }

          await Order.updateOne({id: order.id}).set({
            paid_amount: totalPaidAmount,
            payment_status: paymentStatus,
          }).usingConnection(db);

        });

      const shippingAddress = order.shipping_address;

      if (customer.phone || (shippingAddress && shippingAddress.phone)) {
        await PaymentService.sendSms(customer, order, [], shippingAddress);
      }

      return res.status(200).json({
        success: true
      });
    } catch (finalError) {
      console.log('finalError', finalError);
      return res.status(400).json({
        failure: true
      });
    }
  },
  paymentSuccessPartial: async function (req, res) {
    const tranId = req.body.tran_id;
    if (!(tranId && req.query.user_id && req.body.val_id && req.query.billing_address && req.query.shipping_address)) {

      res.writeHead(301,
        {
          Location: sslWebUrl + '/profile/orders?bKashError=' + encodeURIComponent('Invalid Payment Request')
        }
      );
      res.end();
      return;
    }
    try {
      let globalConfigs = await getGlobalConfig();

      let customer = await PaymentService.getTheCustomer(req.query.user_id);

      const order = await Order.findOne({id: req.query.order_id, deletedAt: null})
        .populate('shipping_address');

      if (!order) {
        throw new Error('Order doesn\'t exist.');
      }

      const sslcommerz = sslcommerzInstance(globalConfigs);
      const validationResponse = await sslcommerz.validate_transaction_order(req.body.val_id);

      if (!(validationResponse && (validationResponse.status === 'VALID' || validationResponse.status === 'VALIDATED'))) {
        throw new Error('SSL Commerz Payment Validation Failed!');
      }


      const numberOfTransaction = await hasPaymentTransactionBeenUsed(SSL_COMMERZ_PAYMENT_TYPE, tranId);

      if (numberOfTransaction) {
        res.writeHead(301,
          {
            Location: sslWebUrl + '/profile/orders/invoice/' + order.id
          }
        );
        res.end();
        return;
      }

      let paidAmount = parseFloat(validationResponse.amount);

      await sails.getDatastore()
        .transaction(async (db) => {

          let pay = await Payment.create({
            transection_key: tranId,
            payment_amount: paidAmount,
            user_id: customer.id,
            order_id: order.id,
            payment_type: SSL_COMMERZ_PAYMENT_TYPE,
            details: JSON.stringify(req.body),
            status: 1
          }).fetch().usingConnection(db);

          const totalPrice = parseFloat(order.total_price);
          const totalPaidAmount = parseFloat(order.paid_amount) + paidAmount;

          let paymentStatus = 2;
          if (totalPrice <= totalPaidAmount) {
            paymentStatus = 3;
          }

          await Order.updateOne({id: order.id}).set({
            paid_amount: totalPaidAmount,
            payment_status: paymentStatus,
          }).usingConnection(db);

        });

      const shippingAddress = order.shipping_address;

      if (customer.phone || (shippingAddress && shippingAddress.phone)) {
        await PaymentService.sendSms(customer, order, [], shippingAddress);
      }

      res.writeHead(301,
        {
          Location: sslWebUrl + '/profile/orders/invoice/' + order.id
        }
      );
      res.end();

    } catch (finalError) {
      console.log(finalError);
      res.writeHead(301,
        {
          Location: sslWebUrl + '/profile/orders?bKashError=' + encodeURIComponent(finalError.message)
        }
      );
      res.end();
    }
  },
  paymentFailurePartial: async function (req, res) {
    console.log(finalError);
    res.writeHead(301,
      {
        Location: sslWebUrl + '/profile/orders?bKashError=' + encodeURIComponent('Payment Canceled')
      }
    );
    res.end();
  },
  paymentErrorPartial: async function (req, res) {
    console.log(finalError);
    res.writeHead(301,
      {
        Location: sslWebUrl + '/profile/orders?bKashError=' + encodeURIComponent('Payment Canceled')
      }
    );
    res.end();
  },
};
