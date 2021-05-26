const moment = require('moment');
const _ = require('lodash');
const EmailService = require('./EmailService');
const SmsService = require('./SmsService');
const {bKashCreatePayment, bKashGrandToken, bKashCreateAgreement} = require('../../libs/bkashHelper.js');
const {sslApiUrl} = require('../../config/softbd');
const {sslcommerzInstance} = require('../../libs/sslcommerz');
const {
  generateRandomString,
  EncryptDataWithPublicKey,
  SignatureGenerate,
  HttpPostMethod,
  DecryptDataWithPrivateKey,
  toHexString
} = require('../services/nagad');

module.exports = {

  placeCouponCashbackOrder: async function (authUser, orderDetails, addresses, globalConfigs, courierCharge) {
    const {adminPaymentAddress, billingAddress, shippingAddress} = addresses;
    const {paymentType, grandOrderTotal} = orderDetails;

    let finalBillingAddressId = null;
    let finalShippingAddressId = null;

    if (billingAddress && billingAddress.id) {
      finalBillingAddressId = billingAddress.id;
    } else if (adminPaymentAddress && adminPaymentAddress.id) {
      finalBillingAddressId = adminPaymentAddress.id;
    }

    if (shippingAddress && shippingAddress.id) {
      finalShippingAddressId = shippingAddress.id;
    } else if (adminPaymentAddress && adminPaymentAddress.id) {
      finalShippingAddressId = adminPaymentAddress.id;
    }

    if (finalShippingAddressId === null || finalBillingAddressId === null) {
      throw new Error('No Shipping or Billing Address found!');
    }

    const couponLotteryCashback = await CouponLotteryCashback.findOne({
      user_id: authUser.id,
      deletedAt: null
    });

    if (!(couponLotteryCashback && grandOrderTotal <= couponLotteryCashback.amount)) {
      throw new Error('The customer is not allowed to use cashback with this order.');
    }
    const {
      orderForMail,
      allCouponCodes,
      order,
      noShippingCharge,
    } = await sails.getDatastore()
      .transaction(async (db) => {
        /****** Finalize Order -------------------------- */
        const {
          orderForMail,
          allCouponCodes,
          order,
          subordersTemp,
          noShippingCharge,
        } = await this.createOrder(
          db,
          authUser,
          {
            paymentType: paymentType,
            paidAmount: grandOrderTotal,
            sslCommerztranId: null,
            paymentResponse: {
              'purpose': 'Cashback Payment for coupon code purchase'
            }
          },
          {
            billingAddressId: finalBillingAddressId,
            shippingAddressId: finalShippingAddressId
          },
          globalConfigs,
          courierCharge
        );

        const cashBackAmount = couponLotteryCashback.amount;
        const deductedCashBackAmount = (cashBackAmount - grandOrderTotal);

        await CouponLotteryCashback.updateOne({
          id: couponLotteryCashback.id
        }).set({
          amount: deductedCashBackAmount
        });

        return {
          orderForMail,
          allCouponCodes,
          order,
          subordersTemp,
          noShippingCharge
        };
      });

    try {

      let smsPhone = authUser.phone;

      if (!noShippingCharge && shippingAddress.phone) {
        smsPhone = shippingAddress.phone;
      }

      if (smsPhone) {
        let smsText = `anonderbazar.com এ আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে। অর্ডার নাম্বার: ${order.id}`;
        console.log('smsTxt', smsText);
        if (allCouponCodes && allCouponCodes.length > 0) {
          if (allCouponCodes.length === 1) {
            smsText += ' আপনার স্বাধীনতার ৫০ এর কুপন কোড: ' + allCouponCodes.join(',');
          } else {
            smsText += ' আপনার স্বাধীনতার ৫০ এর কুপন কোডগুলি: ' + allCouponCodes.join(',');
          }
        }
        SmsService.sendingOneSmsToOne([smsPhone], smsText);
      }

    } catch (err) {
      console.log('order sms was not sent!');
      console.log(err);
    }

    try {
      EmailService.orderSubmitMail(orderForMail);
    } catch (err) {
      console.log('order email was not sent!');
      console.log(err);
    }

    return order.id;
  },

  /*placeCashOnDeliveryOrder: async (authUser, orderDetails, addresses, globalConfigs, cart, courierCharge, cartItems) => {
    const {adminPaymentAddress, billingAddress, shippingAddress} = addresses;
    const {paymentType, grandOrderTotal, totalQuantity} = orderDetails;

    try {
      const {
        order,
        orderForMail,
        subordersTemp
      } = await sails.getDatastore()
        .transaction(async (db) => {
          let {subordersTemp, order, allOrderedProductsInventory} = await PaymentService.placeOrder(authUser.id, cart.id, grandOrderTotal, totalQuantity, billingAddress.id, shippingAddress.id, courierCharge, cartItems, paymentType, db);

          let paymentTemp = [];

          for (let i = 0; i < subordersTemp.length; i++) {
            let payment = await Payment.create({
              user_id: authUser.id,
              order_id: order.id,
              suborder_id: subordersTemp[i].id,
              payment_type: paymentType,
              payment_amount: subordersTemp[i].total_price,
              status: 1
            }).fetch().usingConnection(db);

            paymentTemp.push(payment);
          }

          let orderForMail = await PaymentService.findAllOrderedProducts(order.id, db, subordersTemp);

          await PaymentService.updateCart(cart.id, db, cartItems);

          await PaymentService.updateProductInventory(allOrderedProductsInventory, db);

          return {
            order,
            orderForMail,
            subordersTemp
          };
        });

      await PaymentService.sendSms(authUser, order);

      await PaymentService.sendEmail(orderForMail);

      // End /Delete Cart after submitting the order
      let d = Object.assign({}, order);
      d.suborders = subordersTemp;

      return d;
    }
    catch (finalError) {
      console.log('finalError', finalError);
      return res.status(400).json({
        message: 'There was a problem in processing the order.',
        additionalMessage: finalError.message
      });
    }

  },*/

  placeSSlCommerzOrder: async (authUser, orderDetails, addresses, globalConfigs) => {

    console.log('################# placeSSlCommerzOrder ##################### ');

    const {adminPaymentAddress, billingAddress, shippingAddress} = addresses;
    const {grandOrderTotal, totalQuantity} = orderDetails;
    const sslcommerz = sslcommerzInstance(globalConfigs);

    let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
    let string_length = 16;
    let randomstring = '';

    for (let i = 0; i < string_length; i++) {
      let rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }

    let finalBillingAddressId = null;
    let finalShippingAddressId = null;

    if (billingAddress && billingAddress.id) {
      finalBillingAddressId = billingAddress.id;
    } else if (adminPaymentAddress && adminPaymentAddress.id) {
      finalBillingAddressId = adminPaymentAddress.id;
    }

    if (shippingAddress && shippingAddress.id) {
      finalShippingAddressId = shippingAddress.id;
    } else if (adminPaymentAddress && adminPaymentAddress.id) {
      finalShippingAddressId = adminPaymentAddress.id;
    }

    if (finalShippingAddressId === null || finalBillingAddressId === null) {
      throw new Error('No Shipping or Billing Address found!');
    }

    let finalPostalCode = null;
    let finalAddress = null;
    if (shippingAddress && shippingAddress.postal_code) {
      finalPostalCode = shippingAddress.postal_code;
    } else if (adminPaymentAddress && adminPaymentAddress.postal_code) {
      finalPostalCode = adminPaymentAddress.postal_code;
    }
    if (shippingAddress && shippingAddress.address) {
      finalAddress = shippingAddress.address;
    } else if (adminPaymentAddress && adminPaymentAddress.address) {
      finalAddress = adminPaymentAddress.address;
    }

    let post_body = {};
    post_body['total_amount'] = grandOrderTotal;
    post_body['currency'] = 'BDT';
    post_body['tran_id'] = randomstring;

    post_body['success_url'] = sslApiUrl + '/ssl-commerz/success/?user_id=' + authUser.id + '&billing_address=' + finalBillingAddressId + '&shipping_address=' + finalShippingAddressId;
    post_body['ipn_url'] = sslApiUrl + '/ssl-commerz/success-ipn/?user_id=' + authUser.id + '&billing_address=' + finalBillingAddressId + '&shipping_address=' + finalShippingAddressId;
    post_body['fail_url'] = sslApiUrl + '/ssl-commerz/failure/?user_id=' + authUser.id + '&billing_address=' + finalBillingAddressId + '&shipping_address=' + finalShippingAddressId;
    post_body['cancel_url'] = sslApiUrl + '/ssl-commerz/error/?user_id=' + authUser.id + '&billing_address=' + finalBillingAddressId + '&shipping_address=' + finalShippingAddressId;

    post_body['emi_option'] = 0;
    post_body['cus_name'] = authUser.first_name + ' ' + authUser.last_name;
    post_body['cus_email'] = authUser.email ? authUser.email : 'anonderbazar@gmail.com';
    post_body['cus_phone'] = authUser.phone;
    post_body['cus_postcode'] = finalPostalCode ? finalPostalCode : '1212';
    post_body['cus_add1'] = finalAddress ? finalAddress : 'Urban Rose, Suite-3B, House-61, Road-24, Gulshan-1';
    post_body['cus_city'] = 'Dhaka';
    post_body['cus_country'] = 'Bangladesh';
    post_body['shipping_method'] = 'NO';

    post_body['num_of_item'] = totalQuantity;
    post_body['product_name'] = 'Product Name';
    post_body['product_category'] = 'Anonder Bazar';
    post_body['product_profile'] = 'General';

    /*
    console.log('sslcommerz.init_transaction error', error);
      res.writeHead(301,
        {Location: sslWebUrl + '/checkout'}
      );
      res.end();
   */
    console.log('post_body', post_body);

    const sslResponse = await sslcommerz.init_transaction(post_body);
    console.log('sslcommerz.init_transaction success', sslResponse);
    /**
     * status: 'FAILED',
     failedreason: "Invalid Information! 'cus_email' is missing or empty.",

     */
    if (sslResponse && sslResponse.status === 'FAILED') {
      throw new Error(sslResponse.failedreason);
    }
    return sslResponse;
  },
  createBKashPayment: async (authUser, orderDetails, addresses) => {

    const {
      payerReference,
      agreement_id,
      grandOrderTotal
    } = orderDetails;

    const {
      adminPaymentAddress,
      billingAddress,
      shippingAddress
    } = addresses;

    let tokenRes = await bKashGrandToken();

    let finalBillingAddressId = null;
    let finalShippingAddressId = null;

    if (billingAddress && billingAddress.id) {
      finalBillingAddressId = billingAddress.id;
    } else if (adminPaymentAddress && adminPaymentAddress.id) {
      finalBillingAddressId = adminPaymentAddress.id;
    }

    if (shippingAddress && shippingAddress.id) {
      finalShippingAddressId = shippingAddress.id;
    } else if (adminPaymentAddress && adminPaymentAddress.id) {
      finalShippingAddressId = adminPaymentAddress.id;
    }

    if (!(payerReference)) {
      throw new Error('Invalid Request');
    }

    console.log('orderDetails', orderDetails);
    console.log('addresses', addresses);

    if (agreement_id) {
      const userWallets = await BkashCustomerWallet.find({
        user_id: authUser.id,
        agreement_id: agreement_id,
        wallet_no: payerReference,
        row_status: 3,
        deletedAt: null
      });

      if (!(userWallets && userWallets.length > 0)) {
        throw new Error('No bKash Wallet found with the provided agreementID');
      }

      const paymentTransactionLog = await PaymentTransactionLog.create({
        user_id: authUser.id,
        payment_type: 'bKash',
        payment_amount: grandOrderTotal,
        payment_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        status: '1',
        details: JSON.stringify({
          id_token: tokenRes.id_token,
          payerReference,
          agreement_id,
          billingAddressId: finalBillingAddressId,
          shippingAddressId: finalShippingAddressId
        })
      }).fetch();

      const payloadData = {
        'agreementID': agreement_id,
        'mode': '0001',
        'payerReference': payerReference,
        'callbackURL': sslApiUrl + '/bkash-payment/payment-callback/' + authUser.id + '/' + paymentTransactionLog.id,
        'amount': grandOrderTotal,
        'currency': 'BDT',
        'intent': 'sale',
        'merchantInvoiceNumber': paymentTransactionLog.id
      };

      const bKashResponse = await bKashCreatePayment(tokenRes.id_token, payloadData);

      if (bKashResponse.statusMessage === 'Successful' && bKashResponse.transactionStatus === 'Initiated') {
        await PaymentTransactionLog.updateOne({
          id: paymentTransactionLog.id
        }).set({
          status: '2',
          details: JSON.stringify({
            id_token: tokenRes.id_token,
            payerReference,
            agreement_id,
            billingAddressId: finalBillingAddressId,
            shippingAddressId: finalShippingAddressId,
            bKashResponse
          })
        });
        return bKashResponse;
      }

      await PaymentTransactionLog.updateOne({
        id: paymentTransactionLog.id
      }).set({
        status: '99',
        details: JSON.stringify({
          id_token: tokenRes.id_token,
          payerReference,
          agreement_id,
          billingAddressId: finalBillingAddressId,
          shippingAddressId: finalShippingAddressId,
          bKashResponse
        })
      });

      throw new Error('Problem in creating bKash payment');
    }

    const foundAgreements = await BkashCustomerWallet.find({
      user_id: authUser.id,
      wallet_no: payerReference,
      row_status: 3,
      deletedAt: null
    });

    if (foundAgreements && foundAgreements.length > 0) {
      throw new Error('Invalid Payment Reference');
    }

    const callbackURL = sslApiUrl + '/bkash-payment/agreement-callback-checkout/' + authUser.id;

    let bKashAgreementCreateResponse = await bKashCreateAgreement(tokenRes.id_token, authUser.id, payerReference, callbackURL);

    if (bKashAgreementCreateResponse.statusMessage === 'Successful' && bKashAgreementCreateResponse.agreementStatus === 'Initiated') {
      await BkashCustomerWallet.create({
        user_id: authUser.id,
        wallet_no: bKashAgreementCreateResponse.payerReference,
        payment_id: bKashAgreementCreateResponse.paymentID,
        full_response: JSON.stringify({
          id_token: tokenRes.id_token,
          billingAddressId: finalBillingAddressId,
          shippingAddressId: finalShippingAddressId,
          bKashAgreementCreateResponse,
        })
      });
      return bKashAgreementCreateResponse;
    }
    throw new Error(JSON.stringify(bKashAgreementCreateResponse));
  },

  placeNagadPaymentOrder: async (authUser, orderDetails, addresses, globalConfigs, courierCharge, ip) => {
    const {
      adminPaymentAddress,
      billingAddress,
      shippingAddress
    } = addresses;

    const {
      grandOrderTotal
    } = orderDetails;

    let finalBillingAddressId = null;
    let finalShippingAddressId = null;

    if (billingAddress && billingAddress.id) {
      finalBillingAddressId = billingAddress.id;
    } else if (adminPaymentAddress && adminPaymentAddress.id) {
      finalBillingAddressId = adminPaymentAddress.id;
    }

    if (shippingAddress && shippingAddress.id) {
      finalShippingAddressId = shippingAddress.id;
    } else if (adminPaymentAddress && adminPaymentAddress.id) {
      finalShippingAddressId = adminPaymentAddress.id;
    }

    const paymentTransactionLog = await PaymentTransactionLog.create({
      user_id: authUser.id,
      payment_type: 'nagad',
      payment_amount: grandOrderTotal,
      payment_date: moment().format('YYYY-MM-DD HH:mm:ss'),
      status: '1',
      details: JSON.stringify({
        billingAddressId: finalBillingAddressId,
        shippingAddressId: finalShippingAddressId
      })
    }).fetch();


    /** Driver code for Nagad Integration */

    let currentDate = new Date().toISOString().replace(/-/g, '');
    currentDate = currentDate.replace(/[T]+/g, '');
    currentDate = currentDate.substring(0, 8);

    let time = new Date().toLocaleTimeString('en-US', {hour12: false});
    time = time.replace(/:/g, '');
    time = time.replace(/[a-zA-Z]+/g, '');
    time = time.replace(/ /g, '');

    const merchantId = '683002007104225';
    const dateTime = currentDate + time;
    const amount = '5';
    const orderId = generateRandomString();
    const challenge = toHexString(generateRandomString(40));

    const PostURL = `http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs/check-out/initialize/${merchantId}/${orderId}`;

    const callbackURL = sslApiUrl + '/nagad-payment/callback-checkout/' + authUser.id;


    let SensitiveData = {
      merchantId,
      dateTime,
      orderId,
      challenge
    };

    const PostData = {
      accountNumber: '01958083901',
      dateTime: dateTime,
      sensitiveData: EncryptDataWithPublicKey(JSON.stringify(SensitiveData)),
      signature: SignatureGenerate(JSON.stringify(SensitiveData))
    };

    let result_Data = await HttpPostMethod(PostURL, PostData, ip);

    /*if(result_Data && result_Data['sensitiveData'] && result_Data['signature']){
      if(result_Data['sensitiveData'] !== '' && result_Data['signature'] !== ''){
        let PlainResponse = JSON.parse(DecryptDataWithPrivateKey(result_Data['sensitiveData']));

        if (PlainResponse['paymentReferenceId'] && PlainResponse['challenge']) {
          const paymentReferenceId = PlainResponse['paymentReferenceId'];
          const randomServer = PlainResponse['challenge'];

          let SensitiveDataOrder = {
            merchantId: MerchantID,
            orderId: OrderId,
            currencyCode: '050',
            amount: amount,
            challenge: randomServer
          };

          let PostDataOrder = {
            sensitiveData: EncryptDataWithPublicKey(JSON.stringify(SensitiveDataOrder)),
            signature: SignatureGenerate(JSON.stringify(SensitiveDataOrder)),
            merchantCallbackURL: callbackURL
          };

          let OrderSubmitUrl = `http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs/check-out/complete/${paymentReferenceId}`;
          let Result_Data_Order = HttpPostMethod(OrderSubmitUrl, PostDataOrder);

          if(Result_Data_Order && Result_Data_Order['status'] === 'Success'){
            let url = JSON.stringify(Result_Data_Order['callBackUrl']);
          }
          else {
            console.log('Error occurred', Result_Data_Order);
          }
        }
      }
    }*/
  },

  /*createOrder: async function (db, customer, transDetails, addressIds, globalConfigs, productCourierCharge) {

    const {paymentType, paidAmount, sslCommerztranId, paymentResponse} = transDetails;

    const {billingAddressId, shippingAddressId} = addressIds;

    let cart = await PaymentService.getCart(customer.id);

    if (!cart) {
      throw new Error('Associated Shipping Cart was not found!');
    }

    let cartItems = await PaymentService.getCartItems(cart.id);

    if (!cartItems || cartItems.length === 0) {
      throw new Error('Associated Shipping Cart Items were not found!');
    }

    let {
      grandOrderTotal,
      totalQty
    } = calcCartTotal(cart, cartItems);

    let noShippingCharge = false;

    if (cartItems && cartItems.length > 0) {

      const couponProductFound = cartItems.filter((cartItem) => {
        return cartItem.product_id && !!cartItem.product_id.is_coupon_product;
      });

      let productFreeShippingFound = cartItems.filter(item => {
        return (item.product_id && item.product_id.free_shipping);
      });

      noShippingCharge = (couponProductFound && couponProductFound.length > 0 && cartItems.length === couponProductFound.length) || (
        productFreeShippingFound && productFreeShippingFound.length > 0 && cartItems.length === productFreeShippingFound.length
      );

      console.log('noShippingCharge',noShippingCharge);
    }

    let shippingAddress = await PaymentAddress.findOne({
      id: shippingAddressId
    }).usingConnection(db);

    if (!shippingAddress) {
      throw new Error('Associated Shipping Address was not found!');
    }

    let courierCharge = 0;
    if (!noShippingCharge) {
      if (shippingAddress && shippingAddress.id) {
        // eslint-disable-next-line eqeqeq
        courierCharge = globalConfigs.outside_dhaka_charge;
        if (productCourierCharge) {
          courierCharge = productCourierCharge;
        } else if (shippingAddress.zila_id == dhakaZilaId) {
          courierCharge = globalConfigs.dhaka_charge;
        }
      } else {
        courierCharge = globalConfigs.outside_dhaka_charge;
      }
    }

    console.log('courierCharge', courierCharge);
    grandOrderTotal += courierCharge;

    console.log('paidAmount', paidAmount);
    console.log('grandOrderTotal', grandOrderTotal);

    if (!(Math.abs(paidAmount - grandOrderTotal) < Number.EPSILON)) {
      throw new Error('Paid amount and order amount are different.');
    }

    let {subordersTemp, order, allOrderedProductsInventory, allGeneratedCouponCodes} = await PaymentService.placeOrder(customer.id, cart.id, grandOrderTotal, totalQty, billingAddressId, shippingAddressId, courierCharge, cartItems, paymentType, db, sslCommerztranId);

    /!** .............Payment Section ........... *!/

    let paymentTemp = [];

    const allCouponCodes = [];

    for (let i = 0; i < subordersTemp.length; i++) {
      let paymentObj = await Payment.create({
        user_id: customer.id,
        order_id: order.id,
        suborder_id: subordersTemp[i].id,
        payment_type: paymentType,
        payment_amount: subordersTemp[i].total_price,
        details: JSON.stringify(paymentResponse),
        transection_key: sslCommerztranId,
        status: 1
      }).fetch().usingConnection(db);

      paymentTemp.push(paymentObj);
    }

    if (allGeneratedCouponCodes.length > 0) {
      const couponCodeLen = allGeneratedCouponCodes.length;
      for (let i = 0; i < couponCodeLen; i++) {
        let couponObject = await ProductPurchasedCouponCode.create(allGeneratedCouponCodes[i]).fetch().usingConnection(db);
        if (couponObject && couponObject.id) {
          allCouponCodes.push('1' + _.padStart(couponObject.id, 6, '0'));
        }
      }
    }

    // Start/Delete Cart after submitting the order
    let orderForMail = await PaymentService.findAllOrderedProducts(order.id, db, subordersTemp);
    orderForMail.payments = paymentTemp;

    await PaymentService.updateCart(cart.id, db, cartItems);

    await PaymentService.updateProductInventory(allOrderedProductsInventory, db);

    console.log('successfully created:', orderForMail, allCouponCodes, order, subordersTemp, noShippingCharge, shippingAddress);

    return {
      orderForMail,
      allCouponCodes,
      order,
      subordersTemp,
      noShippingCharge,
      shippingAddress
    };

  },*/

  bKashSaveOrder: async function (bKashResponse, transactionLogId, transactionDetails, customer, globalConfigs) {

    await PaymentTransactionLog.updateOne({
      id: transactionLogId
    }).set({
      status: 3,
      details: JSON.stringify({
        id_token: transactionDetails.id_token,
        payerReference: bKashResponse.payerReference,
        agreement_id: bKashResponse.agreementID,
        billingAddressId: transactionDetails.billingAddressId,
        shippingAddressId: transactionDetails.shippingAddressId,
        bKashResponse
      })
    });

    const {
      orderForMail,
      allCouponCodes,
      order,
      noShippingCharge,
      shippingAddress
    } = await sails.getDatastore()
      .transaction(async (db) => {
        /****** Finalize Order -------------------------- */

        const {
          orderForMail,
          allCouponCodes,
          order,
          subordersTemp,
          noShippingCharge,
          shippingAddress
        } = await this.createOrder(
          db,
          customer, {
            paymentType: 'bKash',
            paidAmount: parseFloat(bKashResponse.amount),
            sslCommerztranId: null,
            paymentResponse: bKashResponse
          },
          {
            billingAddressId: transactionDetails.billingAddressId,
            shippingAddressId: transactionDetails.shippingAddressId
          },
          globalConfigs
        );

        await PaymentTransactionLog.updateOne({
          id: transactionLogId
        }).set({
          order_id: order.id,
        }).usingConnection(db);

        return {
          orderForMail,
          allCouponCodes,
          order,
          subordersTemp,
          noShippingCharge,
          shippingAddress
        };

      });

    try {
      let smsPhone = customer.phone;

      if (!noShippingCharge && shippingAddress.phone) {
        smsPhone = shippingAddress.phone;
      }

      if (smsPhone) {
        let smsText = `anonderbazar.com এ আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে। অর্ডার নাম্বার: ${order.id}`;
        console.log('smsTxt', smsText);
        if (allCouponCodes && allCouponCodes.length > 0) {
          if (allCouponCodes.length === 1) {
            smsText += ' আপনার স্বাধীনতার ৫০ এর কুপন কোড: ' + allCouponCodes.join(',');
          } else {
            smsText += ' আপনার স্বাধীনতার ৫০ এর কুপন কোডগুলি: ' + allCouponCodes.join(',');
          }
        }
        SmsService.sendingOneSmsToOne([smsPhone], smsText);
      }

    } catch (err) {
      console.log('order sms was not sent!');
      console.log(err);
    }

    try {
      EmailService.orderSubmitMail(orderForMail);
    } catch (err) {
      console.log('order email was not sent!');
      console.log(err);
    }

    return order;

  }
};
