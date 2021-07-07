const _ = require('lodash');
const moment = require('moment');

module.exports = {
  /** Calculate a product price according to offer*/
  calcProductOfferPrice: async function (product) {
    let productFinalPrice;
    let offerProducts = await this.getRegularOfferStore();

    if (!(offerProducts && !_.isUndefined(offerProducts[product.id]) && offerProducts[product.id])) {
      productFinalPrice = product.price * product.quantity;
    } else {
      if (offerProducts && offerProducts[product.id].calculation_type === 'absolute') {
        let productPrice = product.price - offerProducts[product.id].discount_amount;
        productFinalPrice = productPrice * product.quantity;
      } else {
        let productPrice = product.price - (product.price * (offerProducts[product.id].discount_amount / 100.0));
        productFinalPrice = productPrice * product.quantity;
      }
    }
    return productFinalPrice;
  },
  /** Calculate a product offer price END */

  /**checking if the options have the offer time or not*/
  offerDurationCheck: async () => {
    let allOffers = await Offer.find({deletedAt: null});
    for (let index = 0; index < allOffers.length; index++) {
      const endDate = (allOffers[index].end_date).getTime();
      const presentTime = (new Date(Date.now())).getTime();

      if (endDate < presentTime) {
        if (allOffers[index].selection_type === 'Product wise') {
          await RegularOfferProducts.update({regular_offer_id: allOffers[index].id}).set({product_deactivation_time: new Date()});
        }
        await Offer.updateOne({id: allOffers[index].id}).set({offer_deactivation_time: new Date()});
      }
    }
  },

  /**checking if the options have the offer time or not*/
  anonderJhorOfferDurationCheck: async () => {
    let anonderJhorData = await AnonderJhor.findOne({id: 1});

    const anonderJhorEndDate = anonderJhorData.end_date.getTime();
    const presentTime = (new Date(Date.now())).getTime();

    if (anonderJhorEndDate < presentTime) {
      anonderJhorData = await AnonderJhor.updateOne({id: 1}).set({status: 0});
    }

    let allAnonderJhorOffers = await AnonderJhorOffers.find({deletedAt: null});
    for (let index = 0; index < allAnonderJhorOffers.length; index++) {
      let offerEndTime = allAnonderJhorOffers[index].end_date;
      if (offerEndTime < presentTime || anonderJhorData.status === 0) {
        await AnonderJhorOffers.updateOne({id: allAnonderJhorOffers[index].id}).set({status: 0});
      }
    }
  },

  getRegularOfferStore: async function () {
    let finalCollectionOfProducts = {};

    await this.offerDurationCheck();
    await this.anonderJhorOfferDurationCheck();

    let presentTime = moment().format('YYYY-MM-DD HH:mm:ss');

    let _where = {};
    _where.deletedAt = null;
    _where.offer_deactivation_time = null;
    _where.start_date = {'<=': presentTime};
    _where.end_date = {'>=': presentTime};

    const requestedOffer = await Offer.find({where: _where});

    let _where1 = {};
    _where1.deletedAt = null;
    _where1.status = 1;
    _where1.start_date = {'<=': presentTime};
    _where1.end_date = {'>=': presentTime};

    const requetedJhorOffer = await AnonderJhorOffers.find({where: _where1});

    if (requestedOffer.length === 0 && requetedJhorOffer.length === 0) {
      finalCollectionOfProducts = {};
      return finalCollectionOfProducts;
    }

    for (let offer = 0; offer < requestedOffer.length; offer++) {
      const thisOffer = requestedOffer[offer];
      let offerObj = {
        calculation_type: thisOffer.calculation_type,
        discount_amount: thisOffer.discount_amount,
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
            };
          });
        }
      }
    }

    for (let jhorOffer = 0; jhorOffer < requetedJhorOffer.length; jhorOffer++) {
      const thisJhorOffer = requetedJhorOffer[jhorOffer];

      let jhorOfferObj = {
        calculation_type: thisJhorOffer.calculation_type,
        discount_amount: thisJhorOffer.discount_amount
      };

      let _where2 = {};
      _where2.status = 2;
      _where2.approval_status = 2;
      _where2.deletedAt = null;

      if (thisJhorOffer.sub_sub_category_id) {
        _where2.subcategory_id = thisJhorOffer.sub_sub_category_id;
      } else if (thisJhorOffer.sub_category_id) {
        _where2.category_id = thisJhorOffer.sub_category_id;
      } else if (thisJhorOffer.category_id) {
        _where2.type_id = thisJhorOffer.category_id;
      }

      let products = await Product.find({where: _where2});
      if (products.length > 0) {
        products.forEach(product => {
          finalCollectionOfProducts[product.id] = jhorOfferObj;
        });
      }
    }

    return finalCollectionOfProducts;
  },
};
