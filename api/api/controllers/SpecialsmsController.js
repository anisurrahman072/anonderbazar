import SmsService from "../services/SmsService";
import moment from "moment";

const _ = require("lodash");
/**
 * SpecialsmsController
 *
 * @description :: Server-side logic for managing orders
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
/*  //Method called for getting all products
  //Model models/Product.js
  sendDelayedSMSTOOrders: async (req, res) => {
    const orderIdsToExclude = [1, 2, 3, 4, 5, 7, 8, 9];
    const orderCreatedAtDateMaxLimit = moment('2021-02-13 16:00:00');
    try {
      let orders = await Order.find({
        where: {
          status: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13],
          deletedAt: null
        },
        sort: {
          createdAt: 'ASC'
        }
      }).populate("couponProductCodes", {deletedAt: null})
        .populate("suborders", {deletedAt: null})
        .populate("user_id", {deletedAt: null})
        .populate("payment", {deletedAt: null});

      if (!(orders && Array.isArray(orders) && orders.length > 0)) {
        return res.status(200).json([]);
      }

      orders = orders.filter(order => {
        if (orderIdsToExclude.indexOf(order.id) !== -1) {
          return false;
        }
        const createdAt = moment(order.createdAt);

        if (createdAt.isAfter(orderCreatedAtDateMaxLimit)) {
          return false;
        }

        if (!(order.couponProductCodes && order.couponProductCodes.length > 0)) {
          return false;
        }

        if (order && order.payment &&
          order.user_id && order.user_id.id &&
          Array.isArray(order.payment) && order.payment.length > 0 && order.suborders &&
          Array.isArray(order.suborders) && order.suborders.length > 0) {

          const payment = order.payment[0];
          if (payment.payment_type === 'SSLCommerce') {
            const details = JSON.parse(order.payment[0].details);
            if (details && details.tran_id) {
              return true;
            }
          }

        }
        return false;
      }).map(({suborders, user_id, payment, ...rest}) => {
        return {
          ...rest,
          mobile: user_id.phone
        };

      });

      let findOrderLen = orders.length;
      let smsDetails = [];
      for (let i = 0; i < findOrderLen; i++) {
        const userMobile = orders[i].mobile;
        const couponCodes = orders[i].couponProductCodes.map((couponObject) => {
          return '1' + _.padStart(couponObject.id, 6, '0');
        });

        if (userMobile && couponCodes.length > 0) {
          let smsText = 'anonderbazar.com এ আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে।';

          if (couponCodes.length === 1) {
            smsText += 'anonderbazar.com এ আপনার স্বাধীনতার ৫০ এর কুপন কোড: ' + couponCodes.join(',');
          } else {
            smsText += 'anonderbazar.com এ আপনার স্বাধীনতার ৫০ এর কুপন কোডগুলি: ' + couponCodes.join(',');
          }
          console.log('couponCodes-userMobile', orders[i].id, userMobile, smsText);
          try {
            SmsService.sendingOneSmsToOne([userMobile], smsText);
            smsDetails.push({
              orderId: orders[i].id,
              couponCodes: couponCodes,
              smsText: smsText,
              mobile: userMobile
            });
          } catch (ee) {
            console.log(ee);
          }
        }
      }

      return res.status(200).json(smsDetails);
    } catch (err) {
      console.log(err);
      return res.badRequest(err.message);
    }
  },
  //Method called for getting all products
  //Model models/Product.js
  generateCouponCodes: async (req, res) => {
    try {
      let orders = await Order.find({
        where: {
          status: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13],
          deletedAt: null
        },
        sort: {
          createdAt: 'ASC'
        }
      }).populate("couponProductCodes", {deletedAt: null})
        .populate("suborders", {deletedAt: null})
        .populate("user_id", {deletedAt: null})
        .populate("payment", {deletedAt: null});

      if (!(orders && Array.isArray(orders) && orders.length > 0)) {
        return res.status(200).json([]);
      }

      orders = orders.filter(order => {
        if (order && order.payment &&
          order.user_id && order.user_id.id &&
          Array.isArray(order.payment) && order.payment.length > 0 && order.suborders &&
          Array.isArray(order.suborders) && order.suborders.length > 0) {

          const payment = order.payment[0];
          if (payment.payment_type === 'SSLCommerce') {
            const details = JSON.parse(order.payment[0].details);
            if (details && details.tran_id) {
              return true;
            }
          }
        }
        return false;
      });

      const orderLen = orders.length;

      for (let it = 0; it < orderLen; it++) {
        const couponCodesToGenerate = [];
        const suborderLen = orders[it].suborders.length;
        let couponGenerated = orders[it].couponProductCodes;

        let couponProductQty = 0;
        for (let i = 0; i < suborderLen; i++) {
          let subOrderItems = await SuborderItem.find({
            where: {
              product_suborder_id: orders[it].suborders[i].id,
              deletedAt: null
            }
          })
            .populate("product_id", {deletedAt: null});

          if (subOrderItems && Array.isArray(subOrderItems) && subOrderItems.length > 0) {
            let subOrderItem = subOrderItems.find((item) => {
              return item && item.product_id && item.product_id.id == 6016 && !!item.product_id.is_coupon_product;
            });

            if (subOrderItem && subOrderItem.id) {
              couponProductQty += parseInt(subOrderItem.product_quantity, 10);
              let qty = parseInt(subOrderItem.product_quantity, 10);
              if (couponGenerated && Array.isArray(couponGenerated) && couponGenerated.length > 0) {
                qty = qty - couponGenerated.length;
              }
              for (let j = 0; j < qty; j++) {
                couponCodesToGenerate.push({
                  product_id: subOrderItem.product_id.id,
                  order_id: orders[it].id,
                  suborder_id: orders[it].suborders[i].id,
                  suborder_item_id: subOrderItem.id,
                  user_id: orders[it].user_id.id,
                })
              }
            }
          }
        }

        orders[it].couponCodesToGenerate = couponCodesToGenerate;
        orders[it].couponProductQty = couponProductQty;
      }

      orders = orders.filter(order => {
        return order.couponCodesToGenerate && order.couponCodesToGenerate.length > 0;
      }).map(({suborders, user_id, payment, couponProductCodes, ...rest}) => {
        return {
          ...rest,
          mobile: user_id.phone
        };

      });

      let findOrderLen = orders.length;
      for (let i = 0; i < findOrderLen; i++) {
        const userMobile = orders[i].mobile;
        const couponCodesToGenerate = orders[i].couponCodesToGenerate;
        const couponCodeLen = couponCodesToGenerate.length;
        const allCouponCodes = [];
        const allCouponRows = [];
        for (let j = 0; j < couponCodeLen; j++) {
          let couponObject = await ProductPurchasedCouponCode.create(couponCodesToGenerate[j]);
          if (couponObject && couponObject.id) {
            allCouponRows.push(couponObject);
            allCouponCodes.push('1' + _.padStart(couponObject.id, 6, '0'))
          }
        }
        orders[i].allCouponRows = allCouponRows;
        if (userMobile && allCouponCodes && allCouponCodes.length > 0) {
          let smsText = '';

          if (allCouponCodes.length === 1) {
            smsText = 'anonderbazar.com এ আপনার স্বাধীনতার ৫০ এর কুপন কোড: ' + allCouponCodes.join(',');
          } else {
            smsText = 'anonderbazar.com এ আপনার স্বাধীনতার ৫০ এর কুপন কোডগুলি: ' + allCouponCodes.join(',');
          }

          try {
            console.log(userMobile, smsText);
            SmsService.sendingOneMessageToMany([userMobile], smsText);
          } catch (ee) {
            console.log(ee);
          }
        }
      }
      return res.status(200).json(orders);
    } catch (err) {
      console.log(err);
      return res.badRequest(err.message);
    }
  },
  testSMS: async (req, res) => {
    try {
      let smsText = 'Test SMS: আপনার স্বাধীনতার ৫০';
      console.log(['+8801790635943'], 'Test SMS: আপনার স্বাধীনতার ৫০');
      SmsService.sendingOneSmsToOne(['+8801790635943'], smsText);
      return res.status(200).json('success');
    } catch (ee) {
      console.log(ee);
      return res.badRequest(ee.data);
    }
  }*/
};
