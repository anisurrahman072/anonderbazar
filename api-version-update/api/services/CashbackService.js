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
    } = await PaymentService.calcCartTotal(cart, cartItems);

    let courierCharge = await PaymentService.calcCourierCharge(cartItems, shippingAddress.zila_id, globalConfigs);

    grandOrderTotal += courierCharge;

    /** Customer is allowed for cashBack or not */
    if (!(await this.isAllowedForCashback(grandOrderTotal, authUser))) {
      throw new Error('The customer is not allowed to use cashback with this order.');
    }
    /** END */

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
          total_quantity: totalQty,
          billing_address: billingAddress.id,
          shipping_address: shippingAddress.id,
          courier_charge: courierCharge,
          courier_status: 1
        }, cartItems);
        /** END */

        /** .............Payment Section ........... */
        let paymentResponse = {
          'purpose': 'Cashback Payment for coupon code purchase'
        };

        let payments = await PaymentService.createPayment(db, suborders, {
          user_id: authUser.id,
          order_id: order.id,
          payment_type: paymentType,
          details: JSON.stringify(paymentResponse),
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
  }
};
