const _ = require('lodash');
const moment = require('moment');
const regular_offer = 1;
const anonder_jhor = 2;
const {REGULAR_OFFER_TYPE, ANONDER_JHOR_OFFER_TYPE} = require('../../libs/constants');

module.exports = {
  /** Calculate a product price according to offer*/
  calcProductOfferPrice: async function (product) {
    let productUnitPrice = product.price;

    let variantAdditionalPrice = await PaymentService.calculateItemVariantPrice(product.itemVariant);
    if (variantAdditionalPrice) {
      productUnitPrice += variantAdditionalPrice;
    }
    /*console.log('After calculate the variant price: ', productUnitPrice);*/


    let productFinalPrice = productUnitPrice * product.quantity;
    let offerProducts = await this.getAllOfferedProducts();

    if (offerProducts && !_.isUndefined(offerProducts[product.id]) && offerProducts[product.id]) {
      if (offerProducts && offerProducts[product.id].calculation_type === 'absolute') {
        let productPrice = productUnitPrice - offerProducts[product.id].discount_amount;
        productFinalPrice = productPrice * product.quantity;
      } else {
        let productPrice = Math.ceil(productUnitPrice - (productUnitPrice * (offerProducts[product.id].discount_amount / 100.0)));
        productFinalPrice = productPrice * product.quantity;
      }
    }
    return productFinalPrice;
  },
  /** Calculate a product offer price END */

  /** checking if the options have the offer time or not: for regular offer */
  offerDurationCheck: async () => {
    let rawAllOffersSql = `SELECT id, end_date, selection_type FROM offers WHERE offer_deactivation_time IS NULL && deleted_at IS NULL`;
    let rawAllOffers = await sails.sendNativeQuery(rawAllOffersSql, []);
    let allOffers = rawAllOffers.rows;

    for (let index = 0; index < allOffers.length; index++) {
      const endDate = (allOffers[index].end_date).getTime();
      const presentTime = (new Date(Date.now())).getTime();

      if (endDate < presentTime) {
        if (allOffers[index].selection_type === 'Product wise' || allOffers[index].selection_type === 'individual_product') {
          await RegularOfferProducts.update({regular_offer_id: allOffers[index].id}).set({product_deactivation_time: new Date()});
        }
        await Offer.updateOne({id: allOffers[index].id}).set({offer_deactivation_time: new Date()});
      }
    }
  },

  /** checking if the options have the offer time or not: for anonder jhor offers*/
  anonderJhorOfferDurationCheck: async () => {
    let rawAnonderJhorDataSql = ` SELECT id, end_date, status FROM anonder_jhor WHERE id = 1 AND deleted_at IS NULL`;
    let rawAnonderJhorData = await sails.sendNativeQuery(rawAnonderJhorDataSql, []);
    let anonderJhorData = rawAnonderJhorData.rows;

    if (anonderJhorData && anonderJhorData.length > 0) {
      const anonderJhorEndDate = anonderJhorData[0].end_date.getTime();
      const presentTime = (new Date(Date.now())).getTime();

      if (anonderJhorEndDate < presentTime && anonderJhorData[0].status !== 0) {
        await sails.sendNativeQuery(`UPDATE anonder_jhor SET status = 0 WHERE id = 1`);
      }

      let allAnonderJhorOffersSQL = `SELECT id, end_date FROM anonder_jhor_offers WHERE status != 0 AND deleted_at IS NULL`;
      let rawAllAnonderJhorOffers = await sails.sendNativeQuery(allAnonderJhorOffersSQL, []);
      let allAnonderJhorOffers = rawAllAnonderJhorOffers.rows;

      if (allAnonderJhorOffers && allAnonderJhorOffers.length > 0) {
        for (let index = 0; index < allAnonderJhorOffers.length; index++) {
          let offerEndTime = allAnonderJhorOffers[index].end_date.getTime();

          if (offerEndTime < presentTime || anonderJhorData[0].status === 0) {
            await AnonderJhorOffers.updateOne({id: allAnonderJhorOffers[index].id}).set({status: 0});
            await AnonderJhorOfferedProducts.update({anonder_jhor_offer_id: allAnonderJhorOffers[index].id}).set({status: 0});
          }
        }
      }
    }
  },

  /** Method called to get all offered products */
  getAllOfferedProducts: async function () {
    let finalCollectionOfProducts = {};

    /*await this.offerDurationCheck();
    await this.anonderJhorOfferDurationCheck();*/

    let presentTime = moment().format('YYYY-MM-DD HH:mm:ss');

    let _where = {};
    _where.deletedAt = null;
    _where.offer_deactivation_time = null;
    _where.start_date = {'<=': presentTime};
    _where.end_date = {'>=': presentTime};

    const requestedOffer = await Offer.find({where: _where});
    /*console.log('requestedOffer offer: ', requestedOffer);*/


    /*const rawSQL = `SELECT * FROM offers WHERE
                  offer_deactivation_time IS NULL AND DATE(start_date) <= DATE(NOW())
                  AND DATE(end_date) >= DATE(NOW()) AND deleted_at IS NULL;`;
    const rawRequestedOffer = await sails.sendNativeQuery(rawSQL, []);
    const requestedOffer1 = rawRequestedOffer.rows;
    console.log('requestedOffer1: ', requestedOffer1);*/

    let _where1 = {};
    _where1.deletedAt = null;
    _where1.status = 1;
    _where1.start_date = {'<=': presentTime};
    _where1.end_date = {'>=': presentTime};

    const requetedJhorOffer = await AnonderJhorOffers.find({where: _where1});

    const anonderJhorInfo = await AnonderJhor.findOne({id: 1, deletedAt: null});

    if (requestedOffer.length === 0 && requetedJhorOffer.length === 0) {
      finalCollectionOfProducts = {};
      return finalCollectionOfProducts;
    }

    for (let offer = 0; offer < requestedOffer.length; offer++) {
      const thisOffer = requestedOffer[offer];
      let offerObj = {
        calculation_type: thisOffer.calculation_type,
        discount_amount: thisOffer.discount_amount * 1.0,
        offer_type: REGULAR_OFFER_TYPE,
        offer_id_number: thisOffer.id,
        pay_by_sslcommerz: thisOffer.pay_by_sslcommerz,
        pay_by_bKash: thisOffer.pay_by_bKash,
        pay_by_offline: thisOffer.pay_by_offline,
        pay_by_cashOnDelivery: thisOffer.pay_by_cashOnDelivery,
        pay_by_nagad: thisOffer.pay_by_nagad
      };

      /**if selection_type === 'Vendor wise'*/
      if (thisOffer.selection_type === 'Vendor wise') {

        let products = await Product.find({
          status: 2,
          approval_status: 2,
          deletedAt: null,
          warehouse_id: thisOffer.vendor_id
        });

        if (products.length > 0) {
          products.forEach(product => {
            finalCollectionOfProducts[product.id] = offerObj;
          });
        }
      }
      /**if selection_type === 'Brand wise'*/
      if (thisOffer.selection_type === 'Brand wise') {
        let _where = {};
        _where.brand_id = thisOffer.brand_id;
        _where.status = 2;
        _where.approval_status = 2;
        _where.deletedAt = null;
        let products = await Product.find({where: _where});

        if (products.length > 0) {
          products.forEach(product => {
            finalCollectionOfProducts[product.id] = offerObj;
          });
        }
      }

      /**if selection_type === 'Category wise'*/
      if (thisOffer.selection_type === 'Category wise') {
        let _where = {};
        _where.status = 2;
        _where.approval_status = 2;
        _where.deletedAt = null;

        if (thisOffer.subSubCategory_Id) {
          _where.subcategory_id = thisOffer.subSubCategory_Id;
        } else if (thisOffer.subCategory_Id) {
          _where.category_id = thisOffer.subCategory_Id;
        } else if (thisOffer.category_id) {
          _where.type_id = thisOffer.category_id;
        }

        let products = await Product.find({where: _where});

        if (products.length > 0) {
          products.forEach(product => {
            finalCollectionOfProducts[product.id] = offerObj;
          });
        }
      }

      /** if selection_type === 'Product wise' */
      if (thisOffer.selection_type === 'Product wise') {
        let _where = {};
        _where.regular_offer_id = thisOffer.id;
        _where.product_deactivation_time = null;
        _where.deletedAt = null;
        let products = await RegularOfferProducts.find({where: _where});

        if (products.length > 0) {
          products.forEach(product => {
            finalCollectionOfProducts[product.product_id] = offerObj;
          });
        }
      }

      /** if selection_type === 'individual_product' */
      if (thisOffer.selection_type === 'individual_product') {
        let _where = {};
        _where.regular_offer_id = thisOffer.id;
        _where.product_deactivation_time = null;
        _where.deletedAt = null;
        let products = await RegularOfferProducts.find({where: _where});

        if (products.length > 0) {
          products.forEach(product => {
            finalCollectionOfProducts[product.product_id] = {
              calculation_type: product.calculation_type,
              discount_amount: product.discount_amount * 1.0,
              offer_type: REGULAR_OFFER_TYPE,
              offer_id_number: thisOffer.id,
              pay_by_sslcommerz: thisOffer.pay_by_sslcommerz,
              pay_by_bKash: thisOffer.pay_by_bKash,
              pay_by_offline: thisOffer.pay_by_offline,
              pay_by_cashOnDelivery: thisOffer.pay_by_cashOnDelivery,
              pay_by_nagad: thisOffer.pay_by_nagad
            };
          });
        }
      }
    }

    for (let jhorOffer = 0; jhorOffer < requetedJhorOffer.length; jhorOffer++) {
      const thisJhorOffer = requetedJhorOffer[jhorOffer];

      let _where2 = {};
      _where2.anonder_jhor_offer_id = thisJhorOffer.id;
      _where2.deletedAt = null;
      _where2.status = 1;

      let products = await AnonderJhorOfferedProducts.find({where: _where2});
      if (products.length > 0) {
        products.forEach(product => {
          finalCollectionOfProducts[product.product_id] = {
            calculation_type: product.calculation_type,
            discount_amount: product.discount_amount * 1.0,
            offer_type: ANONDER_JHOR_OFFER_TYPE,
            offer_id_number: thisJhorOffer.id,
            pay_by_sslcommerz: anonderJhorInfo.pay_by_sslcommerz,
            pay_by_bKash: anonderJhorInfo.pay_by_bKash,
            pay_by_offline: anonderJhorInfo.pay_by_offline,
            pay_by_cashOnDelivery: anonderJhorInfo.pay_by_cashOnDelivery,
            pay_by_nagad: anonderJhorInfo.pay_by_nagad
          };
        });
      }
    }

    return finalCollectionOfProducts;
  },

  /** This method will fetch Anonder Jhor Offer Info. START */
  getAnonderJhorInfo: async function(){
    let rawSQL = `SELECT * FROM anonder_jhor WHERE id = 1`;
    const anonderJhorRaw = await sails.sendNativeQuery(rawSQL, []);
    return anonderJhorRaw.rows;
  },
  /** This method will fetch Anonder Jhor Offer Info. END */

  /** This method will fetch web regular offers. START */
  getWebRegularOffers: async function(){
    let presentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    let _where = {};
    _where.start_date = {'<=': presentTime};
    _where.end_date = {'>=': presentTime};
    _where.offer_deactivation_time = null;
    _where.deletedAt = null;

    let webRegularOffers = await Offer.find({where: _where})
      .sort([
        {carousel_position: 'ASC'},
        {frontend_position: 'ASC'},
        {id: 'DESC'}
      ]);
    return webRegularOffers;
  },
  /** This method will fetch web regular offers. END */

  /** This method will return offer info of a product (If product exists in any of offer) */
  getProductOfferInfo: async function (product, offeredProducts) {
    /** global section */

    let itemId = product.id;
    let itemCatId = product.type_id;
    let itemSubCatId = product.category_id;
    let itemSubSubCatId = product.subcategory_id;
    let itemBrandId = product.brand_id;
    let itemWarehouseId = product.warehouse_id;

    let offer_id_number;
    let offer_type;

    if (offeredProducts && offeredProducts[itemId]) {
      /** offer section */
      let presentTime = moment().format('YYYY-MM-DD HH:mm:ss');
      let _where = {};
      _where.offer_deactivation_time = null;
      _where.deletedAt = null;
      _where.start_date = {'<=': presentTime};
      _where.end_date = {'>=': presentTime};

      let regularOffers = await Offer.find({where: _where});
      /*console.log('reglar offer csv: ', regularOffers);*/

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
            /*console.log('regular offer info in product wise: ', regularOffers[offer]);*/
            let rawSQL = `SELECT
                                  product_id
                              FROM
                                  regular_offer_products
                              WHERE
                                  regular_offer_id = ${regularOffers[offer].id} AND product_deactivation_time IS NULL AND deleted_at IS NULL `;
            const ids = await sails.sendNativeQuery(rawSQL, []);
            const productIds = ids.rows;
            /*console.log('pro wise ids: ', productIds);*/

            productIds.forEach(proId => {
              regularOfferProductsIds.push({
                regularOfferId: regularOffers[offer].id,
                productId: proId.product_id
              });
            });
          }

          if (regularOffers[offer].selection_type === 'individual_product') {
            /*console.log('regular offer info in inidi wise: ', regularOffers[offer]);*/
            let rawSQL = `SELECT
                                  product_id
                              FROM
                                  regular_offer_products
                              WHERE
                                  regular_offer_id = ${regularOffers[offer].id} AND product_deactivation_time IS NULL AND deleted_at IS NULL `;
            const ids = await sails.sendNativeQuery(rawSQL, []);
            const productIds = ids.rows;
            /*console.log('individual_product wise ids: ', productIds);*/

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
          /*console.log('regularOfferProductsIds', regularOfferProductsIds);*/
          regularOfferProductsIds.forEach(proId => {
            if (itemId === proId.productId) {
              /*console.log('in prodct ise: item id, productid: ', itemId, proId.productId);*/
              offer_id_number = proId.regularOfferId;
              offer_type = regular_offer;
            }
          });
        }

        if (regularOfferIndividualProductsIds && regularOfferIndividualProductsIds.length > 0) {
          /*console.log('regularOfferIndividualProductsIds: ', regularOfferIndividualProductsIds);*/
          regularOfferIndividualProductsIds.forEach(proId => {
            if (itemId === proId.productId) {
              /*console.log('in individual ise: item id, productid: ', itemId, proId.productId);*/
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
      let jhorOfferProductsIds = [];

      let jhorOffers = await AnonderJhorOffers.find({where: _where1});
      /*console.log('jhor offers csv: ', jhorOffers);*/

      /** storing the jhor offered products ids */
      if (jhorOffers && jhorOffers.length > 0) {
        for (let index = 0; index < jhorOffers.length; index++) {
          let anonder_jhor_offer_id = jhorOffers[index].id;
          let offeredProducts = await AnonderJhorOfferedProducts.find({anonder_jhor_offer_id: anonder_jhor_offer_id});
          offeredProducts.forEach(productIds => {
            jhorOfferProductsIds.push({
              productId: productIds.product_id,
              jhorOfferId: productIds.anonder_jhor_offer_id
            });
          });
        }
      }

      /** checking if the product exists in anonder jhor offer */
      if (jhorOfferProductsIds && jhorOfferProductsIds.length > 0) {
        jhorOfferProductsIds.forEach(prodId => {
          if (itemId === prodId.productId) {
            offer_id_number = prodId.jhorOfferId;
            offer_type = anonder_jhor;
          }
        });
      }
    }

    return {offer_id_number, offer_type};
  }


};
