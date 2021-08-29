const _ = require('lodash');

module.exports = {
  allCategories: async () => {
    let categories = await Category.find({deletedAt: null, parent_id: 0, type_id: 2, show_in_nav: 1}).populate('offer_id');
    return categories;
  },

  withSubcategoriesV2: async () => {
    let categories = await Category.find({deletedAt: null, parent_id: 0, type_id: 2});

    const parentCategoryIds = categories.map((cat) => cat.id);

    const allSubCategories = await Category.find({deletedAt: null, parent_id: parentCategoryIds, type_id: 2});
    const subCategoryIndexes = _.groupBy(allSubCategories, 'parent_id');

    const allSubCategoriesIds = allSubCategories.map((cat) => cat.id);
    const allSubSubCategories = await Category.find({deletedAt: null, parent_id: allSubCategoriesIds, type_id: 2});
    const subSubCategoryIndexes = _.groupBy(allSubSubCategories, 'parent_id');

    const allCategories = _.merge(subCategoryIndexes, subSubCategoryIndexes);
    return allCategories;
  }
};
