exports.offerRoute = {
  'GET /api/v1/offer/getAllOptions': 'OfferController.getAllOptions',
  'POST /api/v1/offer/offerInsert': 'OfferController.offerInsert',
  'GET /api/v1/offer/allRegularOffer': 'OfferController.allRegularOffer',
  'GET /api/v1/offer/getRegularOfferById': 'OfferController.getRegularOfferById',
  'GET /api/v1/offer/getRelatedOfferProducts': 'OfferController.getRelatedOfferProducts',
  'DELETE /api/v1/offer/removeProductFromOffer': 'OfferController.removeProductFromOffer',
  'POST /api/v1/offer/updateOffer': 'OfferController.updateOffer',
};
