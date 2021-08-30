/**
 * NagadPaymentController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const {sslWebUrl} = require('../../config/softbd');
const logger = require('../../libs/softbd-logger').Logger;
const {getGlobalConfig} = require('../../libs/helper');
const {
  NAGAD_PAYMENT_TYPE,
  PAYMENT_STATUS_PARTIALLY_PAID,
  PAYMENT_STATUS_PAID,
  APPROVED_PAYMENT_APPROVAL_STATUS
} = require('../../libs/constants');
const {ORDER_STATUSES} = require('../../libs/orders');
const {verifyPayment} = require('../../libs/nagadHelper');
const {performance} = require('perf_hooks');

module.exports = {
  callbackCheckout: async (req, res) => {
    const time1 = performance.now();

    let params = req.allParams();
    console.log('Nagad Response Is: ', params);
    if (!params) {
      res.writeHead(301,
        {
          Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Response from Nagad is not found!.')
        }
      );
      res.end();
      return;
    }

    let customer = await PaymentService.getTheCustomer(params.user_id);
    if (!customer) {
      res.writeHead(301,
        {
          Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Provided customer was not found.')
        }
      );
      res.end();
      return;
    }

    logger.orderLog(customer.id, '################ Nagad Response', '');
    logger.orderLog(customer.id, 'Nagad Response Body', params);

    if (params.status === 'Aborted') {
      res.writeHead(301,
        {
          Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Payment has been canceled by Customer')
        }
      );
      res.end();
      return;
    } else if (params.status !== 'Success') {
      res.writeHead(301,
        {
          Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent(params.message)
        }
      );
      res.end();
      return;
    }

    if (!(params.issuer_payment_ref && params.payment_ref_id && params.user_id && params.billingAddress_id && params.shippingAddress_id)) {
      res.writeHead(301,
        {
          Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Payment information not found!')
        }
      );
      res.end();
      return;
    }

    try {
      let verificationResponse = await verifyPayment(params.payment_ref_id);
      if(!(verificationResponse && verificationResponse.amount && verificationResponse.issuerPaymentRefNo && verificationResponse.status === 'Success')){
        res.writeHead(301,
          {
            Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Illegal payment found!')
          }
        );
        res.end();
        return;
      }

      const paidAmount = parseFloat(verificationResponse.amount);
      const transactionId = verificationResponse.issuerPaymentRefNo;
      const globalConfigs = await getGlobalConfig();
      const shippingAddress = await PaymentService.getAddress(params.billingAddress_id);
      if (!shippingAddress) {
        throw new Error('Provided Shipping Address was not found!');
      }

      let cart = await PaymentService.getCart(customer.id);
      let cartItems = await PaymentService.getCartItems(cart.id);
      let courierCharge = PaymentService.calcCourierCharge(cartItems, shippingAddress.zila_id, globalConfigs);

      let {
        grandOrderTotal,
        totalQty
      } = await PaymentService.calcCartTotal(cart, cartItems);

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
          } = await NagadService.createOrder(
            db,
            customer,
            {
              paymentType: NAGAD_PAYMENT_TYPE,
              paidAmount,
              paymentResponse: verificationResponse
            },
            {
              billingAddressId: params.billingAddress_id,
              shippingAddressId: params.shippingAddress_id
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

      logger.orderLog(customer.id, 'paymentSuccess - Order Created', order);

      let orderForMail = await PaymentService.findAllOrderedProducts(order.id, suborders);
      orderForMail.payments = payments;

      if (customer.phone || (shippingAddress && shippingAddress.phone)) {
        await PaymentService.sendSms(customer, order, allCouponCodes, shippingAddress);
      }

      await PaymentService.sendEmail(orderForMail);

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      res.writeHead(301,
        {
          Location: sslWebUrl + '/checkout?order=' + order.id
        }
      );
      res.end();

    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.writeHead(301,
        {
          Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Error occurred while completion of payment!')
        }
      );
      res.end();
    }
  },

  callbackCheckoutForPartial: async (req, res) => {
    const time1 = performance.now();

    let params = req.allParams();

    if (!params) {
      res.writeHead(301,
        {
          Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Response from Nagad is not found!.')
        }
      );
      res.end();
      return;
    }

    let customer = await PaymentService.getTheCustomer(params.user_id);
    if (!customer) {
      res.writeHead(301,
        {
          Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Provided customer was not found.')
        }
      );
      res.end();
      return;
    }

    logger.orderLog(customer.id, '################ Nagad Response', '');
    logger.orderLog(customer.id, 'Nagad Response Body', params);

    if (params.status === 'Aborted') {
      res.writeHead(301,
        {
          Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Payment has been canceled by Customer')
        }
      );
      res.end();
      return;
    } else if (params.status !== 'Success') {
      res.writeHead(301,
        {
          Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Payment not completed!')
        }
      );
      res.end();
      return;
    }

    if (!(params.issuer_payment_ref && params.payment_ref_id && params.user_id && params.product_order_id && params.billingAddress_id && params.shippingAddress_id)) {
      res.writeHead(301,
        {
          Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Payment information not found!')
        }
      );
      res.end();
      return;
    }

    try {
      let globalConfigs = await getGlobalConfig();

      logger.orderLog(customer.id, 'IPN Payment Success Partial (req body)', params);

      const order = await Order.findOne({id: params.product_order_id, deletedAt: null})
        .populate('shipping_address');

      if (!order) {
        throw new Error('Order doesn\'t exist.');
      }

      let verificationResponse = await verifyPayment(params.payment_ref_id);
      if(!(verificationResponse && verificationResponse.amount && verificationResponse.issuerPaymentRefNo && verificationResponse.status === 'Success')){
        res.writeHead(301,
          {
            Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Illegal payment found!')
          }
        );
        res.end();
        return;
      }

      const paidAmount = parseFloat(verificationResponse.amount);
      const transactionId = verificationResponse.issuerPaymentRefNo;

      await sails.getDatastore()
        .transaction(async (db) => {

          await Payment.create({
            transection_key: transactionId,
            payment_amount: paidAmount,
            user_id: customer.id,
            order_id: order.id,
            payment_type: NAGAD_PAYMENT_TYPE,
            details: JSON.stringify(verificationResponse),
            status: 1,
            approval_status: APPROVED_PAYMENT_APPROVAL_STATUS
          }).fetch().usingConnection(db);

          const totalPrice = parseFloat(order.total_price);
          const totalPaidAmount = parseFloat(order.paid_amount) + paidAmount;

          let paymentStatus = PAYMENT_STATUS_PARTIALLY_PAID;
          let orderStatus = ORDER_STATUSES.pending;
          if (totalPrice <= totalPaidAmount) {
            paymentStatus = PAYMENT_STATUS_PAID;
            orderStatus = ORDER_STATUSES.processing;

            await Suborder.update({product_order_id: order.id}, {status: ORDER_STATUSES.processing});
          }

          await Order.updateOne({id: order.id}).set({
            paid_amount: totalPaidAmount,
            payment_status: paymentStatus,
            status: orderStatus
          }).usingConnection(db);
        });

      logger.orderLog(customer.id, 'Nagad Payment Success Partial - Order Updated');

      const shippingAddress = order.shipping_address;

      if (customer.phone || (shippingAddress && shippingAddress.phone)) {
        await PaymentService.sendSmsForPartialPayment(customer, shippingAddress, order.id, {
          paidAmount: paidAmount,
          transaction_id: transactionId
        });
      }

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      res.writeHead(301,
        {
          Location: sslWebUrl + '/profile/orders/invoice/' + order.id
        }
      );
      res.end();
    } catch (error){
      logger.orderLogAuth(req, error);
      console.log('finalError', error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.writeHead(301,
        {
          Location: sslWebUrl + '/profile/orders'
        }
      );
      res.end();
    }
  }
};

