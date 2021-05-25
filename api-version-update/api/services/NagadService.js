module.exports = {
  placeOrder: async (authUser, requestBody, urlParams, orderDetails, addresses, globalConfigs, cart, cartItems) => {
    const {
      shippingAddress
    } = addresses;

    let {
      grandOrderTotal,
      totalQty
    } = PaymentService.calcCartTotal(cart, cartItems);

    let courierCharge = await PaymentService.calcCourierCharge(cartItems, shippingAddress.id, globalConfigs);

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
  }
};
