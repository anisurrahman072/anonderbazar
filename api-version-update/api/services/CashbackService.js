const {getCurrentUserCashBack} = require('../../libs/cashBackHelper');
const {
  CASHBACK_PAYMENT_TYPE,
  PAYMENT_TRAN_TYPE_PAY,
  PAYMENT_STATUS_PARTIALLY_PAID,
  PAYMENT_STATUS_PAID,
  PAYMENT_TRAN_TYPE_REFUND,
  ORDER_REFUNDED_STATUS,
  CANCELED_ORDER
} = require('../../libs/constants');

module.exports = {
  getCouponLotteryCashback: async function (authUser) {
    return await CouponLotteryCashback.findOne({
      user_id: authUser.id,
      deletedAt: null
    });
  },

  isAllowedForCashback: async function (grandOrderTotal, authUser) {
    let couponLotteryCashback = await this.getCouponLotteryCashback(authUser);
    return (couponLotteryCashback && grandOrderTotal <= couponLotteryCashback.amount);
  },

  placeOrder: async function (authUser, requestBody, urlParams, orderDetails, address, globalConfigs, cart, cartItems) {
    const {billingAddress, shippingAddress} = address;
    let {paymentType} = orderDetails;

    let {
      grandOrderTotal,
      totalQty
    } = PaymentService.calcCartTotal(cart, cartItems);

    let courierCharge = PaymentService.calcCourierCharge(cartItems, shippingAddress.zila_id, globalConfigs);

    grandOrderTotal += courierCharge;

    /** Customer is allowed for cashBack or not */
    if (!(await this.isAllowedForCashback(grandOrderTotal, authUser))) {
      throw new Error('The customer is not allowed to use cashback with this order.');
    }
    /** END */
    const generatedTransactionKey = PaymentService.generateRandomString();
    const {
      allCouponCodes,
      order,
      suborders,
      payments
    } = await sails.getDatastore()
      .transaction(async (db) => {

        /** Create order => suborders => suborders item variants */
        let {
          suborders,
          order,
          allOrderedProductsInventory,
          allGeneratedCouponCodes
        } = await PaymentService.createOrder(db, {
          user_id: authUser.id,
          cart_id: cart.id,
          total_price: grandOrderTotal,
          paid_amount: grandOrderTotal,
          total_quantity: totalQty,
          billing_address: billingAddress.id,
          shipping_address: shippingAddress.id,
          courier_charge: courierCharge,
          courier_status: 1
        }, cartItems);
        /** END */

        /** .............Payment Section ........... */
        let paymentResponse = {
          'purpose': 'Cashback Payment'
        };

        let payments = await PaymentService.createPayment(db, suborders, {
          user_id: authUser.id,
          order_id: order.id,
          payment_type: paymentType,
          details: JSON.stringify(paymentResponse),
          transection_key: generatedTransactionKey,
          status: 1
        });

        let allCouponCodes = await PaymentService.generateCouponCodes(db, allGeneratedCouponCodes);

        // Start/Delete Cart after submitting the order

        await PaymentService.updateCart(cart.id, db, cartItems);

        await PaymentService.updateProductInventory(allOrderedProductsInventory, db);

        console.log('successfully created:', allCouponCodes, order, suborders, shippingAddress);

        /** Update customer cashback amount */
        const couponLotteryCashback = await this.getCouponLotteryCashback(authUser);
        const cashBackAmount = couponLotteryCashback.amount;
        const deductedCashBackAmount = (cashBackAmount - grandOrderTotal);

        await CouponLotteryCashback.updateOne({
          id: couponLotteryCashback.id
        }).set({
          amount: deductedCashBackAmount
        }).usingConnection(db);
        /** END */

        return {
          allCouponCodes,
          order,
          suborders,
          payments
        };
      });

    if (authUser.phone || shippingAddress.phone) {
      await PaymentService.sendSms(authUser, order, allCouponCodes, shippingAddress);
    }

    let orderForMail = await PaymentService.findAllOrderedProducts(order.id, suborders);
    orderForMail.payments = payments;

    await PaymentService.sendEmail(orderForMail);

    return order;
  },

  makePartialPayment: async function (customer, order, request) {
    const shippingAddress = order.shipping_address;
    const amountToPay = parseFloat(request.body.amount_to_pay);
    const totalPrice = parseFloat(order.total_price);
    const paidAmount = parseFloat(order.paid_amount);

    if (amountToPay <= 0) {
      throw new Error('Invalid Payment Amount.');
    }

    let dueAmount = totalPrice - paidAmount;
    if (dueAmount === 0) {
      throw new Error('Payment already has been completed for this order');
    }
    if (dueAmount < amountToPay) {
      throw new Error('Payment amount is larger than due amount');
    }

    const currentUserCashBack = await getCurrentUserCashBack(customer);
    if (currentUserCashBack.amount <= 0 || currentUserCashBack.amount < amountToPay) {
      throw new Error('Customer is not allowed to pay by cashBackAmount for this order');
    }

    const payment = await sails.getDatastore()
      .transaction(async (db) => {
        let payment = await Payment.create({
          payment_amount: amountToPay,
          user_id: customer.id,
          order_id: order.id,
          payment_type: CASHBACK_PAYMENT_TYPE,
          transaction_type: PAYMENT_TRAN_TYPE_PAY,
          status: 1
        }).usingConnection(db);

        const totalPaidAmount = paidAmount + amountToPay;

        let paymentStatus = PAYMENT_STATUS_PARTIALLY_PAID;
        if (totalPrice <= totalPaidAmount) {
          paymentStatus = PAYMENT_STATUS_PAID;
        }

        await Order.updateOne({id: order.id}).set({
          paid_amount: totalPaidAmount,
          payment_status: paymentStatus,
        }).usingConnection(db);


        const deductedCashBackAmount = (currentUserCashBack.amount - amountToPay);

        await CouponLotteryCashback.updateOne({
          id: currentUserCashBack.id
        }).set({
          amount: deductedCashBackAmount
        }).usingConnection(db);

        return payment;
      });

    if (customer.phone || (shippingAddress && shippingAddress.phone)) {
      await PaymentService.sendSms(customer, order, [], shippingAddress);
    }

    return payment;
  },

  refundPayment: async function (customer, payload, globalConfigs) {
    const {
      paymentID,
      amount,
      sku = 'Anonder Bazar Product',
      reason = 'Order has been cancelled'
    } = payload;

    let payment = await Payment.findOne({
      transection_key: paymentID
    });

    if (!payment) {
      throw new Error('No transaction is found for the payment ID!');
    }

    let allRefundedPayment = await Payment.find({
      order_id: payment.order_id,
      transaction_type: PAYMENT_TRAN_TYPE_REFUND
    });

    /** Check weather total refunding money is larger than paid amount */
    let totalRefundedMoney = 0;
    if (allRefundedPayment && allRefundedPayment.length > 0) {
      totalRefundedMoney = allRefundedPayment.reduce((prevPayment, currentPayment) => {
        return prevPayment.amount + currentPayment.amount;
      }, 0);
    }

    let order = await Order.find({
      id: payment.order_id
    });

    if (!order) {
      throw new Error('Order is not found for the transaction');
    }

    if(order.status != CANCELED_ORDER){
      throw new Error('Please cancel the order first, then try to refund the payment');
    }

    if (totalRefundedMoney + amount > order.paid_amount) {
      throw new Error('Your final refund money is larger than the paid amount!');
    }
    /** END */

    const refundPayment = await sails.getDatastore()
      .transaction(async (db) => {
        let refundPayment = await Payment.create({
          user_id: payment.user_id,
          order_id: payment.order_id,
          transaction_type: PAYMENT_TRAN_TYPE_REFUND,
          payment_type: CASHBACK_PAYMENT_TYPE,
          payment_amount: amount,
          details: JSON.stringify({sku, reason}),
        }).fetch().usingConnection(db);

        let data = {};
        data.paid_amount = order.paid_amount + amount;
        if (amount + order.paid_amount >= order.total_price) {
          data.refund_status = ORDER_REFUNDED_STATUS;
        }
        await Order.updateOne({id: payment.id}, data).usingConnection(db);

        return refundPayment;
      });

    /** SMS section */

    return refundPayment;
  }
};
