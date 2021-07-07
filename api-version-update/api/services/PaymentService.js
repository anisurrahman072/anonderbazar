const _ = require('lodash');
const {adminPaymentAddressId, dhakaZilaId} = require('../../config/softbd');
const moment = require('moment');
const {CANCELED_ORDER} = require('../../libs/constants.js');
const logger = require('../../libs/softbd-logger').Logger;
const OfferService = require('../services/OfferService');
const regular_offer = 1;
const anonder_jhor = 2;

module.exports = {
  generateRandomString: function () {
    let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
    let string_length = 16;
    let randomstring = '';

    for (let i = 0; i < string_length; i++) {
      let rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
  },
  getTheCustomer: async function (userId) {
    return await User.findOne({id: userId, deletedAt: null});
  },
  getBillingAddress: async function (authUser, req, shippingAddress) {
    let billingAddress = null;
    let billing_address = req.param('billing_address');
    let isCopy = req.param('is_copy');
    if (billing_address) {
      if (!_.isObject(billing_address)) {
        billing_address = JSON.parse(billing_address);
      }
      if (_.isString(isCopy)) {
        isCopy = isCopy === 'true';
      }
      if (_.isObject(billing_address)) {
        billingAddress = {...billing_address, postal_code: billing_address.postCode};
        if ((!billingAddress.id || billingAddress.id === '') && isCopy === false) {
          billingAddress = await this.createAddress(authUser, billingAddress);
        } else if (isCopy === true && _.isObject(shippingAddress)) {
          billingAddress = {...shippingAddress};
        }
      }
    }
    return billingAddress;
  },
  getShippingAddress: async function (authUser, req, cartItems = []) {
    let shippingAddress = null;
    let shipping_address = req.param('shipping_address');

    if (shipping_address) {
      if (!_.isObject(shipping_address)) {
        shipping_address = JSON.parse(shipping_address);
      }

      shippingAddress = {...shipping_address, postal_code: shipping_address.postCode};
      if (!shippingAddress.id || shippingAddress.id === '') {
        shippingAddress = await this.createAddress(authUser, shippingAddress);
      }
    }
    /** check whether shipping address is required or not and based on it we're using admin address in case shipping address is not provided */
    if (this.isAllCouponProduct(cartItems)) {
      if (!shippingAddress) {
        return await this.getAdminPaymentAddress();
      }
    }
    console.log('4444', shippingAddress);
    return shippingAddress;
  },

  getAddress: async function (addressId) {
    return await PaymentAddress.findOne({
      id: addressId
    });
  },
  getAdminPaymentAddress: async function () {
    return await PaymentAddress.findOne({
      id: adminPaymentAddressId
    });
  },

  hasPaymentTransactionBeenUsed: async function (paymentMethod, transactionId) {
    const numberOfTransaction = await Payment.count().where({
      transection_key: transactionId,
      payment_type: paymentMethod,
      deletedAt: null
    });
    return numberOfTransaction > 0;
  },
  getPaymentRowPartial: async function (paymentMethod, transactionId) {
    return Payment.find({
      transection_key: transactionId,
      payment_type: paymentMethod,
      order_type: 2,
      deletedAt: null
    });
  },

  isAllowedForPartialPay: function (order, globalConfigs) {
    const currentDate = moment(new Date());
    const orderedDate = moment(order.createdAt);
    const duration = moment.duration(currentDate.diff(orderedDate));
    const expendedHour = Math.floor(duration.asHours());
    // eslint-disable-next-line eqeqeq
    return !(globalConfigs.partial_payment_duration < expendedHour || order.status == CANCELED_ORDER);
  },

  isAllCouponProduct: function (cartItems) {
    const couponProductFound = cartItems.filter((cartItem) => {
      return cartItem.product_id && !!cartItem.product_id.is_coupon_product;
    });
    return (couponProductFound && couponProductFound.length > 0 && cartItems.length === couponProductFound.length);
  },

  calcCourierCharge: function (cartItems, shippingDhakaZillaId, globalConfigs) {
    let noShippingCharge = false;

    /** take decision for adding shipping charge */
    if (cartItems && cartItems.length > 0) {

      let productFreeShippingFound = cartItems.filter(item => {
        return (item.product_id && item.product_id.free_shipping);
      });

      noShippingCharge = this.isAllCouponProduct(cartItems) || (
        productFreeShippingFound && productFreeShippingFound.length > 0 && cartItems.length === productFreeShippingFound.length
      );
    }
    /** END */

    let courierCharge = 0;

    if (!noShippingCharge) {
      let maxDhakaCharge = 0;
      let maxOutsideDhakaCharge = 0;
      let len = cartItems.length;
      for (let i = 0; i < len; i++) {
        let itemDhakaCharge = 0;
        let itemOutsideDhakaCharge = 0;
        if (!_.isUndefined(cartItems[i].product_id) && cartItems[i].product_id.free_shipping === 0) {
          itemDhakaCharge = cartItems[i].product_id.dhaka_charge ? cartItems[i].product_id.dhaka_charge : globalConfigs.dhaka_charge;
          itemOutsideDhakaCharge = cartItems[i].product_id.outside_dhaka_charge ? cartItems[i].product_id.outside_dhaka_charge : globalConfigs.outside_dhaka_charge;
        }
        maxDhakaCharge = Math.max(maxDhakaCharge, itemDhakaCharge);
        maxOutsideDhakaCharge = Math.max(maxOutsideDhakaCharge, itemOutsideDhakaCharge);
      }


      if (shippingDhakaZillaId) {
        if (parseInt(shippingDhakaZillaId) === dhakaZilaId) {
          courierCharge = maxDhakaCharge;
        } else {
          courierCharge = maxOutsideDhakaCharge;
        }
      } else {
        courierCharge = globalConfigs.outside_dhaka_charge;
      }
    }

    return courierCharge;
  },

  createPayment: async (db, subordersTemp, additionalColumns = {}) => {
    let paymentTemp = [];
    for (let i = 0; i < subordersTemp.length; i++) {
      let paymentObj = await Payment.create({
        suborder_id: subordersTemp[i].id,
        payment_amount: subordersTemp[i].total_price,
        ...additionalColumns
      }).fetch().usingConnection(db);

      paymentTemp.push(paymentObj);
    }
    return paymentTemp;
  },

  calcCartTotal: async function (cart, cartItems) {
    let grandOrderTotal = 0;
    let totalQty = 0;
    for (let cartItem of cartItems) {
      if (cartItem.product_quantity > 0) {
        let productUnitPrice = cartItem.product_id.price;
        let productFinalPrice = productUnitPrice * cartItem.product_quantity;

        let offerProducts = await OfferService.getRegularOfferStore();

        if (!(offerProducts && !_.isUndefined(offerProducts[cartItem.product_id.id]) && offerProducts[cartItem.product_id.id])) {
          productFinalPrice = productUnitPrice * cartItem.product_quantity;
        } else {
          if (offerProducts && offerProducts[cartItem.product_id.id].calculation_type === 'absolute') {
            let productPrice = productUnitPrice - offerProducts[cartItem.product_id.id].discount_amount;
            productFinalPrice = productPrice * cartItem.product_quantity;
          } else {
            let productPrice = productUnitPrice - (productUnitPrice * (offerProducts[cartItem.product_id.id].discount_amount / 100.0));
            productFinalPrice = productPrice * cartItem.product_quantity;
          }
        }

        /*if (!cartItem.product_id.promotion) {
          let productUnitPrice = cartItem.product_id.price;
          productPrice = productUnitPrice * cartItem.product_quantity;
        }*/

        grandOrderTotal += productFinalPrice;
        totalQty += cartItem.product_quantity;
      }
    }
    return {
      grandOrderTotal,
      totalQty
    };
  },

  getCart: async (userId) => {
    const cart = await Cart.findOne({
      user_id: userId,
      deletedAt: null
    });

    if (!cart) {
      throw new Error('No Associated Shipping Cart was found!');
    }
    return cart;
  },

  getCartItems: async (cartId) => {
    const cartItems = await CartItem.find({
      cart_id: cartId,
      deletedAt: null
    })
      .populate('cart_item_variants')
      .populate('product_id');

    if (!(cartItems && cartItems.length > 0)) {
      throw new Error('No Associated Shipping Cart Item was found!');
    }
    return cartItems;
  },

  createAddress: async (authUser, address) => {
    return await PaymentAddress.create({
      user_id: authUser.id,
      first_name: address.firstName,
      last_name: address.lastName,
      address: address.address,
      country: address.address,
      phone: address.phone,
      postal_code: address.postal_code,
      upazila_id: address.upazila_id,
      zila_id: address.zila_id,
      division_id: address.division_id,
      status: 1
    }).fetch();
  },

  createOrder: async (db, orderDatPayload, cartItems) => {

    console.log('orderDatPayload rouzex', orderDatPayload);

    let order = await Order.create(orderDatPayload).fetch().usingConnection(db);


    /** Get unique warehouse Id for suborder................START......................... */
    let uniqueTempWarehouses = _.uniqBy(cartItems, 'product_id.warehouse_id');

    let uniqueWarehouseIds = uniqueTempWarehouses.map(o => o.product_id.warehouse_id);
    /** Get unique warehouse Id for suborder..................END......................... */

    let subordersTemp = [];

    let allOrderedProductsInventory = [];

    /** Generate Necessary sub orders according to warehouse Start **/
    let allGeneratedCouponCodes = [];


    for (let i = 0; i < uniqueWarehouseIds.length; i++) {
      let thisWarehouseID = uniqueWarehouseIds[i];

      let cartItemsTemp = cartItems.filter(
        asset => {
          return asset.product_id.warehouse_id === thisWarehouseID;
        }
      );

      console.log('cartItemsTemp: ', cartItemsTemp);

      let suborderTotalPrice = _.sumBy(cartItemsTemp, 'product_total_price');
      let suborderTotalQuantity = _.sumBy(cartItemsTemp, 'product_quantity');

      let suborder = await Suborder.create({
        product_order_id: order.id,
        warehouse_id: uniqueWarehouseIds[i],
        total_price: suborderTotalPrice,
        total_quantity: suborderTotalQuantity,
        status: 1
      }).fetch().usingConnection(db);

      let offeredProducts = await OfferService.getRegularOfferStore();

      let suborderItemsTemp = [];
      for (let k = 0; k < cartItemsTemp.length; k++) {
        let thisCartItem = cartItemsTemp[k];
        console.log('thisCartItem: ', thisCartItem);

        /** global section */
        let itemId = thisCartItem.product_id.id;
        let itemCatId = thisCartItem.product_id.type_id;
        let itemSubCatId = thisCartItem.product_id.category_id;
        let itemSubSubCatId = thisCartItem.product_id.subcategory_id;
        let itemBrandId = thisCartItem.product_id.brand_id;
        let itemWarehouseId = thisCartItem.product_id.warehouse_id;

        let offer_id_number;
        let offer_type;

        if(offeredProducts && offeredProducts[itemId]){
          /** offer section */
          let presentTime = moment().format('YYYY-MM-DD HH:mm:ss');
          let _where = {};
          _where.offer_deactivation_time = null;
          _where.deletedAt = null;
          _where.start_date = {'<=': presentTime};
          _where.end_date = {'>=': presentTime};

          let regularOffers = await Offer.find({where: _where});
          console.log('reglar offer csv: ', regularOffers);

          /** checking if the product exists in Regular offer */
          if (regularOffers && regularOffers.length > 0) {
            let regularOfferVendorId = [];
            let regularOfferBrandId = [];
            let regularOfferCatId = [];
            let regularOfferSubCatId = [];
            let regularOfferSubSubCatId = [];
            let regularOfferProductsIds = [];
            let regularOfferIndividualProductsIds = [];


            /** storing offer information in the arrays */
            for (let offer = 0; offer < regularOffers.length; offer++) {
              if (regularOffers[offer].selection_type === 'Vendor wise') {
                regularOfferVendorId.push({
                  regularOfferId: regularOffers[offer].id,
                  vendorId: regularOffers[offer].vendor_id
                });
              }

              if (regularOffers[offer].selection_type === 'Brand wise') {
                regularOfferBrandId.push({
                  regularOfferId: regularOffers[offer].id,
                  brandId: regularOffers[offer].brand_id
                });
              }

              if (regularOffers[offer].selection_type === 'Category wise') {
                regularOfferCatId.push({
                  regularOfferId: regularOffers[offer].id,
                  catId: regularOffers[offer].category_id
                });
                regularOfferSubCatId.push({
                  regularOfferId: regularOffers[offer].id,
                  subCatId: regularOffers[offer].subCategory_Id
                });
                regularOfferSubSubCatId.push({
                  regularOfferId: regularOffers[offer].id,
                  subSubCatId: regularOffers[offer].subSubCategory_Id
                });
              }

              if (regularOffers[offer].selection_type === 'Product wise') {
                console.log('regular offer info in product wise: ', regularOffers[offer]);
                let rawSQL = `SELECT
                                  product_id
                              FROM
                                  regular_offer_products
                              WHERE
                                  regular_offer_id = ${regularOffers[offer].id} AND product_deactivation_time IS NULL AND deleted_at IS NULL `;
                const ids = await sails.sendNativeQuery(rawSQL, []);
                const productIds = ids.rows;
                console.log('pro wise ids: ', productIds);

                productIds.forEach(proId => {
                  regularOfferProductsIds.push({
                    regularOfferId: regularOffers[offer].id,
                    productId: proId.product_id
                  });
                });
              }

              if (regularOffers[offer].selection_type === 'individual_product') {
                console.log('regular offer info in inidi wise: ', regularOffers[offer]);
                let rawSQL = `SELECT
                                  product_id
                              FROM
                                  regular_offer_products
                              WHERE
                                  regular_offer_id = ${regularOffers[offer].id} AND product_deactivation_time IS NULL AND deleted_at IS NULL `;
                const ids = await sails.sendNativeQuery(rawSQL, []);
                const productIds = ids.rows;
                console.log('individual_product wise ids: ', productIds);

                productIds.forEach(proId => {
                  regularOfferIndividualProductsIds.push({
                    regularOfferId: regularOffers[offer].id,
                    productId: proId.product_id
                  });
                });
              }
            }

            /** checking if the product item exists in the regular offer */
            if (regularOfferVendorId && regularOfferVendorId.length > 0) {
              regularOfferVendorId.forEach(ven => {
                if (itemWarehouseId === ven.vendorId) {
                  offer_id_number = ven.regularOfferId;
                  offer_type = regular_offer;
                }
              });
            }

            if (regularOfferBrandId && regularOfferBrandId.length > 0) {
              regularOfferBrandId.forEach(bran => {
                if (itemBrandId === bran.brandId) {
                  offer_id_number = bran.regularOfferId;
                  offer_type = regular_offer;
                }
              });
            }

            if (regularOfferCatId && regularOfferCatId.length > 0) {
              regularOfferCatId.forEach(cat => {
                if (itemCatId === cat.catId) {
                  offer_id_number = cat.regularOfferId;
                  offer_type = regular_offer;
                }
              });
            }

            if (regularOfferSubCatId && regularOfferSubCatId.length > 0) {
              regularOfferSubCatId.forEach(subCat => {
                if (itemSubCatId === subCat.subCatId) {
                  offer_id_number = subCat.regularOfferId;
                  offer_type = regular_offer;
                }
              });
            }

            if (regularOfferSubSubCatId && regularOfferSubSubCatId.length > 0) {
              regularOfferSubSubCatId.forEach(subSubCat => {
                if (itemSubSubCatId === subSubCat.subSubCatId) {
                  offer_id_number = subSubCat.regularOfferId;
                  offer_type = regular_offer;
                }
              });
            }

            if (regularOfferProductsIds && regularOfferProductsIds.length > 0) {
              console.log('regularOfferProductsIds', regularOfferProductsIds);
              regularOfferProductsIds.forEach(proId => {
                if (itemId === proId.productId) {
                  console.log('in prodct ise: item id, productid: ', itemId, proId.productId);
                  offer_id_number = proId.regularOfferId;
                  offer_type = regular_offer;
                }
              });
            }

            if (regularOfferIndividualProductsIds && regularOfferIndividualProductsIds.length > 0) {
              console.log('regularOfferIndividualProductsIds: ', regularOfferIndividualProductsIds);
              regularOfferIndividualProductsIds.forEach(proId => {
                if (itemId === proId.productId) {
                  console.log('in individual ise: item id, productid: ', itemId, proId.productId);
                  offer_id_number = proId.regularOfferId;
                  offer_type = regular_offer;
                }
              });
            }

          }

          /** jhor offer */
          let _where1 = {};
          _where1.status = 1;
          _where1.deletedAt = null;
          _where1.start_date = {'<=': presentTime};
          _where1.end_date = {'>=': presentTime};

          let jhorOffers = await AnonderJhorOffers.find({where: _where1});
          console.log('jhor offers csv: ', jhorOffers);

          /** checking if the product exists in anonder jhor offer */
          if (jhorOffers && jhorOffers.length > 0) {
            let offerCatId = [];
            let offerSubCatId = [];
            let offerSubSubCatId = [];

            jhorOffers.forEach(offer => {
              offerCatId.push({jhorOfferId: offer.id, catId: offer.category_id});
              offerSubCatId.push({jhorOfferId: offer.id, subCatId: offer.sub_category_id});
              offerSubSubCatId.push({jhorOfferId: offer.id, subSubCatId: offer.sub_sub_category_id});
            });

            if (offerCatId && offerCatId.length > 0) {
              offerCatId.forEach(cat => {
                if (itemCatId === cat.catId) {
                  offer_id_number = cat.jhorOfferId;
                  offer_type = anonder_jhor;
                }
              });
            }

            if (offerSubCatId && offerSubCatId.length > 0) {
              offerSubCatId.forEach(subCat => {
                if (itemSubCatId === subCat.subCatId) {
                  offer_id_number = subCat.jhorOfferId;
                  offer_type = anonder_jhor;
                }
              });
            }

            if (offerSubSubCatId && offerSubSubCatId.length > 0) {
              offerSubSubCatId.forEach(subSubCat => {
                if (itemSubSubCatId === subSubCat.subSubCatId) {
                  offer_id_number = subSubCat.jhorOfferId;
                  offer_type = anonder_jhor;
                }
              });
            }
          }
        }


        let newSuborderItemPayload = {
          product_suborder_id: suborder.id,
          product_id: thisCartItem.product_id.id,
          warehouse_id: thisCartItem.product_id.warehouse_id,
          product_quantity: thisCartItem.product_quantity,
          product_total_price: thisCartItem.product_total_price,
          status: 1,
          offer_type: offer_type,
          offer_id_number: offer_id_number
        };

        const orderedProductInventory = {
          product_id: thisCartItem.product_id.id,
          ordered_quantity: thisCartItem.product_quantity,
          existing_quantity: thisCartItem.product_id.quantity
        };

        let newEndDate = new Date();
        newEndDate.setDate(new Date(
          new Date(order.createdAt).getTime() +
          ((thisCartItem.product_id.produce_time *
            thisCartItem.product_quantity) /
            60 /
            8) *
          86400000
        ).getDate() + 1);

        let suborderItem = await SuborderItem.create(newSuborderItemPayload).fetch().usingConnection(db);

        if (thisCartItem.product_id && !!thisCartItem.product_id.is_coupon_product) {
          for (let t = 0; t < thisCartItem.product_quantity; t++) {
            allGeneratedCouponCodes.push({
              quantity: thisCartItem.product_quantity,
              product_id: thisCartItem.product_id.id,
              user_id: orderDatPayload.user_id,
              order_id: order.id,
              suborder_id: suborder.id,
              suborder_item_id: suborderItem.id
            });
          }
        }

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

            if (typeof orderedProductInventory.variantPayload === 'undefined') {
              orderedProductInventory.variantPayload = [];

            }

            orderedProductInventory.variantPayload.push({
              product_id: thisCartItemVariant.product_id,
              variant_id: thisCartItemVariant.variant_id,
              warehouse_variant_id: thisCartItemVariant.warehouse_variant_id,
            });

            let suborderItemVariant = await SuborderItemVariant.create(
              newSuborderItemVariantPayload
            ).fetch().usingConnection(db);

            suborderItemVariantsTemp.push(suborderItemVariant);
          }
        }

        let d = Object.assign({}, suborderItem);
        d.suborderItemVariants = suborderItemVariantsTemp;
        suborderItemsTemp.push(d);

        allOrderedProductsInventory.push(orderedProductInventory);
      }

      let d = Object.assign({}, suborder);
      d.suborderItems = suborderItemsTemp;
      subordersTemp.push(d);
    }
    /** Generate Necessary sub orders according to warehouse End **/

    return {suborders: subordersTemp, order, allOrderedProductsInventory, allGeneratedCouponCodes};
  },

  findAllOrderedProducts: async (orderId, suborders) => {
    let orderForMail = await Order.findOne({id: orderId})
      .populate('user_id')
      .populate('shipping_address');

    let allOrderedProducts = [];
    const subOrderLen = suborders.length;
    for (let i = 0; i < subOrderLen; i++) {
      let items = await SuborderItem.find({where: {product_suborder_id: suborders[i].id}})
        .populate('product_id');

      for (let index = 0; index < items.length; index++) {
        allOrderedProducts.push(items[index]);
      }
    }
    orderForMail.orderItems = allOrderedProducts;
    return orderForMail;
  },

  updateCart: async (cartId, db, cartItems) => {
    await Cart.update({id: cartId}, {deletedAt: new Date()}).usingConnection(db);

    for (let i = 0; i < cartItems.length; i++) {
      await CartItem.update({id: cartItems[i].id}, {deletedAt: new Date()}).usingConnection(db);
      await CartItemVariant.update(
        {cart_item_id: cartItems[i].id},
        {deletedAt: new Date()}
      ).usingConnection(db);
    }
  },

  updateProductInventory: async (allOrderedProductsInventory, db) => {
    for (let i = 0; i < allOrderedProductsInventory.length; i++) {
      const thisInventoryProd = allOrderedProductsInventory[i];
      const quantityToUpdate = parseFloat(thisInventoryProd.existing_quantity) - parseFloat(thisInventoryProd.ordered_quantity);
      await Product.update({id: thisInventoryProd.product_id}, {quantity: quantityToUpdate}).usingConnection(db);
    }
  },

  generateCouponCodes: async function (db, allGeneratedCouponCodes) {
    const allCouponCodes = [];
    if (allGeneratedCouponCodes && allGeneratedCouponCodes.length > 0) {
      const couponCodeLen = allGeneratedCouponCodes.length;
      for (let i = 0; i < couponCodeLen; i++) {
        let couponObject = await ProductPurchasedCouponCode.create(allGeneratedCouponCodes[i]).fetch().usingConnection(db);
        if (couponObject && couponObject.id) {
          allCouponCodes.push('1' + _.padStart(couponObject.id, 6, '0'));
        }
      }
    }
    return allCouponCodes;
  },

  sendSms: async (authUser, order, allCouponCodes, shippingAddress) => {
    try {
      let smsPhone = authUser.phone;

      if (!smsPhone && shippingAddress.phone) {
        smsPhone = shippingAddress.phone;
      }

      if (smsPhone) {
        let smsText = `আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে। অর্ডার নাম্বার: ${order.id}`;
        console.log('smsTxt', smsText, smsPhone);
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
      logger.orderLog(authUser.id, 'SMS sending error', err);
    }
  },

  sendSmsForPartialPayment: async (authUser, shippingAddress, orderId, {paidAmount, transaction_id}) => {
    try {
      let smsPhone = authUser.phone;

      if (!smsPhone && shippingAddress.phone) {
        smsPhone = shippingAddress.phone;
      }

      if (smsPhone) {
        let smsText = `আপনার পেমেন্টি সফল হয়েছে। ট্রানজেকশন নাম্বার: ${transaction_id}, টাকার পরিমান: ${paidAmount}, অর্ডার নাম্বার: ${orderId}`;
        console.log('smsTxt', smsText);
        SmsService.sendingOneSmsToOne([smsPhone], smsText);
      }
    } catch (err) {
      logger.orderLog(authUser.id, 'SMS sending error', err);
    }
  },

  sendSmsForRefund: async (orderId, authUser) => {
    try {
      let smsPhone = authUser.phone;

      if (smsPhone) {
        let smsText = `আপনার ট্রানজেকশন টাকা গুলো রিফান্ড করা হয়েছে। অর্ডার নাম্বার: ${orderId}`;
        console.log('smsTxt', smsText);
        SmsService.sendingOneSmsToOne([smsPhone], smsText);
      }
    } catch (err) {
      logger.orderLog(authUser.id, 'SMS sending error', err);
    }
  },

  sendEmail: async (orderForMail) => {
    try {
      EmailService.orderSubmitMail(orderForMail);
    } catch (err) {
      console.log('Email Sending Error', err);
    }
  },

};
