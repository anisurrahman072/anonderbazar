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

    post_body['success_url'] = sslApiUrl + '/sslCommerz/sslCommerzSuccess/?user_id=' + authUser.id + '&billing_address=' + finalBillingAddressId + '&shipping_address=' + finalShippingAddressId;
    post_body['fail_url'] = sslApiUrl + '/sslCommerz/sslCommerzFail/?user_id=' + authUser.id + '&billing_address=' + finalBillingAddressId + '&shipping_address=' + finalShippingAddressId;
    post_body['cancel_url'] = sslApiUrl + '/sslCommerz/sslCommerzError/?user_id=' + authUser.id + '&billing_address=' + finalBillingAddressId + '&shipping_address=' + finalShippingAddressId;

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
  bKashPayment: async (authUser, orderDetails, globalConfigs) => {

    /*const userWallets = await BkashCustomerWallet.find({
      user_id: authUser,id,
      payment_id: req.query.paymentID,
      row_status: 1
    });*/
    const {
      payerReference,
      agreement_id,
      grandOrderTotal,
      totalQuantity: totalQty
    } = orderDetails;

    let tokenRes = await this.bKashGrandToken();

    if (payerReference){
      try {

      } catch (error){

      }
    }
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
