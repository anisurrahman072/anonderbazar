const _ = require('lodash');

module.exports = {
  /** Calculate a Cart Item Product total price according to offer*/
  calcCartItemTotalOfferPrice: async (product) => {
    console.log('For product offer price: ');
    let productFinalPrice;
    let offerProducts = await PaymentService.getRegularOfferStore();

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

    if(anonderJhorEndDate < presentTime) {
      anonderJhorData = await AnonderJhor.updateOne({id: 1}).set({status: 0});
    }

    let allAnonderJhorOffers = await AnonderJhorOffers.find({deletedAt: null});
    for(let index = 0; index < allAnonderJhorOffers.length; index++) {
      let offerEndTime = allAnonderJhorOffers[index].end_date;
      if( offerEndTime < presentTime || anonderJhorData.status === 0) {
        await AnonderJhorOffers.updateOne({id: allAnonderJhorOffers[index].id}).set({status: 0});
      }
    }
  }
};
