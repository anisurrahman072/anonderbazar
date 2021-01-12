/**
 * OrderController
 *
 * @description :: Server-side logic for managing orders
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const _ = require("lodash");
const SSLCommerz = require('sslcommerz-nodejs');
const webURL = "https://web.bitspeek.com";
const APIURL = "https://api.bitspeek.com/api/v1";
const {asyncForEach} = require("../../libs");
import moment from "moment";

module.exports = {

  // destroy a row
  destroy: function (req, res) {
    Order.update({id: req.param("id")}, {deletedAt: new Date()}).exec(
      function (err, order) {
        if (err) return res.json(err, 400);
        return res.json(order[0]);
      }
    );
  },

  //Method called for creating a custom order data
  //Model models/Order.js,models/SubOrder.js,models/SuborderItem.js

  customOrder: async function (req, res) {
    try {
      let cart = await Cart.findOne({
        user_id: req.body.user_id,
        deletedAt: null
      });

      let order = await Order.create({
        user_id: req.body.user_id,
        cart_id: cart.id,
        total_price: req.body.price,
        billing_address: req.body.payment_address_id,
        total_quantity: req.body.quantity,
        status: 1,
        type: 1
      });


      let suborder = await Suborder.create({
        product_order_id: order.id,
        warehouse_id: req.body.warehouse_id,
        total_price: req.body.price,
        total_quantity: req.body.quantity,
        delivery_date: req.body.current_date,
        status: 1
      });

      let suborderitem = await SuborderItem.create({
        product_suborder_id: suborder.id,
        product_id: req.body.product_id,
        warehouse_id: req.body.warehouse_id,
        product_quantity: req.body.quantity,
        product_total_price: req.body.price
      });

      if (suborderitem) {
        return res.json(200, suborderitem);
      } else {
        return res.status(400).json({success: false});
      }
    } catch (error) {
      return res.status(400).json({success: false});
    }

  },
  //Method called for creating a custom order data from frontend
  //Model models/Order.js,models/SubOrder.js,models/SuborderItem.js,models/PaymentAddress.js
  //,models/Cart.js,models/CartItem.js,models/Payment.js, models/SuborderItemVariant.js
  customInsert: async function (req, res) {
    if (!req.param("user_id")) {
      return res.error("ni");
    }
    /*.................Shipping Address....................*/
    if (req.param("shipping_address") && (!req.param("shipping_address").id || req.param("shipping_address").id === "")) {
      try {
        let shippingAddres = await PaymentAddress.create({
          user_id: req.param("user_id"),
          first_name: req.param("shipping_address").firstName,
          last_name: req.param("shipping_address").lastName,
          address: req.param("shipping_address").address,
          country: req.param("shipping_address").address,
          phone: req.param("shipping_address").phone,
          postal_code: req.param("shipping_address").postCode,
          upazila_id: req.param("shipping_address").upazila_id,
          zila_id: req.param("shipping_address").zila_id,
          division_id: req.param("shipping_address").division_id,
          status: 1
        });
        req.param("shipping_address").id = shippingAddres.id;
      } catch (err) {

      }
    }
    /*.................Billing Address....................*/
    if (req.param("billing_address") && (!req.param("billing_address").id || req.param("billing_address").id === "") && req.param("is_copy") === false) {
      try {

        let paymentAddress = await PaymentAddress.create({
          user_id: req.param("user_id"),
          first_name: req.param("billing_address").firstName,
          last_name: req.param("billing_address").lastName,
          address: req.param("billing_address").address,
          country: req.param("billing_address").address,
          phone: req.param("billing_address").phone,
          postal_code: req.param("billing_address").postCode,
          upazila_id: req.param("billing_address").upazila_id,
          zila_id: req.param("billing_address").zila_id,
          division_id: req.param("billing_address").division_id,
          status: 1
        });
        req.param("billing_address").id = paymentAddress.id;
      } catch (err) {

      }
    } else if (req.param("is_copy") === true) {
      req.param("billing_address").id = req.param("shipping_address").id;
    }
    let cart = await Cart.findOne({
      user_id: req.param("user_id"),
      deletedAt: null
    }).populate("cart_items");
    let cartItems = await CartItem.find({
      cart_id: cart.id,
      deletedAt: null
    }).populate(["cart_item_variants", "product_id"]);

    /** Create  order from cart........................START...........................*/
    let globalConfigs = await GlobalConfigs.findOne({
      deletedAt: null
    });

    /*
        const shippingAddress = await ShippingAddress.find(req.query.shipping_address)
        console.log('shippingAddress', shippingAddress[0])
    */

    const courierCharge = req.param("shipping_address").zila_id == 2942 ? globalConfigs.dhaka_charge : globalConfigs.outside_dhaka_charge

    let order = await Order.create({
      user_id: req.param("user_id"),
      cart_id: cart.id,
      total_price: (cart.total_price + courierCharge),
      total_quantity: cart.total_quantity,
      billing_address: req.param("billing_address").id,
      shipping_address: req.param("shipping_address").id,
      status: 1,
      courier_charge: courierCharge,
      courier_status: 1,
    });

    /** Get unique warehouse Id for suborder................START.........................*/

    let uniqueTempWarehouses = _.uniqBy(cartItems, "product_id.warehouse_id");

    let uniqueWarehouseIds = uniqueTempWarehouses.map(
      o => o.product_id.warehouse_id
    );

    /** get unique warehouse Id for suborder..................END.........................*/

    let subordersTemp = [];

    /**.............................START..........................*/

    let i = 0; // i init for loop

    let allOrderedProductsInventory = []
    for (i = 0; i < uniqueWarehouseIds.length; i++) {
      let thisWarehouseID = uniqueWarehouseIds[i];

      let cartItemsTemp = cartItems.filter(
        asset => asset.product_id.warehouse_id === thisWarehouseID
      );

      let suborderTotalPrice = _.sumBy(cartItemsTemp, "product_total_price");
      let suborderTotalQuantity = _.sumBy(cartItemsTemp, "product_quantity");

      let suborder = await Suborder.create({
        product_order_id: order.id,
        warehouse_id: uniqueWarehouseIds[i],
        total_price: suborderTotalPrice,
        total_quantity: suborderTotalQuantity,
        status: 1
      });

      let suborderItemsTemp = [];
      for (let k = 0; k < cartItemsTemp.length; k++) {
        let thisCartItem = cartItemsTemp[k];

        let newSuborderItemPayload = {
          product_suborder_id: suborder.id,
          product_id: thisCartItem.product_id,
          warehouse_id: thisCartItem.product_id.warehouse_id,
          product_quantity: thisCartItem.product_quantity,
          product_total_price: thisCartItem.product_total_price,
          status: 1
        };

        const orderedProductInventory = {
          product_id: thisCartItem.product_id.id,
          ordered_quantity: thisCartItem.product_quantity,
          existing_quantity: thisCartItem.product_id.quantity
        }

        let newEndDate = new Date();
        newEndDate.setDate(new Date(
          new Date(order.createdAt).getTime() +
          ((thisCartItem.product_id.produce_time *
            thisCartItem.product_quantity) /
            60 /
            8) *
          86400000
        ).getDate() + 1);
        let suborderItem = await SuborderItem.create(newSuborderItemPayload);
        let suborderItemVariantsTemp = [];

        if (thisCartItem.cart_item_variants.length > 0) {

          for (let j = 0; j < thisCartItem.cart_item_variants.length; j++) {

            let thisCartItemVariant = thisCartItem.cart_item_variants[j];

            let newSuborderItemVariantPayload = {
              product_suborder_item_id: suborderItem.id,
              product_id: thisCartItemVariant.product_id,
              variant_id: thisCartItemVariant.variant_id,
              warehouse_variant_id: thisCartItemVariant.warehouse_variant_id,
              product_variant_id: thisCartItemVariant.product_variant_id
            };

            if(typeof orderedProductInventory.variantPayload === 'undefined'){
              orderedProductInventory.variantPayload = []
            }

            orderedProductInventory.variantPayload.push({
              product_id: thisCartItemVariant.product_id,
              variant_id: thisCartItemVariant.variant_id,
              warehouse_variant_id: thisCartItemVariant.warehouse_variant_id,
            })

            let suborderItemVariant = await SuborderItemVariant.create(
              newSuborderItemVariantPayload
            );
            suborderItemVariantsTemp.push(suborderItemVariant);
          }
        }

        let d = Object.assign({}, suborderItem);
        d.suborderItemVariants = suborderItemVariantsTemp;
        suborderItemsTemp.push(d);

        allOrderedProductsInventory.push(orderedProductInventory)
      }

      let d = Object.assign({}, suborder);
      d.suborderItems = suborderItemsTemp;
      subordersTemp.push(d);
    }

    /** .............Payment Section ........... */

    let paymentTemp = [];

    try {
      for (let i = 0; i < subordersTemp.length; i++) {
        let paymentType = await Payment.create({
          user_id: req.param("user_id"),
          order_id: order.id,
          suborder_id: subordersTemp[i].id,
          payment_type: req.param("paymentType"),
          payment_amount: subordersTemp[i].total_price,
          status: 1
        });

        paymentTemp.push(paymentType);
      }
    } catch (err) {

    }

    let orderForMail = await Order.find({where: {id: order.id}}).populateAll();
    let allOrderedProducts = [];
    for (let i = 0; i < subordersTemp.length; i++) {
      let items = await SuborderItem.find({where: {product_suborder_id: subordersTemp[i].id}}).populateAll();
      for (let index = 0; index < items.length; index++) {
        allOrderedProducts.push(items[index]);
      }
    }
    orderForMail[0].orderItems = allOrderedProducts;


    // Start/Delete Cart after submitting the order

    await Cart.update({id: cart.id}, {deletedAt: new Date()});

    try {
      for (let i = 0; i < cartItems.length; i++) {
        await CartItem.update({id: cartItems[i].id}, {deletedAt: new Date()});
        await CartItemVariant.update(
          {cart_item_id: cartItems[i].id},
          {deletedAt: new Date()}
        );
      }
      console.log('allOrderedProductsInventory', allOrderedProductsInventory)
      for (let i = 0; i < allOrderedProductsInventory.length; i++) {
        const thisInventoryProd = allOrderedProductsInventory[i]
        const quantityToUpdate = parseFloat(thisInventoryProd.existing_quantity) - parseFloat(thisInventoryProd.ordered_quantity)
        await Product.update({id: thisInventoryProd.product_id}, {quantity: quantityToUpdate});
      }
    } catch (err) {

    }

    try {
      EmailService.orderSubmitMail(orderForMail);
    } catch (err) {
      console.log('Email Sending Error')
    }
    // End /Delete Cart after submitting the order
    let d = Object.assign({}, order);
    d.suborders = subordersTemp;

    return res.ok({
      order: d
    });
  },
  //Method called for creating a custom order data from frontend with sslcommerz
  //Model models/Order.js,models/SubOrder.js,models/SuborderItem.js,models/PaymentAddress.js
  //,models/Cart.js,models/CartItem.js,models/Payment.js, models/SuborderItemVariant.js
  sslcommerz: async function (req, res) {
    let user = await User.findOne({id: req.param("user_id")}, {deletedAt: null});

    if (req.param("user_id") && user) {

      let cart = await Cart.findOne({
        user_id: user.id,
        deletedAt: null
      }).populate("cart_items");

      /*.................Shipping Address....................*/
      if (req.param("shipping_address") && (!req.param("shipping_address").id || req.param("shipping_address").id === "")) {
        try {
          let shippingAddres = await PaymentAddress.create({
            user_id: req.param("user_id"),
            // order_id: order.id,
            first_name: req.param("shipping_address").firstName,
            last_name: req.param("shipping_address").lastName,
            address: req.param("shipping_address").address,
            country: req.param("shipping_address").address,
            phone: req.param("shipping_address").phone,
            postal_code: req.param("shipping_address").postCode,
            upazila_id: req.param("shipping_address").upazila_id,
            zila_id: req.param("shipping_address").zila_id,
            division_id: req.param("shipping_address").division_id,
            status: 1
          });
          req.param("shipping_address").id = shippingAddres.id;
        } catch (err) {

        }
      }
      /*.................Billing Address....................*/
      if (req.param("billing_address") && (!req.param("billing_address").id || req.param("billing_address").id === "") && req.param("is_copy") === false) {
        try {
          let paymentAddress = await PaymentAddress.create({
            user_id: req.param("user_id"),
            // order_id: order.id,
            first_name: req.param("billing_address").firstName,
            last_name: req.param("billing_address").lastName,
            address: req.param("billing_address").address,
            country: req.param("billing_address").address,
            phone: req.param("billing_address").phone,
            postal_code: req.param("billing_address").postCode,
            upazila_id: req.param("billing_address").upazila_id,
            zila_id: req.param("billing_address").zila_id,
            division_id: req.param("billing_address").division_id,
            status: 1
          });
          req.param("billing_address").id = paymentAddress.id;
        } catch (err) {

        }
      } else if (req.param("is_copy") === true) {
        req.param("billing_address").id = req.param("shipping_address").id;
      }
      let globalConfigs = await GlobalConfigs.findOne({
        deletedAt: null
      });

      let settings = {
        isSandboxMode: false, //false if live version
        store_id: globalConfigs && globalConfigs.sslcommerce_user ? globalConfigs.sslcommerce_user : "anonderbazarlive@ssl",
        store_passwd: globalConfigs && globalConfigs.sslcommerce_pass ? globalConfigs.sslcommerce_pass : "i2EFz@ZNt57@t@r",
      };

      let sslcommerz = new SSLCommerz(settings);

      let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
      let string_length = 16;
      let randomstring = '';
      for (let i = 0; i < string_length; i++) {
        let rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
      }


      let post_body = {};
      post_body['total_amount'] = cart.total_price;
      post_body['currency'] = "BDT";
      post_body['tran_id'] = randomstring;
      post_body['success_url'] = APIURL + "/order/sslcommerzsuccess/?user_id=" + req.param("user_id") + "&billing_address=" + req.param("billing_address").id + "&shipping_address=" + req.param("shipping_address").id;
      post_body['fail_url'] = APIURL + "/order/sslcommerzfail/?user_id=" + req.param("user_id") + "&billing_address=" + req.param("billing_address").id + "&shipping_address=" + req.param("shipping_address").id;
      post_body['cancel_url'] = APIURL + "/order/sslcommerzerror/?user_id=" + req.param("user_id") + "&billing_address=" + req.param("billing_address").id + "&shipping_address=" + req.param("shipping_address").id;
      post_body['emi_option'] = 0;
      post_body['cus_name'] = user.first_name + " " + user.last_name;
      post_body['cus_email'] = user.email;
      post_body['cus_phone'] = user.phone;
      post_body['cus_add1'] = req.param("shipping_address").address;
      post_body['cus_city'] = "Dhaka";
      post_body['cus_country'] = "Bangladesh";
      post_body['shipping_method'] = "NO";
      post_body['multi_card_name'] = ""
      post_body['num_of_item'] = cart.total_quantity;
      post_body['product_name'] = "Test";
      post_body['product_category'] = "Test Category";
      post_body['product_profile'] = "general";

      sslcommerz.init_transaction(post_body).then(response => {
        return res.json(response);
      }).catch(error => {
        res.writeHead(301,
          {Location: webURL + '/checkout'}
        );
        res.end()
      });
    } else return res.json(req.body, 400);
  },
  //Method called when sslcommerz success from frontend
  //Model models/Order.js,models/SubOrder.js,models/SuborderItem.js
  //,models/Cart.js,models/CartItem.js,models/Payment.js, models/SuborderItemVariant.js
  sslcommerzsuccess: async function (req, res) {
    if (req.body.tran_id) {
      let cart = await Cart.findOne({
        user_id: req.query.user_id,
        deletedAt: null
      }).populate("cart_items");
      let cartItems = await CartItem.find({
        cart_id: cart.id,
        deletedAt: null
      }).populate(["cart_item_variants", "product_id"]);

      /*. Create  order from cart........................START...........................*/

      let globalConfigs = await GlobalConfigs.findOne({
        deletedAt: null
      });

      const shippingAddress = await ShippingAddress.find(req.query.shipping_address)

      let courierCharge = 0
      if (Array.isArray(shippingAddress) && shippingAddress.length) {
        courierCharge = shippingAddress[0].zila_id == 2942 ? globalConfigs.dhaka_charge : globalConfigs.outside_dhaka_charge
      }

      let order = await Order.create({
        user_id: req.query.user_id,
        cart_id: cart.id,
        total_price: (cart.total_price + courierCharge),
        total_quantity: cart.total_quantity,
        billing_address: req.query.billing_address,
        shipping_address: req.query.shipping_address,
        courier_charge: courierCharge,
        status: 1
      });

      /** get unique warehouse Id for suborder................START......................... */
      let uniqueTempWarehouses = _.uniqBy(cartItems, "product_id.warehouse_id");

      let uniqueWarehouseIds = uniqueTempWarehouses.map(o => o.product_id.warehouse_id);

      /** get unique warehouse Id for suborder..................END......................... */

      let subordersTemp = [];

      /** .............................START.......................... */

      let i = 0; // i init for loop
      let allOrderedProductsInventory = []

      for (i = 0; i < uniqueWarehouseIds.length; i++) {
        let thisWarehouseID = uniqueWarehouseIds[i];

        let cartItemsTemp = cartItems.filter(
          asset => asset.product_id.warehouse_id === thisWarehouseID
        );

        let suborderTotalPrice = _.sumBy(cartItemsTemp, "product_total_price");
        let suborderTotalQuantity = _.sumBy(cartItemsTemp, "product_quantity");

        let suborder = await Suborder.create({
          product_order_id: order.id,
          warehouse_id: uniqueWarehouseIds[i],
          total_price: suborderTotalPrice,
          total_quantity: suborderTotalQuantity,
          status: 1
        });

        let suborderItemsTemp = [];
        for (let k = 0; k < cartItemsTemp.length; k++) {
          let thisCartItem = cartItemsTemp[k];

          let newSuborderItemPayload = {
            product_suborder_id: suborder.id,
            product_id: thisCartItem.product_id,
            warehouse_id: thisCartItem.product_id.warehouse_id,
            product_quantity: thisCartItem.product_quantity,
            product_total_price: thisCartItem.product_total_price,
            status: 1
          };


          const orderedProductInventory = {
            product_id: thisCartItem.product_id.id,
            ordered_quantity: thisCartItem.product_quantity,
            existing_quantity: thisCartItem.product_id.quantity
          }

          let newEndDate = new Date();
          newEndDate.setDate(new Date(
            new Date(order.createdAt).getTime() +
            ((thisCartItem.product_id.produce_time *
              thisCartItem.product_quantity) /
              60 /
              8) *
            86400000
          ).getDate() + 1);
          let suborderItem = await SuborderItem.create(newSuborderItemPayload);
          let suborderItemVariantsTemp = [];
          if (thisCartItem.cart_item_variants.length > 0) {
            for (let j = 0; j < thisCartItem.cart_item_variants.length; j++) {
              let thisCartItemVariant = thisCartItem.cart_item_variants[j];
              let newSuborderItemVariantPayload = {
                product_suborder_item_id: suborderItem.id,
                product_id: thisCartItemVariant.product_id,
                variant_id: thisCartItemVariant.variant_id,
                warehouse_variant_id: thisCartItemVariant.warehouse_variant_id,
                product_variant_id: thisCartItemVariant.product_variant_id
              };

              if(typeof orderedProductInventory.variantPayload === 'undefined'){
                orderedProductInventory.variantPayload = []

              }
              orderedProductInventory.variantPayload.push({
                product_id: thisCartItemVariant.product_id,
                variant_id: thisCartItemVariant.variant_id,
                warehouse_variant_id: thisCartItemVariant.warehouse_variant_id,
              })

              let suborderItemVariant = await SuborderItemVariant.create(
                newSuborderItemVariantPayload
              );
              suborderItemVariantsTemp.push(suborderItemVariant);

            }
          }

          let d = Object.assign({}, suborderItem);
          d.suborderItemVariants = suborderItemVariantsTemp;
          suborderItemsTemp.push(d);

          allOrderedProductsInventory.push(orderedProductInventory)
        }

        let d = Object.assign({}, suborder);
        d.suborderItems = suborderItemsTemp;
        subordersTemp.push(d);
      }

      /*.............Payment Section ...........*/
      let paymentTemp = [];

      try {
        for (let i = 0; i < subordersTemp.length; i++) {
          let paymentType = await Payment.create({
            user_id: req.query.user_id,
            order_id: order.id,
            suborder_id: subordersTemp[i].id,
            payment_type: "SSLCommerce",
            payment_amount: subordersTemp[i].total_price,
            details: JSON.stringify(req.body),
            transection_key: req.body.tran_id,
            status: 1
          });

          paymentTemp.push(paymentType);
        }
      } catch (err) {

      }
      // Start/Delete Cart after submitting the order
      let orderForMail = await Order.find({where: {id: order.id}}).populateAll();
      let allOrderedProducts = [];
      for (let i = 0; i < subordersTemp.length; i++) {
        let items = await SuborderItem.find({where: {product_suborder_id: subordersTemp[i].id}}).populateAll();
        for (let index = 0; index < items.length; index++) {
          allOrderedProducts.push(items[index]);
        }
      }
      orderForMail[0].orderItems = allOrderedProducts;


      await Cart.update({id: cart.id}, {deletedAt: new Date()});

      try {
        for (let i = 0; i < cartItems.length; i++) {
          await CartItem.update({id: cartItems[i].id}, {deletedAt: new Date()});
          await CartItemVariant.update(
            {cart_item_id: cartItems[i].id},
            {deletedAt: new Date()}
          );
        }
        console.log('allOrderedProductsInventory', allOrderedProductsInventory)
        for (let i = 0; i < allOrderedProductsInventory.length; i++) {
          const quantityToUpdate = parseFloat(allOrderedProductsInventory[i].existing_quantity) - parseFloat(allOrderedProductsInventory[i].ordered_quantity)
          await Product.update({id: allOrderedProductsInventory[i].product_id}, {quantity: quantityToUpdate});
        }
      } catch (err) {

      }
      try {
        EmailService.orderSubmitMail(orderForMail);
      } catch (err){
        console.log('Order Sending email failed')
      }
      // End /Delete Cart after submitting the order
      let d = Object.assign({}, order);
      d.suborders = subordersTemp;
      res.writeHead(301,
        {Location: webURL + '/checkout?order=' + order.id}
      );
      res.end();
    } else {
      res.writeHead(301,
        {Location: webURL + '/checkout'}
      );
      res.end();
    }
  },
  //Method called when sslcommerz fails sends redirectory route
  sslcommerzfail: function (req, res) {
    res.writeHead(301,
      {Location: webURL + '/checkout'}
    );
    res.end();
  },
  //Method called when sslcommerz error sends redirectory route
  sslcommerzerror: function (req, res) {
    res.writeHead(301,
      {Location: webURL + '/checkout'}
    );
    res.end();
  },
  //Method called for getting all order data
  //Model models/Order.js,models/SubOrder.js,models/SuborderItem.js, models/SuborderItemVariant.js
  getAllOrder: async (req, res) => {
    try {
      /* WHERE condition for .......START.....................*/
      let _where = {};
      _where.deletedAt = null;
      if (req.query.created_at) {
        let created_at = JSON.parse(req.query.created_at);
        let from = moment((moment(created_at.from).format('YYYY-MM-DD'))).toISOString();
        let to = moment((moment(created_at.to).format('YYYY-MM-DD'))).toISOString();
        _where.created_at = {'>=': from, '<=': to};
      }
      if (req.query.courier_status) {
        _where.courier_status = req.query.courier_status;
      }

      if (req.query.status) {
        _where.status = req.query.status;
      }
      /* WHERE condition..........END................*/

      let orders = await Order.find({where: _where}).populateAll();
      await asyncForEach(orders, async element => {

        element.suborders[0].items = await SuborderItem.find({where: {product_suborder_id: element.suborders[0].id}}).populateAll();
        await asyncForEach(element.suborders[0].items, async item => {
          let varientitems = [];

          await asyncForEach(item.suborderItemVariants, async varientitem => {
            varientitems.push(await SuborderItemVariant.findOne({where: {product_suborder_item_id: item.id}}).populateAll());
          });
          item.suborderItemVariants = varientitems;
        });
      });
      res.json(orders);

    } catch (error) {
      let message = 'Error in Get All Suborder with pagination';
      res.status(400).json({
        success: false,
        message
      })
    }
  }
};
