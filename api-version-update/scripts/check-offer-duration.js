module.exports = {


  friendlyName: 'Check offer duration',


  description: 'It will check the offer duration and disable the status of an offer if the end time exceeds the present time',


  fn: async function (inputs, exits) {

    sails.log('Running custom shell script... (`sails run check-offer-duration`)');
    console.log('in Check offer duration script');
    try {
      await OfferService.offerDurationCheck();
      await OfferService.anonderJhorOfferDurationCheck();

      return exits.success();
    } catch (error) {
      console.log('Offer duration checking and updating failed');
      console.log(error);
      return exits.error(error);
    }

  }


};

