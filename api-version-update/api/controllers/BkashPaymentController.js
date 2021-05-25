/**
 * BkashPaymentController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const {getAuthUser} = require('../../libs/helper');
const {bKashCancelAgreement} = require('../services/bKash');
const {calcCartTotal} = require('../../libs/helper');
const {sslWebUrl, sslApiUrl, dhakaZilaId} = require('../../config/softbd');
const {
  bKashGrandToken,
  bKashCreateAgreement,
  bKashExecutePayment,
  bKashExecuteAgreement,
  bKasQueryPayment
} = require('../services/bKash');

module.exports = {

  authUserWallets: async (req, res) => {
    try {
      const authUser = req.token.userInfo;
      const userWallets = await BkashCustomerWallet.find({
        user_id: authUser.id,
        row_status: 3,
        deletedAt: null
      });
      return res.status(200).json(userWallets);
    } catch (error) {
      sails.log(error);
      return res.status(400).json(error);
    }
  },
  grandToken: async (req, res) => {

    try {
      let tokenRes = await bKashGrandToken();

      return res.status(200).json(tokenRes);
    } catch (error) {
      sails.log(error);
      return res.status(400).json(error);
    }

  },
  createAgreement: async (req, res) => {

    sails.log('createAgreement', req.query);
    if (!req.query.id_token) {
      return res.status(422).json({
        statusMessage: 'Invalid Request',
        statusCode: 'Oppps!'
      });
    }

    try {

      const authUser = getAuthUser(req);
      const callbackURL = sslApiUrl + '/bkash-payment/agreement-callback/' + authUser.id;

      let tokenRes = await bKashCreateAgreement(req.query.id_token, authUser.id, req.query.wallet_no, callbackURL);

      if (tokenRes.statusMessage === 'Successful' && tokenRes.agreementStatus === 'Initiated') {
        const bkashCustomerWallet = await BkashCustomerWallet.create({
          user_id: authUser.id,
          wallet_no: tokenRes.payerReference,
          payment_id: tokenRes.paymentID,
          full_response: JSON.stringify({id_token: req.query.id_token, ...tokenRes})
        }).fetch();
        sails.log(tokenRes);
        return res.status(200).json({
          tokenRes,
          bkashCustomerWallet
        });
      }

      return res.status(422).json(tokenRes);

    } catch (error) {
      sails.log(error);
      return res.status(400).json(error);
    }
  },
  cancelAgreement: async (req, res) => {

    if (!(req.body.id_token && req.body.agreement_id)) {
      return res.status(422).json({
        statusMessage: 'Invalid Request',
        statusCode: 'Oppps!'
      });
    }
    try {

      const authUser = getAuthUser(req);

      const foundAgreements = await BkashCustomerWallet.find({
        agreement_id: req.body.agreement_id,
        user_id: authUser.id,
        row_status: 3,
        deletedAt: null
      });

      if (!(foundAgreements && foundAgreements.length > 0)) {
        return res.status(422).json({
          statusMessage: 'Invalid Request',
          statusCode: 'Oppps!'
        });
      }

      let cancelAgreementRes = await bKashCancelAgreement(req.body.id_token, req.body.agreement_id);

      if (cancelAgreementRes.statusMessage === 'Successful' && cancelAgreementRes.agreementStatus === 'Cancelled') {
        const bkashCustomerWallet = await BkashCustomerWallet.updateOne({
          id: foundAgreements[0].id
        }).set({
          deletedAt: new Date()
        });

        return res.status(200).json(bkashCustomerWallet);
      }

      return res.status(422).json(cancelAgreementRes);

    } catch (error) {
      sails.log(error);
      return res.status(400).json(error);
    }
  },
  agreementCallback: async (req, res) => {
    sails.log('agreementCallback');
    sails.log(req.query);

    let customer = await User.findOne({id: req.param('id'), deletedAt: null});

    if (!customer) {

      res.writeHead(301, {
        Location: sslWebUrl + '/profile/bkash-accounts?bKashError=' + encodeURIComponent('Invalid Request! Customer was not found!')
      });

      res.end();

      return;
    }

    try {
      const userWallets = await BkashCustomerWallet.find({
        user_id: customer.id,
        payment_id: req.query.paymentID,
        row_status: 1
      });

      if (!(userWallets && userWallets.length === 1)) {

        res.writeHead(301, {
          Location: sslWebUrl + '/profile/bkash-accounts?bKashError=' + encodeURIComponent('Invalid Request!')
        });

        res.end();

        return;
      }

      const userWallet = userWallets[0];

      if (req.query.status === 'success') {

        userWallet.full_response = JSON.parse(userWallet.full_response);

        await BkashCustomerWallet.updateOne({
          id: userWallet.id
        })
          .set({
            row_status: 2
          });

        const bKashResponse = await bKashExecuteAgreement(userWallet.full_response.id_token, req.query.paymentID);

        if (bKashResponse.agreementStatus === 'Completed' && bKashResponse.statusMessage === 'Successful') {
          await BkashCustomerWallet.updateOne({
            id: userWallet.id
          }).set({
            row_status: 3,
            payment_id: bKashResponse.paymentID,
            agreement_id: bKashResponse.agreementID,
            full_response: JSON.stringify({id_token: userWallet.full_response.id_token, ...bKashResponse})
          });
        }

        res.writeHead(301, {
          Location: sslWebUrl + '/profile/bkash-accounts?bKashSuccess=' + encodeURIComponent('bKash Payment Agreement Successfully Created!')
        });

        res.end();
        return;
      }

      let messageToShow = '';
      if (req.query.status === 'failure') {
        messageToShow = 'Your Agreement Creation Request has failed';
      } else {
        messageToShow = 'Your Agreement Creation Request has been cancelled';
      }

      await BkashCustomerWallet.updateOne({
        id: userWallet.id
      }).set({
        row_status: 99
      });

      res.writeHead(301, {
        Location: sslWebUrl + '/profile/bkash-accounts?bKashError=' + encodeURIComponent(messageToShow)
      });

      res.end();

    } catch (error) {
      sails.log(error);
      res.writeHead(301, {
        Location: sslWebUrl + '/profile/bkash-accounts?bKashError=' + encodeURIComponent('Problem in generating bKash Payment Agreement')
      });
      res.end();
    }
  },
  paymentCallback: async (req, res) => {

    sails.log('paymentCallback');
    sails.log(req.query);

    if (!(req.param('userId') && req.param('paymentTransId') && req.query.paymentID && req.query.status)) {

      res.writeHead(301, {
        Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Invalid request')
      });
      res.end();
      return;
    }

    try {
      const customer = getAuthUser(req);
      const globalConfigs = await getGlobalConfig();

      const transactionLog = await PaymentTransactionLog.findOne({
        id: req.param('paymentTransId'),
        user_id: req.param('userId'),
        deletedAt: null
      });

      sails.log('transactionLog', transactionLog);

      // eslint-disable-next-line eqeqeq
      if (!(transactionLog && transactionLog.id && transactionLog.status == 2)) {
        throw new Error('Invalid bkash order request!');
      }

      const transactionDetails = JSON.parse(transactionLog.details);

      sails.log('transactionDetails', transactionDetails);

      if (!(transactionDetails.id_token && transactionDetails.bKashResponse && transactionDetails.payerReference &&
        transactionDetails.shippingAddressId && transactionDetails.billingAddressId)) {
        throw new Error('Invalid bkash order request!');
      }

      if (req.query.status === 'success') {
        try {
          const bKashResponse = await bKashExecutePayment(transactionDetails.id_token, {
            paymentID: req.query.paymentID
          });

          if (!(bKashResponse && bKashResponse.statusMessage === 'Successful' && bKashResponse.transactionStatus === 'Completed')) {
            await PaymentTransactionLog.updateOne({
              id: transactionLog.id
            }).set({
              details: JSON.stringify({
                id_token: transactionDetails.id_token,
                payerReference: transactionDetails.payerReference,
                billingAddressId: transactionDetails.billingAddressId,
                shippingAddressId: transactionDetails.shippingAddressId,
                bKashResponse
              })
            });
            let messageToSend = 'There was a problem in processing the order.';
            if (bKashResponse && bKashResponse.statusMessage) {
              messageToSend = bKashResponse.statusMessage;
            }
            throw new Error(messageToSend);
          }

          const order = await bKashSaveOrder(bKashResponse, transactionLog.id, transactionDetails, customer, globalConfigs);

          if (order && order.id) {
            res.writeHead(301,
              {Location: sslWebUrl + '/checkout?order=' + order.id}
            );
            res.end();
            return;
          }

          throw new Error('There was a problem in processing the order.');

        } catch (bKashExecuteError) {
          if (bKashExecuteError.name === 'AbortError') {
            const bKashResponse = await bKasQueryPayment(transactionDetails.id_token, {
              paymentID: req.query.paymentID
            });

            const order = await bKashSaveOrder(bKashResponse, transactionLog.id, transactionDetails, customer, globalConfigs);

            if (order && order.id) {
              res.writeHead(301,
                {Location: sslWebUrl + '/checkout?order=' + order.id}
              );
              res.end();
              return;
            }
            res.writeHead(301, {
              Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('There was a problem in processing the order.')
            });
            res.end();
            return;
          }

          throw bKashExecuteError;
        }
      }

      let messageToShow = '';
      if (req.query.status === 'failure') {
        messageToShow = 'Your bKash Payment Creation Request has failed';
      } else {
        messageToShow = 'Your bKash Payment Creation Request has been cancelled';
      }

      await PaymentTransactionLog.updateOne({
        id: transactionLog.id
      }).set({
        status: 99,
        details: JSON.stringify({
          id_token: transactionDetails.id_token,
          payerReference: transactionDetails.payerReference,
          billingAddressId: transactionDetails.billingAddressId,
          shippingAddressId: transactionDetails.shippingAddressId,
          bKashResponse: req.query
        })
      });

      res.writeHead(301, {
        Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent(messageToShow)
      });
      res.end();

    } catch (error) {
      sails.log(error);

      res.writeHead(301, {
        Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent(error.message)
      });
      res.end();
    }

  },
  agreementCallbackCheckout: async (req, res) => {

    sails.log(req.query);

    try {

      let globalConfigs = await GlobalConfigs.findOne({
        deletedAt: null
      });

      if (!globalConfigs) {

        res.writeHead(301, {
          Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Global config was not found!')
        });
        res.end();
        return;
      }

      let customer = await User.findOne({id: req.param('userId'), deletedAt: null});

      if (!customer) {

        res.writeHead(301, {
          Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Customer was not found!')
        });
        res.end();
        return;
      }

      let cart = await Cart.findOne({
        user_id: customer.id,
        deletedAt: null
      });

      let cartItems = await CartItem.find({
        cart_id: cart.id,
        deletedAt: null
      })
        .populate('cart_item_variants')
        .populate('product_id');

      let {
        grandOrderTotal,
        totalQty
      } = calcCartTotal(cart, cartItems);

      const userWallets = await BkashCustomerWallet.find({
        user_id: customer.id,
        payment_id: req.query.paymentID,
        row_status: 1,
        deletedAt: null
      });

      if (!(userWallets && userWallets.length === 1)) {

        res.writeHead(301, {
          Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Invalid Request')
        });
        res.end();
        return;
      }

      const userWallet = userWallets[0];

      userWallet.full_response = JSON.parse(userWallet.full_response);

      if (!(userWallet.full_response.id_token && userWallet.full_response.billingAddressId && userWallet.full_response.shippingAddressId)) {

        res.writeHead(301, {
          Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Invalid Request')
        });
        res.end();
        return;
      }

      const billingAddress = await PaymentAddress.findOne({id: userWallet.full_response.billingAddressId});
      const shippingAddress = await PaymentAddress.findOne({id: userWallet.full_response.shippingAddressId});

      if (!(shippingAddress && shippingAddress.id && billingAddress && billingAddress.id)) {
        res.writeHead(301, {
          Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Invalid Request')
        });
        res.end();
        return;
      }

      let noShippingCharge = false;
      if (cartItems && cartItems.length > 0) {
        const couponProductFound = cartItems.filter((cartItem) => {
          return cartItem.product_id && !!cartItem.product_id.is_coupon_product;
        });
        noShippingCharge = couponProductFound && couponProductFound.length > 0 && cartItems.length === couponProductFound.length;
      }

      if (!noShippingCharge) {
        // eslint-disable-next-line eqeqeq
        let shippingCharge = shippingAddress.zila_id == dhakaZilaId ? globalConfigs.dhaka_charge : globalConfigs.outside_dhaka_charge;
        grandOrderTotal += shippingCharge;
      }

      if (req.query.status === 'success') {

        await BkashCustomerWallet.updateOne({
          id: userWallet.id
        })
          .set({
            row_status: 2
          });

        const bKashExecAgreementResponse = await bKashExecuteAgreement(userWallet.full_response.id_token, req.query.paymentID);

        if (bKashExecAgreementResponse.agreementStatus === 'Completed' && bKashExecAgreementResponse.statusMessage === 'Successful') {
          await BkashCustomerWallet.updateOne({
            id: userWallet.id
          }).set({
            row_status: 3,
            payment_id: bKashExecAgreementResponse.paymentID,
            agreement_id: bKashExecAgreementResponse.agreementID,
            full_response: JSON.stringify({
              ...userWallet.full_response,
              bKashExecAgreementResponse
            })
          });

          const bKashPaymentResponse = await createBKashPayment(customer, {
            payerReference: bKashExecAgreementResponse.payerReference,
            agreement_id: bKashExecAgreementResponse.agreementID,
            grandOrderTotal,
            totalQuantity: totalQty
          }, {
            adminPaymentAddress: null,
            billingAddress: billingAddress,
            shippingAddress: shippingAddress
          });

          res.writeHead(301, {
            Location: sslWebUrl + '/checkout?bkashURL=' + encodeURIComponent(bKashPaymentResponse.bkashURL)
          });

          res.end();
          return;
        }

        await BkashCustomerWallet.updateOne({
          id: userWallet.id
        }).set({
          row_status: 99,
          full_response: JSON.stringify({
            ...userWallet.full_response,
            bKashExecAgreementResponse
          })
        });
      } else {
        await BkashCustomerWallet.updateOne({
          id: userWallet.id
        }).set({
          row_status: 99,
          full_response: JSON.stringify({
            ...userWallet.full_response,
            callbackResponse: req.query
          })
        });
      }

      res.writeHead(301, {
        Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('There was a problem in creating the bKash Payment Agreement')
      });
      res.end();

    } catch (error) {
      sails.log(error);
      res.writeHead(301, {
        Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('There was a problem in creating the bKash Payment Agreement')
      });
      res.end();
    }
  }
};
