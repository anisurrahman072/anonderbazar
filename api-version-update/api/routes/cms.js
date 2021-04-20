exports.cmsRoutes = {
  'PUT /api/v1/cms/deleteCarouselImage/:id': [
    {controller: 'CMSController', action: 'deleteCarouselImage'}
  ],
  'GET /api/v1/cms2/by-page-section': [
    {controller: 'Cms2Controller', action: 'byPageNSection'}
  ],
  'GET /api/v1/cms2/by-page-section-subsection': [
    {controller: 'Cms2Controller', action: 'byPageNSectionNSubsection'}
  ],
  'PUT /api/v1/cms/uploadCarouselImage/:id': [
    {controller: 'CMSController', action: 'uploadCarouselImage'}
  ],
};
