const logger = require('../../libs/softbd-logger').Logger;
const {PAYMENT_STATUS_UNPAID, OFFLINE_PAYMENT_TYPE, BANK_TRANSFER_OFFLINE_PAYMENT, PENDING_PAYMENT_APPROVAL_STATUS} = require('../../libs/constants');
const {uploadImages} = require('../../libs/helper');


module.exports = {
  placeOrder: async (authUser, requestBody, urlParams, orderDetails, addresses, globalConfigs, cart, cartItems, requestFile) => {
    const {
      billingAddress,
      shippingAddress
    } = addresses;

    let {
      grandOrderTotal,
      totalQty
    } = await PaymentService.calcCartTotal(cart, cartItems);
    console.log('offline: RRRRR: total', grandOrderTotal);

    logger.orderLog(authUser.id, 'GrandOrderTotal', grandOrderTotal);

    let courierCharge = PaymentService.calcCourierCharge(cartItems, shippingAddress.zila_id, globalConfigs);
    console.log('offline: RRRRR: courier', courierCharge);

    logger.orderLog(authUser.id, 'Courier Charge: ', courierCharge);

    /** adding shipping charge with grandtotal */
    grandOrderTotal += courierCharge;

    logger.orderLog(authUser.id, 'final GrandOrderTotal', grandOrderTotal);

    let finalPostalCode = shippingAddress.postal_code;
    let finalAddress = shippingAddress.address;

    if (!finalPostalCode) {
      throw new Error('No Post Code has been provided.');
    }
    if (!finalAddress) {
      throw new Error('No address has been provided.');
    }

    console.log('Request body: ', requestBody);

    /** Creating payment details */
    let paymentDetails = {
      offline_payment_method: requestBody.offlinePaymentMethod
    };

    if (requestBody.offlinePaymentMethod === BANK_TRANSFER_OFFLINE_PAYMENT) {
      paymentDetails = {
        ...paymentDetails,
        ...JSON.parse(requestBody.bankTransfer)
      };
    } else {
      if (requestBody.hasImage === 'true') {
        const uploaded = await uploadImages(requestFile('image'));
        if (uploaded.length === 0) {
          throw new Error('No image was uploaded');
        }
        const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];

        paymentDetails.money_receipt = newPath;
      }
    }
    /** END */

    const order =
      await sails.getDatastore()
        .transaction(async (db) => {
          let {
            suborders,
            order,
            allOrderedProductsInventory,
          } = await PaymentService.createOrder(db, {
            user_id: authUser.id,
            cart_id: cart.id,
            total_price: grandOrderTotal,
            paid_amount: 0,
            payment_status: PAYMENT_STATUS_UNPAID,
            total_quantity: totalQty,
            billing_address: billingAddress.id,
            shipping_address: shippingAddress.id,
            courier_charge: courierCharge,
            courier_status: 1
          }, cartItems);

          /** .............Payment Section ........... */
          await PaymentService.createPayment(db, suborders, {
            user_id: authUser.id,
            order_id: order.id,
            payment_type: OFFLINE_PAYMENT_TYPE,
            details: JSON.stringify(paymentDetails),
            status: 1,
            approval_status: PENDING_PAYMENT_APPROVAL_STATUS
          });

          await PaymentService.updateCart(cart.id, db, cartItems);

          await PaymentService.updateProductInventory(allOrderedProductsInventory, db);

          logger.orderLog(authUser.id, 'offline order successfully created:', order);

          return order;
        });
    return order;
  },

  makePartialPayment: async function(customer, order, request, globalConfigs){
    const amountToPay = parseFloat(request.body.amount_to_pay);
    if (amountToPay <= 0) {
      throw new Error('Invalid Payment Amount.');
    }

    /** Creating payment details */
    let paymentDetails = {
      offline_payment_method: request.body.offlinePaymentMethod
    };

    if (request.body.offlinePaymentMethod === BANK_TRANSFER_OFFLINE_PAYMENT) {
      paymentDetails = {
        ...paymentDetails,
        ...JSON.parse(request.body.bankTransfer)
      };
    } else {
      if (request.body.hasImage === 'true') {
        const uploaded = await uploadImages(request.file('image'));
        if (uploaded.length === 0) {
          throw new Error('No image was uploaded');
        }
        const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];

        paymentDetails.money_receipt = newPath;
      }
    }
    /** END */

    await sails.getDatastore()
      .transaction(async (db) => {
        await Order.updateOne({
          id: order.id
        }, {
          partial_offline_payment_approval_status: 1
        }).usingConnection(db);

        await Payment.create({
          payment_amount: amountToPay,
          user_id: customer.id,
          order_id: order.id,
          payment_type: OFFLINE_PAYMENT_TYPE,
          details: JSON.stringify(paymentDetails),
          status: 1
        }).fetch().usingConnection(db);

      });
  }
};
