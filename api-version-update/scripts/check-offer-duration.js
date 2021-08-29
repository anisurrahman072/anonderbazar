module.exports = {


  friendlyName: 'Check offer duration',


  description: 'It will check the offer duration and disable the status of an offer if the end time exceeds the present time',


  fn: async function (inputs, exits) {

    sails.log('Running custom shell script... (`sails run check-offer-duration`)');
    console.log('in Check offer duration script');
    try {
      await OfferService.offerDurationCheck();
      await OfferService.anonderJhorOfferDurationCheck();

      const getAllOfferedProducts = await OfferService.getAllOfferedProducts();
      await sails.helpers.cacheWrite('getAllOfferedProducts', 3600, JSON.stringify(getAllOfferedProducts));

      const getAnonderJhorInfo = await OfferService.getAnonderJhorInfo();
      await sails.helpers.cacheWrite('getAnonderJhorInfo', 3600, JSON.stringify(getAnonderJhorInfo));

      const getWebRegularOffers = await OfferService.getWebRegularOffers();
      await sails.helpers.cacheWrite('getWebRegularOffers', 3600, JSON.stringify(getWebRegularOffers));


      return exits.success();
    } catch (error) {
      console.log('Offer duration checking and updating failed');
      console.log(error);
      return exits.error(error);
    }

  }


};

