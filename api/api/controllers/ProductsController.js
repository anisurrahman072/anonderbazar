import {asyncForEach, initLogPlaceholder, pagination} from '../../libs';
import {escapeExcel} from "../../libs/helper";
import xl from 'excel4node';

module.exports = {
  //Method called for getting all products
  //Model models/Product.js
  index: async (req, res) => {
    try {
      initLogPlaceholder(req, 'productList');

      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};
      _where.deletedAt = null;

      if (req.query.status) {
        _where.status = req.query.status;
      }
      if (req.query.warehouse_id) {
        _where.warehouse_id = req.query.warehouse_id;
      }
      if (req.query.approval_status) {
        _where.approval_status = req.query.approval_status;
      }
      if (req.token && req.token.userInfo.warehouse_id) {
        _where.warehouse_id = req.token.userInfo.warehouse_id.id;
      }
      if (req.query.type_id) {
        _where.type_id = req.query.type_id;
      }
      if (req.query.category_id) {
        _where.category_id = req.query.category_id;
      }
      if (req.query.brand_id) {
        _where.brand_id = req.query.brand_id;
      }
      if (req.query.price) {
        _where.price = req.query.price;
      }
      if (req.query.subcategory_id) {
        _where.subcategory_id = req.query.subcategory_id;
      }

      if (req.query.search_term) {

        _where.or = [
          {name: {like: `%${req.query.search_term}%`}},
          {code: {like: `%${req.query.search_term}%`}}
        ];
      } else if (req.query.search_code) {
        // class: { 'like': '%history%' }})

        _where.or = [
          {code: {like: `%${req.query.search_code}%`}}
        ];
      }
      /* WHERE condition..........END................*/

      /* sort................ */
      console.log('req.query', req.query)
      let _sort = {};
      if (req.query.sortCode) {
        _sort.code = req.query.sortCode;
      }
      if (req.query.sortName) {
        _sort.name = req.query.sortName;
      }
      if (req.query.sortPrice) {
        _sort.price = req.query.sortPrice;
      }
      if (req.query.sortQuantity) {
        _sort.quantity = req.query.sortQuantity;
      }
      if (req.query.sortUpdatedAt) {
        _sort.updatedAt = req.query.sortUpdatedAt;
      }
      /*.....SORT END..............................*/

      let totalProduct = await Product.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalProduct;
      let products = await Product.find({
        where: _where,
        limit: _pagination.limit,
        skip: _pagination.skip,
        sort: _sort
      }).populate("product_images", {deletedAt: null})
        .populate("product_variants", {deletedAt: null})
        .populate("category_id", {deletedAt: null})
        .populate("subcategory_id", {deletedAt: null})
        .populate("type_id", {deletedAt: null})
        .populate("warehouse_id", {deletedAt: null})
        .populate("craftsman_id", {deletedAt: null})
        .populate("brand_id", {deletedAt: null});

      res.status(200).json({
        success: true,
        total: totalProduct,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All products with pagination',
        data: products
      });
    } catch (error) {
      let message = 'Error in Get All products with pagination';
      res.status(400).json({
        success: false,
        message
      });
    }
  },
  //Method called for creating a product
  //Model models/Product.js
  create: async (req, res) => {
    return res.ok('from create');
  },
  //Method called for getting a product
  //Model models/Product.js
  findOne: async (req, res) => {
    try {
      initLogPlaceholder(req, 'readSingleProduct');

      let product = await Product.findOne({
        where: {
          id: req.params._idwms
        }
      });

      res.status(200).json({
        success: true,
        message: 'read single farmer',
        data: product ? product : {}
      });
    } catch (error) {
      let message = 'error in read single farmer';
      res.status(400).json({
        success: false,
        message
      });
    }
  },
  //Method called for creating a product design combination
  //Model models/Product.js,models/ProductDesign.js,models/CraftmanPrice.js
  designCombination: async (req, res) => {
    try {
      initLogPlaceholder(req, 'designCombination');

      let productId = req.params._id;

      let productDesignData = await ProductDesign.find({
        where: {product_id: req.params._id, deletedAt: null}
      }).populateAll();

      let data = [];
      await asyncForEach(productDesignData, async _productDesign => {
        let tmpCraftmanPrice = await CraftmanPrice.find({
          where: {
            deletedAt: null,
            part_id: _productDesign.part_id.id,
            design_id: _productDesign.design_id.id
          }
        });

        let filteredData = data.findIndex(
          _d => _d.part.id === _productDesign.part_id.id
        );
        if (filteredData > -1) {
          /*available.............*/
          data[filteredData].warehouseData.push(_productDesign);
          data[filteredData].craftManPriceData.push(tmpCraftmanPrice);
        } else {
          data.push({
            part: _productDesign.part_id,
            warehouseData: [_productDesign],
            craftManPriceData: [tmpCraftmanPrice]
          });
        }
      });

      res.status(200).json({
        success: true,
        message: 'get from product designCombination',
        data
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'error from designCombination'
      });
    }
  },
  /*..........................................................*/
  //Method called for getting products with search term
  //Model models/Product.js
  search: async (req, res) => {
    try {
      let _pagination = pagination(req.query);

      let _where = {};
      _where.deletedAt = null;

      if (req.query.filters) {
        let filters = JSON.parse(req.query.filters);

        console.log('filters', filters)

        if (filters.searchTerm) {
          _where.or = [
            {name: {contains: filters.searchTerm}}
          ];
        }

        if (filters.approval_status) {
          _where.approval_status = filters.approval_status
        }

        if (typeof filters.featured !== 'undefined') {
          _where.featured = filters.featured
        }

        if (filters.categoryList.length) {
          _where.category_id = filters.categoryList;
        }

        if (filters.subcategoryList.length) {
          _where.subcategory_id = filters.subcategoryList;
        }

        if (filters.typeList.length) {
          _where.type_id = filters.typeList;
        }

        if (filters.brandList.length) {
          _where.brand_id = filters.brandList;
        }

        if (filters.priceRange) {
          if (filters.priceRange[0] && filters.priceRange[1]) {
            _where.price = {
              '>=': filters.priceRange[0],
              '<=': filters.priceRange[1]
            };
          }
        }
        if (filters.craftsmanList.length) {
          _where.craftsman_id = filters.craftsmanList;
        }
        if (filters.warehousesList.length) {
          _where.warehouse_id = filters.warehousesList;
        }
      }

      console.log('search-_where', _where)

      /* Sort................ */
      let _sort = {};
      if (req.query.sortTitle) {
        _sort[req.query.sortTitle] = parseInt(req.query.sortTerm) === 1 ? 'DESC' : 'ASC';
      } else {
        _sort['name'] = 'ASC';
      }

      let total = await Product.count(_where);
      let products = await Product.find({
        where: _where,
        limit: _pagination.limit,
        sort: _sort,
        skip: _pagination.skip
      }).populate([
        'category_id',
        'subcategory_id',
        'type_id',
        'craftsman_id',
        'product_variants',
        'product_images',
        'brand_id',
        'warehouse_id'
      ]);

      return res.status(200).json({
        success: true,
        message: 'get product in search',
        total,
        data: products,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'error in search product',
        error
      });
    }
  },
  //Method called for getting products with search term
  //Model models/Product.js,models/Category.js
  getBySearchTerm: async (req, res) => {

    try {
      let _pagination = pagination(req.query);

      console.log('getBySearchTerm-req.query', req.query)
      let _where = {};
      _where.deletedAt = null;

      if (req.query.searchterm) {
        _where.or = [
          {name: {contains: req.query.searchterm}}
        ];
      }

      let productTotal = await Product.count(_where);
      let products = await Product.find(
        {where: _where},
        {select: ['id', 'name', 'subcategory_id']}
      )
        .populate('subcategory_id')
        .paginate({page: _pagination._page, limit: _pagination._limit});

      let _products = products.map(p => {
        p.type = 'product';
        return p;
      });
      let categoryTotal = await Category.count(_where);
      let categories = await Category.find(
        {
          where: Object.assign({}, _where, {
            type_id: 2
          })
        },
        {select: ['id', 'name', 'parent_id']}
      ).paginate({page: _pagination._page, limit: _pagination._limit});

      let _categories = categories.map(p => {
        p.type = p.parent_id == 0 ? 'category' : 'subcategory';
        return p;
      });

      const total = productTotal;
      return res.status(200).json({
        success: true,
        message: 'get product in search ',
        total,
        data: _categories.concat(_products)
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'error in search product',
        error
      });
    }
  },
  generateExcel: async (req, res) => {
    try {

      // Create a new instance of a Workbook class
      const wb = new xl.Workbook({
        jszip: {
          compression: 'DEFLATE',
        },
        defaultFont: {
          size: 12,
          name: 'Calibri',
          color: '#100f0f',
        },
        dateFormat: 'd/m/yyyy hh:mm:ss a',
        author: 'Anonder Bazar', // Name for use in features such as comments
      });


      // Add Worksheets to the workbook
      const options = {
        margins: {
          left: 1.5,
          right: 1.5,
        }
      };

      const ws = wb.addWorksheet('Product List', options);
      const categorySheet = wb.addWorksheet('Category', options);
      const subCategorySheet = wb.addWorksheet('Sub Category', options);
      const subSubCategorySheet = wb.addWorksheet('Sub Sub Category', options);
      const brandSheet = wb.addWorksheet('Brand', options);

      /* Fetch Category List */
      let categoryList = await Category.find({
        where: {type_id: 2, deletedAt: null, parent_id: 0},
        sort: 'name ASC'
      });

      // let categoryListValues = [];
      let categoryIds = [];
      categoryList.forEach((item, i) => {
        categorySheet.cell(i + 1, 1).string(item.id + '|' + escapeExcel(item.name));
        categoryIds.push(item.id);
      });


      /* Fetch Sub Category List */
      let subCategoryList = await Category.find({
        where: {type_id: 2, deletedAt: null, parent_id: categoryIds},
        sort: 'name ASC'
      });

      let subCategoryIds = [];
      subCategoryList.forEach((item, i) => {
        subCategorySheet.cell(i + 1, 1).string(item.id + '|' + escapeExcel(item.name));
        subCategoryIds.push(item.id);
      });

      /* Fetch Sub Sub Category List */
      let subSubCategoryList = await Category.find({
        where: {type_id: 2, deletedAt: null, parent_id: subCategoryIds},
        sort: 'name ASC'
      });

      subSubCategoryList.forEach((item, i) => {
        subSubCategorySheet.cell(i + 1, 1).string(item.id + '|' + escapeExcel(item.name));
      });

      /* Fetch Brand List */
      let brandList = await Brand.find({
        where: {deletedAt: null},
        sort: 'name ASC'
      });
      brandList.forEach((item, i) => {
        brandSheet.cell(i + 1, 1).string(item.id + '|' + escapeExcel(item.name));
      });


// Create a reusable style
      const headerStyle = wb.createStyle({
        font: {
          color: '#070c02',
          size: 14,
        },
      });

// Set value of cell A1 to 100 as a number type styled with paramaters of style
      ws.column(1).setWidth(30); // Name
      ws.column(2).setWidth(12); // Code
      ws.column(3).setWidth(15); // Price
      ws.column(4).setWidth(15); // Vendor Price
      ws.column(5).setWidth(15); // Quantity
      ws.column(6).setWidth(15);  // Min Order Quantity
      ws.column(7).setWidth(15);  // Alert Quantity
      ws.column(8).setWidth(12);  // Weight
      ws.column(9).setWidth(30);  // Type
      ws.column(10).setWidth(30);  // Category
      ws.column(11).setWidth(30);  // Sub Category
      ws.column(12).setWidth(30);  // Brand
      ws.column(13).setWidth(25);  // Image
      ws.column(14).setWidth(15);  // Tag
      ws.column(15).setWidth(30);  // Description

      ws.cell(1, 1).string("Name").style(headerStyle);
      ws.cell(1, 2).string("Code").style(headerStyle);
      ws.cell(1, 3).string("Price").style(headerStyle);
      ws.cell(1, 4).string("V.Price").style(headerStyle);
      ws.cell(1, 5).string("Quantity").style(headerStyle);
      ws.cell(1, 6).string("Min Order Qty").style(headerStyle);
      ws.cell(1, 7).string("Alert Qty").style(headerStyle);
      ws.cell(1, 8).string("Weight").style(headerStyle);
      ws.cell(1, 9).string("Category").style(headerStyle);
      ws.cell(1, 10).string("Sub Category").style(headerStyle);
      ws.cell(1, 11).string("Sub Sub Category").style(headerStyle);
      ws.cell(1, 12).string("Brand").style(headerStyle);
      ws.cell(1, 13).string("Image").style(headerStyle);
      ws.cell(1, 14).string("Tag").style(headerStyle);
      ws.cell(1, 15).string("Description").style(headerStyle);

      ws.addDataValidation({
        type: 'decimal',
        allowBlank: false,
        sqref: 'C2:C100',
      });
      ws.addDataValidation({
        type: 'decimal',
        allowBlank: false,
        sqref: 'D2:D100',
      });
      ws.addDataValidation({
        type: 'decimal',
        allowBlank: false,
        sqref: 'E2:E100',
      });
      ws.addDataValidation({
        type: 'decimal',
        allowBlank: false,
        sqref: 'F2:F100',
      });
      ws.addDataValidation({
        type: 'decimal',
        allowBlank: false,
        sqref: 'G2:G100',
      });
      ws.addDataValidation({
        type: 'decimal',
        allowBlank: true,
        sqref: 'H2:H100',
      });

      ws.addDataValidation({
        type: 'list',
        allowBlank: false,
        prompt: 'Choose from dropdown',
        error: 'Invalid choice was chosen',
        showDropDown: true,
        sqref: 'I2:I1000',
        formulas: ['=Category!$A:$A'],
      });
      ws.addDataValidation({
        type: 'list',
        allowBlank: false,
        prompt: 'Choose from dropdown',
        error: 'Invalid choice was chosen',
        showDropDown: true,
        sqref: 'J2:J1000',
        formulas: ["='Sub Category'!$A:$A"],
      });
      ws.addDataValidation({
        type: 'list',
        allowBlank: false,
        prompt: 'Choose from dropdown',
        error: 'Invalid choice was chosen',
        showDropDown: true,
        sqref: 'K2:K1000',
        formulas: ["='Sub Sub Category'!$A:$A"],
      });

      ws.addDataValidation({
        type: 'list',
        allowBlank: false,
        prompt: 'Choose from dropdown',
        error: 'Invalid choice was chosen',
        showDropDown: true,
        sqref: 'L2:L1000',
        formulas: ['=Brand!$A:$A'],
      });

      wb.write('Excel-' + Date.now() + '.xlsx', res);

    } catch (error) {
      console.error(error)
      return res.status(400).json({
        success: false,
        message: 'error in generating excel',
        error
      });
    }
  },
  bulkUpload: async (req, res) => {
    try {
      const isApproved = parseInt(req.query.isApproved);

      // console.log('req.body', req.body)
      const len = req.body.length;
      let problematicRow = 0;
      for (let i = 0; i < len; i++) {
        if (
          !(req.body[i].name !== '' && req.body[i].code !== '' && req.body[i].price !== '' && req.body[i].quantity !== '' &&
            req.body[i].type_id !== '' && req.body[i].type_id.indexOf('|') !== -1 &&
            req.body[i].category_id !== '' && req.body[i].category_id.indexOf('|') !== -1 &&
            req.body[i].subcategory_id !== '' && req.body[i].subcategory_id.indexOf('|') !== -1 &&
            req.body[i].product_details !== '')
        ) {
          problematicRow = i + 1;
          break;
        }
      }

      if (problematicRow > 0) {
        console.log('There is a problem in row ' + problematicRow)
        return res.status(400).json({
          success: false,
          message: 'There is a problem in row ' + problematicRow,
          error: null
        });
      }

      const dataToSave = req.body.map((item) => {
        const newItem = {
          ...item,
          min_unit: item.min_unit ? parseFloat(item.min_unit) : 1,
          alert_quantity: parseFloat(item.alert_quantity) ? item.alert_quantity : 1,
          weight: item.weight ? parseFloat(item.weight) : null,
          // image: item.image ? '/' + item.image : null,
        };

        let additionalImages = [];
        if (item.image) {
          additionalImages = item.image.split(',');
          newItem.image = additionalImages[0].trim();
          if (additionalImages.length > 1) {
            newItem.additional_images = additionalImages.slice(1)
          }
        } else {
          newItem.image = null;
        }

        let parts = item.type_id.split('|');
        newItem.type_id = parts[0].trim();

        parts = item.category_id.split('|');
        newItem.category_id = parts[0].trim();

        parts = item.subcategory_id.split('|');
        newItem.subcategory_id = parts[0].trim();

        if (item.brand_id && item.brand_id.indexOf('|') !== -1) {
          parts = item.brand_id.split('|');
          newItem.brand_id = parts[0].trim();
        }

        newItem.price = parseFloat(item.price);
        newItem.vendor_price = parseFloat(item.vendor_price);
        newItem.featured = 0;
        newItem.promotion = 0;

        if (isApproved !== 0) {
          newItem.approval_status = 2;
          newItem.approval_status_updated_by = newItem.created_by;
        }
        return newItem;

      });

      let count = 0;
      for (const item of dataToSave) {
        const foundProduct = await Product.findOne({
          code: item.code
        })

        if (foundProduct === null || foundProduct === undefined) {
          try {
            let additionalImages = [];
            if (typeof item.additional_images !== 'undefined') {
              additionalImages = item.additional_images;
              delete item.additional_images;
            }

            const createdProduct = await Product.create(item);

            if (createdProduct && additionalImages.length > 0) {

              for (let additionalImage of additionalImages) {
                await ProductImage.create({image_path: additionalImage.trim(), product_id: createdProduct.id});
              }
            }
            count++;
          } catch (e) {
            console.error(e);
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Number of Products successfully created: ' + count,
      });

    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'error in bulk product upload',
        error
      });
    }
  }
};
