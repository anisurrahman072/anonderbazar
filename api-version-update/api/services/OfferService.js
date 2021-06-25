module.exports = {
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
