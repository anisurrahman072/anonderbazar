const {escapeExcel} = require('./helper');

exports.columnListForBulkUpload = {
  'Category': {
    width: 50,
    validation: 'list',
    sheetName: 'Category'
  },
  'Vendor Code': {
    width: 20,
    validation: 'list',
    sheetName: 'Warehouse'
  },
  'Product Name': {width: 30},
  'SKU(code)': {width: 15},
  'Description': {width: 60},
  'Brand': {
    width: 15,
    validation: 'list',
    sheetName: 'Brand'
  },
  'Price': {
    width: 10,
    validation: 'decimal'
  },
  'Discount Price': {
    width: 15,
    validation: 'decimal'
  },
  'Vendor Price': {
    width: 15,
    validation: 'decimal'
  },
  'Quantity': {
    width: 10,
    validation: 'decimal'
  },
  'Weight': {
    width: 10,
    validation: 'decimal'
  },
  'Frontend Position': {
    width: 20,
    validation: 'decimal'
  },
  'Tags': {width: 15},
  'Main Image': {width: 15},
  'Image 1': {width: 15},
  'Image 2': {width: 15},
  'Image 3': {width: 15},
  'Image 4': {width: 15},
  'Image 5': {width: 15}
};
exports.columnListForBulkUpdate = function (isAdmin) {
  let index = 1;
  let variant = {
    'Variant': {
      width: 50,
      validation: 'list',
      sheetName: 'Category'
    },
    'Variant Info': {width: 30},
    'Variant Id': {width: 30}
  };

  let columnNamesObject = {
    'Category': {
      width: 50,
      validation: 'list',
      sheetName: 'Category'
    }
  };
  if (isAdmin) {
    columnNamesObject = {
      ...columnNamesObject,
      'Vendor Code': {
        width: 20,
        validation: 'list',
        sheetName: 'Warehouse'
      }
    };
  }
  columnNamesObject = {
    ...columnNamesObject,
    'Product Name': {width: 30},
    'SKU(code)': {width: 15},
    'Description': {width: 60},
    'Brand': {
      width: 15,
      validation: 'list',
      sheetName: 'Brand'
    },
    'Price': {
      width: 10,
      validation: 'decimal'
    },
    'Discount Price': {
      width: 15,
      validation: 'decimal'
    },
    'Vendor Price': {
      width: 15,
      validation: 'decimal'
    },
    'Quantity': {
      width: 10,
      validation: 'decimal'
    },
    'Weight': {
      width: 10,
      validation: 'decimal'
    },
    'Frontend Position': {
      width: 20,
      validation: 'decimal'
    },
    'Offline Payment': {
      width: 20,
      validation: 'decimal'
    },
    'Free Shipping': {
      width: 20,
      validation: 'decimal'
    },
    'Partially Payable': {
      width: 20,
      validation: 'decimal'
    },
    'Disable Cash on Delivery': {
      width: 30,
      validation: 'decimal'
    },
    'Tags': {width: 15},
    'Main Image': {width: 50},
    'Image1': {width: 50},
    'Image2': {width: 50},
    'Image3': {width: 50},
    'Image4': {width: 50},
    'Image5': {width: 50},

    'Variant1 Id': {width: 30},
    'Variant1': {
      width: 50,
      validation: 'list',
      sheetName: 'Variant'
    },
    'Variant1 Info': {width: 30},

    'Variant2 Id': {width: 30},
    'Variant2': {
      width: 50,
      validation: 'list',
      sheetName: 'Variant'
    },
    'Variant2 Info': {width: 30},

    'Variant3 Id': {width: 30},
    'Variant3': {
      width: 50,
      validation: 'list',
      sheetName: 'Variant'
    },
    'Variant3 Info': {width: 30},

    'Variant4 Id': {width: 30},
    'Variant4': {
      width: 50,
      validation: 'list',
      sheetName: 'Variant'
    },
    'Variant4 Info': {width: 30},

    'Variant5 Id': {width: 30},
    'Variant5': {
      width: 50,
      validation: 'list',
      sheetName: 'Variant'
    },
    'Variant5 Info': {width: 30},

    'Variant6 Id': {width: 30},
    'Variant6': {
      width: 50,
      validation: 'list',
      sheetName: 'Variant'
    },
    'Variant6 Info': {width: 30}
  };

  return columnNamesObject;
};

exports.categoryDropDownForExcel = async (categorySheet) => {
  /* Fetch Category List and create category drop down for excel */
  let categoryList = await Category.find({
    where: {type_id: 2, deletedAt: null, parent_id: 0},
    sort: 'name ASC'
  });

  if (!(categoryList && categoryList.length > 0)) {
    return;
  }

  const categoryLen = categoryList.length;
  let categoryRowIndex = 1;

  for (let cat = 0; cat < categoryLen; cat++) {
    let categoryLabel = categoryList[cat].name;
    categorySheet.cell(categoryRowIndex, 1).string(categoryList[cat].id + '|' + escapeExcel(categoryLabel));
    categoryRowIndex++;
    let subCategoryList = await Category.find({
      where: {type_id: 2, deletedAt: null, parent_id: categoryList[cat].id},
      sort: 'name ASC'
    });
    if (subCategoryList && subCategoryList.length > 0) {
      const subCategoryLen = subCategoryList.length;
      for (let subCat = 0; subCat < subCategoryLen; subCat++) {
        let subCategoryLabel = categoryLabel + '=>' + subCategoryList[subCat].name;
        categorySheet.cell(categoryRowIndex, 1).string(categoryList[cat].id + ',' + subCategoryList[subCat].id + '|' + escapeExcel(subCategoryLabel));
        categoryRowIndex++;
        let subSubCategoryList = await Category.find({
          where: {type_id: 2, deletedAt: null, parent_id: subCategoryList[subCat].id},
          sort: 'name ASC'
        });

        if (subSubCategoryList && subSubCategoryList.length > 0) {
          const subSubCategoryLen = subSubCategoryList.length;
          for (let subSubCat = 0; subSubCat < subSubCategoryLen; subSubCat++) {
            let subSubCategoryLabel = subCategoryLabel + '=>' + subSubCategoryList[subSubCat].name;
            categorySheet.cell(categoryRowIndex, 1).string(categoryList[cat].id + ',' + subCategoryList[subCat].id + ',' + subSubCategoryList[subSubCat].id + '|' + escapeExcel(subSubCategoryLabel));
            categoryRowIndex++;
          }
        }
      }
    }
  }

};
