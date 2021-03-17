const moment = require('moment');
const {bKashCreatePayment} = require('./bKash');
const {bKashGrandToken} = require('./bKash');
const {sslApiUrl} = require('../../config/softbd');
const {sslcommerzInstance} = require('../../libs/sslcommerz');
module.exports = {
  placeSSlCommerzOrder: async (authUser, orderDetails, addresses, globalConfigs) => {

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
    post_body['fail_url'] = sslApiUrl + '/ssl-commerz/failure/?user_id=' + authUser.id + '&billing_address=' + finalBillingAddressId + '&shipping_address=' + finalShippingAddressId;
    post_body['cancel_url'] = sslApiUrl + '/ssl-commerz/error/?user_id=' + authUser.id + '&billing_address=' + finalBillingAddressId + '&shipping_address=' + finalShippingAddressId;

    post_body['emi_option'] = 0;
    post_body['cus_name'] = authUser.first_name + ' ' + authUser.last_name;
    post_body['cus_email'] = authUser.email;
    post_body['cus_phone'] = authUser.phone;
    post_body['cus_postcode'] = finalPostalCode ? finalPostalCode : '1212';
    post_body['cus_add1'] = finalAddress ? finalAddress : 'Urban Rose, Suite-3B, House-61, Road-24, Gulshan-1';
    post_body['cus_city'] = 'Dhaka';
    post_body['cus_country'] = 'Bangladesh';
    post_body['shipping_method'] = 'NO';
    // post_body['multi_card_name'] = ""
    post_body['num_of_item'] = totalQuantity;
    post_body['product_name'] = 'Test';
    post_body['product_category'] = 'Anonder Bazar';
    post_body['product_profile'] = 'general';

    /*
    console.log('sslcommerz.init_transaction error', error);
      res.writeHead(301,
        {Location: sslWebUrl + '/checkout'}
      );
      res.end();
   */
    const sslResponse = await sslcommerz.init_transaction(post_body);
    console.log('sslcommerz.init_transaction success', sslResponse);
    return sslResponse;
  },
  bKashPayment: async (authUser, orderDetails, addresses, globalConfigs) => {
    const {
      payerReference,
      agreement_id,
      grandOrderTotal,
      totalQuantity
    } = orderDetails;

    const {
      adminPaymentAddress,
      billingAddress,
      shippingAddress
    } = addresses;

    const userWallets = await BkashCustomerWallet.find({
      user_id: authUser.id,
      agreement_id: agreement_id,
      row_status: 3,
      deletedAt: null
    });

    if (!(userWallets && userWallets.length > 0)) {
      throw new Error('Invalid Request');
    }

    let tokenRes = await bKashGrandToken();

    if (agreement_id) {

      const paymentTransactionLog = await PaymentTransactionLog.create({
        user_id: authUser.id,
        payment_type: 'bKash',
        payment_amount: grandOrderTotal,
        payment_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        status: '1',
        details: JSON.stringify({
          payerReference,
          agreement_id,
          adminPaymentAddressId: adminPaymentAddress ? adminPaymentAddress.id : null,
          billingAddressId: billingAddress.id,
          shippingAddressId: shippingAddress.id
        })
      }).fetch();

      const payloadData = {
        'agreementID': agreement_id,
        'mode': '0001',
        'payerReference': payerReference,
        'callbackURL': 'http://api.test.anonderbazar.com/api/v1/bkash-payment/payment-callback/' + authUser.id + '/' + paymentTransactionLog.id,
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
            bKashResponse,
            payerReference,
            adminPaymentAddressId: adminPaymentAddress ? adminPaymentAddress.id : null,
            billingAddressId: billingAddress.id,
            shippingAddressId: shippingAddress.id,
          })
        });
        return bKashResponse;
      }

      throw new Error('Problem in creating bKash payment');
    }
    return false;
  },
  calcCartTotal: function (cart, cartItems) {
    let grandOrderTotal = 0;
    let totalQty = 0;
    cartItems.forEach((cartItem) => {
      if (cartItem.product_id && cartItem.product_id.id && cartItem.product_quantity > 0) {
        grandOrderTotal += cartItem.product_total_price;
        totalQty += cartItem.product_quantity;
      }
    });
    return {
      grandOrderTotal,
      totalQty
    };
  },

};
