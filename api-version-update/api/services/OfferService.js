module.exports = {
  /**checking if the options have the offer time or not*/
  offerDurationCheck: async () => {
    let allOffers = await Offer.find({deletedAt: null});
    for (let index = 0; index < allOffers.length; index++) {
      const endDate = (allOffers[index].end_date).getTime();
      const presentTime = (new Date(Date.now())).getTime();

      if (endDate < presentTime) {
        if(allOffers[index].selection_type === 'Product wise') {
          await RegularOfferProducts.update({regular_offer_id: allOffers[index].id}).set({product_deactivation_time: new Date()});
        }
        await Offer.updateOne({id: allOffers[index].id}).set({offer_deactivation_time: new Date()});
      }
    }
  }
};
