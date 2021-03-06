exports.offerRoute = {
  'GET /api/v1/offer/getAllOptions': 'OfferController.getAllOptions',
  'POST /api/v1/offer/offerInsert': 'OfferController.offerInsert',
  'GET /api/v1/offer/allRegularOffer': 'OfferController.allRegularOffer',
  'GET /api/v1/offer/getRegularOfferById': 'OfferController.getRegularOfferById',
  'GET /api/v1/offer/getRelatedOfferProducts': 'OfferController.getRelatedOfferProducts',
  'GET /api/v1/offer/getRelatedOfferIndividualProducts': 'OfferController.getRelatedOfferIndividualProducts',
  'DELETE /api/v1/offer/removeProductFromOffer': 'OfferController.removeProductFromOffer',
  'DELETE /api/v1/offer/removeIndividualProductFromOffer': 'OfferController.removeIndividualProductFromOffer',
  'POST /api/v1/offer/updateOffer': 'OfferController.updateOffer',
  'GET /api/v1/offer/getSelectedProductsInfo': 'OfferController.getSelectedProductsInfo',
  'POST /api/v1/offer/activeStatusChange': 'OfferController.activeStatusChange',
  'GET /api/v1/offer/getWebRegularOffers': 'OfferController.webRegularOffers',
  'GET /api/v1/offer/getWebRegularOfferById': 'OfferController.webRegularOfferById',
  'GET /api/v1/offer/getAllOfferedProducts': 'OfferController.getAllOfferedProducts',
  'POST /api/v1/offer/checkIndividualProductsCodesValidity': 'OfferController.checkIndividualProductsCodesValidity',
  'GET /api/v1/offer/generateExcel': 'OfferController.generateExcel',
  'GET /api/v1/offer/generateOfferedExcel': 'OfferController.generateOfferedExcel',
  'GET /api/v1/offer/getOfferedProductsBrands': 'OfferController.getOfferedProductsBrands',
};
