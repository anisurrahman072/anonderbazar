exports.cmsRoutes = {
  'PUT /api/v1/cms/deleteCarouselImage/:id': [
    {controller: 'CMSController', action: 'deleteCarouselImage'}
  ],
  'PUT /api/v1/cms/uploadCarouselImage/:id': [
    {controller: 'CMSController', action: 'uploadCarouselImage'}
  ],
};
