const {sslcommerzInstance} = require('../../libs/sslcommerz');
const {sslApiUrl} = require('../../config/softbd');

module.exports = {
  placeOrder: async (authUser, requestBody, urlParams, orderDetails, addresses, globalConfigs, cart, cartItems) => {
    console.log('################# placeSSlCommerzOrder ##################### ');

    const {billingAddress, shippingAddress} = addresses;
    const {grandOrderTotal, totalQty} = await PaymentService.calcCartTotal(cart, cartItems);
    let { courierCharge, adminPaymentAddress } = await PaymentService.calcCourierCharge(cartItems, requestBody, urlParams, globalConfigs);

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

    post_body['success_url'] = sslApiUrl + '/ssl-commerz/success/?user_id=' + authUser.id + '&billing_address=' + finalBillingAddressId + '&shipping_address=' + finalShippingAddressId + '&courierCharge=' + requestBody.courierCharge;
    post_body['ipn_url'] = sslApiUrl + '/ssl-commerz/success-ipn/?user_id=' + authUser.id + '&billing_address=' + finalBillingAddressId + '&shipping_address=' + finalShippingAddressId + '&courierCharge=' + requestBody.courierCharge;
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

    post_body['num_of_item'] = totalQty;
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
      console.log('ssl failed');
      throw new Error(sslResponse.failedreason);
    }
    return sslResponse;
  },

  createOrder: async (db, customer, transDetails, addressIds, globalConfigs) => {
    const {paymentType, paidAmount, sslCommerztranId, paymentResponse} = transDetails;

    const {billingAddressId, shippingAddressId} = addressIds;

    let cart = await PaymentService.getCart(customer.id);

    let cartItems = await PaymentService.getCartItems(cart.id);

    let {
      grandOrderTotal,
      totalQty
    } = PaymentService.calcCartTotal(cart, cartItems);

    let courierCharge = await PaymentService.calcCourierCharge(cartItems, shippingAddressId, globalConfigs);

    console.log('courierCharge', courierCharge);

    /** adding shipping charge with grandtotal */
    grandOrderTotal += courierCharge;

    console.log('paidAmount', paidAmount);
    console.log('grandOrderTotal', grandOrderTotal);

    if (!(Math.abs(paidAmount - grandOrderTotal) < Number.EPSILON)) {
      console.log('grandOrderTotal & paid amount miss matched');
      throw new Error('Paid amount and order amount are different.');
    }

    let {subordersTemp, order, allOrderedProductsInventory, allGeneratedCouponCodes} = await PaymentService.placeOrder(customer.id, cart.id, grandOrderTotal, totalQty, billingAddressId, shippingAddressId, courierCharge, cartItems, paymentType, db, sslCommerztranId);

    /** .............Payment Section ........... */

    let paymentTemp = await PaymentService.createPayment(db, subordersTemp, customer, order, paymentType, paymentResponse, sslCommerztranId);

    const allCouponCodes = [];

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

    console.log('successfully created:', orderForMail, allCouponCodes, order, subordersTemp);

    let shippingAddress = await PaymentAddress.find({
      user_id: customer.id
    }).usingConnection(db);

    if(customer.phone || shippingAddress[0].phone){
      await PaymentService.sendSms(customer, order, allCouponCodes, shippingAddress[0]);
    }

    await PaymentService.sendEmail(orderForMail);

    return {
      orderForMail,
      allCouponCodes,
      order,
      subordersTemp
    };
  }
};
