exports.suborderRoute = {
  'PUT /api/v1/suborder/updatebyorderid/:id': 'SuborderController.updatebyorderid',
  'GET /api/v1/order/getOrdersByDate': 'SuborderItemController.getOrdersByDate',
  'GET /api/v1/suborders': 'SubordersController.getAll',
  'GET /api/v1/suborders/forCsv': 'SubordersController.forCsv',
  'POST /api/v1/suborders/massPrStatusUpdate': 'SubordersController.massPrStatusUpdate',
  'GET /api/v1/suborder/getWithFull/:id': 'SuborderController.getWithFull',
};
