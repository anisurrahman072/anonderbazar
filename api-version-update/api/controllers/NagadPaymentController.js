/**
 * NagadPaymentController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const {sslWebUrl} = require('../../config/softbd');
const logger = require('../../libs/softbd-logger').Logger;
const {getGlobalConfig} = require('../../libs/helper');
const {nagad} = require('../../config/softbd');
const {fetchWithTimeout} = require('../../libs/helper');
const {
  NAGAD_PAYMENT_TYPE
} = require('../../libs/constants');

module.exports = {
  callbackCheckout: async (req, res) => {
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
      let payment_verification_url = nagad.isSandboxMode ? nagad['sandbox'].payment_verification_url : nagad['production'].payment_verification_url;
      payment_verification_url += `${params.payment_ref_id}`;

      let headers = {
        'X-KM-IP-V4': '45.118.63.56',
        'X-KM-Client-Type': 'PC_WEB',
        'X-KM-Api-Version': 'v-0.2.0',
        'Content-Type': 'application/json',
      };

      const options = {
        method: 'GET',
        headers: headers
      };

      let verificationResponse = await fetchWithTimeout(payment_verification_url, options);
      verificationResponse = await verificationResponse.json();

      console.log('Verification result: ', verificationResponse);

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










      res.writeHead(301,
        {
          Location: sslWebUrl + '/checkout'
        }
      );
      res.end();

    } catch (error) {
      res.writeHead(301,
        {
          Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Error occurred while completion of payment!')
        }
      );
      res.end();
    }
  }

};

