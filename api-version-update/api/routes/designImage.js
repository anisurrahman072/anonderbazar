exports.designImageRoute = {
  'GET /api/v1/designimages': 'DesignImageController.getAll',
  'GET /api/v1/designImages/getAllByProductId/:_id': 'DesignImageController.getAllByProductId',
  'GET /api/v1/designImages/getSingleByProductId/:_id': 'DesignImageController.getSingleDesignCombinationImage',
  'GET /api/v1/designImages/:_id': 'DesignImageController.findOne',
  'PUT /api/v1/designImages/:_id': 'DesignImageController.updateByProductId',
};
