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
        _sort['createdAt'] = 'DESC';
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
      console.log('error', error);
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
  //Method called for generating bulk product upload excel file
  //Model models/Product.js, models/Category.js
  generateExcel: async (req, res) => {
    console.log(req.query);
    if (!req.query.user_id) {
      return res.badRequest('Invalid Request');
    }
    try {

      const user = await User.findOne({
        id: req.query.user_id,
        deletedAt: null
      }).populate('group_id', {deletedAt: null});

      if (!user || !user.group_id) {
        return res.badRequest('Invalid Request');
      }
      //admin owner
      console.log('user', user);

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
      const brandSheet = wb.addWorksheet('Brand', options);
      const wareHouseSheet = wb.addWorksheet('Warehouse', options);

      /* Fetch Category List */
      let categoryList = await Category.find({
        where: {type_id: 2, deletedAt: null, parent_id: 0},
        sort: 'name ASC'
      });

      if (categoryList && categoryList.length > 0) {
        const categoryLen = categoryList.length;
        let categoryRowIndex = 1;
        for (let cat = 0; cat < categoryLen; cat++) {
          let categoryLabel = categoryList[cat].name;
          categorySheet.cell(categoryRowIndex, 1).string(escapeExcel(categoryLabel) + '|' + categoryList[cat].id);
          categoryRowIndex++;
          let subCategoryList = await Category.find({
            where: {type_id: 2, deletedAt: null, parent_id: categoryList[cat].id},
            sort: 'name ASC'
          });
          if (subCategoryList && subCategoryList.length > 0) {
            const subCategoryLen = subCategoryList.length;
            for (let subCat = 0; subCat < subCategoryLen; subCat++) {
              let subCategoryLabel = categoryLabel + '=>' + subCategoryList[subCat].name;
              categorySheet.cell(categoryRowIndex, 1).string(escapeExcel(subCategoryLabel) + '|' + categoryList[cat].id + ',' + subCategoryList[subCat].id);
              categoryRowIndex++;
              let subSubCategoryList = await Category.find({
                where: {type_id: 2, deletedAt: null, parent_id: subCategoryList[subCat].id},
                sort: 'name ASC'
              });

              if (subSubCategoryList && subSubCategoryList.length > 0) {
                const subSubCategoryLen = subSubCategoryList.length;
                for (let subSubCat = 0; subSubCat < subSubCategoryLen; subSubCat++) {
                  let subSubCategoryLabel = subCategoryLabel + '=>' + subSubCategoryList[subSubCat].name;
                  categorySheet.cell(categoryRowIndex, 1).string(escapeExcel(subSubCategoryLabel) + '|' + categoryList[cat].id + ',' + subCategoryList[subCat].id + ',' + subSubCategoryList[subSubCat].id);
                  categoryRowIndex++;
                }
              }
            }
          }
        }
      }

      /* Fetch Brand List */
      let brandList = await Brand.find({
        where: {deletedAt: null},
        sort: 'name ASC'
      });

      brandList.forEach((item, i) => {
        brandSheet.cell(i + 1, 1).string(escapeExcel(item.name) + '|' + item.id);
      });

      /* Fetch Brand List */
      let wareHouseList = await Warehouse.find({
        where: {deletedAt: null},
        sort: 'name ASC'
      });

      wareHouseList.forEach((item, i) => {
        wareHouseSheet.cell(i + 1, 1).string(escapeExcel(item.name) + '|' + item.id);
      });

      // Create a reusable style
      const headerStyle = wb.createStyle({
        font: {
          color: '#070c02',
          size: 14,
        },
      });

      const columnNamesObject = {
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
        'Tags': {width: 15},
        'Main Image': {width: 15},
        'Image 1': {width: 15},
        'Image 2': {width: 15},
        'Image 3': {width: 15},
        'Image 4': {width: 15},
        'Image 5': {width: 15}
      };

      if (user.group_id.name === 'owner') {
        delete columnNamesObject['Vendor Code'];
      }

      const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'];
      const columnNameKeys = Object.keys(columnNamesObject);

      const cNLen = columnNameKeys.length;
      for (let i = 0; i < cNLen; i++) {
        ws.column((i + 1)).setWidth(columnNamesObject[columnNameKeys[i]].width);
        ws.cell(1, (i + 1)).string(columnNameKeys[i]).style(headerStyle);
        if (typeof columnNamesObject[columnNameKeys[i]].validation !== 'undefined') {
          if (columnNamesObject[columnNameKeys[i]].validation === 'decimal') {
            ws.addDataValidation({
              type: 'decimal',
              allowBlank: false,
              sqref: letters[i] + '2:' + letters[i] + '10000',
            });
          } else if (columnNamesObject[columnNameKeys[i]].validation === 'list') {
            ws.addDataValidation({
              type: 'list',
              allowBlank: false,
              prompt: 'Choose from Dropdown',
              error: 'Invalid Choice was Chosen',
              showDropDown: true,
              sqref: letters[i] + '2:' + letters[i] + '10000',
              formulas: ['=' + columnNamesObject[columnNameKeys[i]].sheetName + '!$A:$A'],
            });
          }
        }
      }

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
  //Method called for creating bulk products
  //Model models/Product.js ,models/Category.js
  bulkUpload: async (req, res) => {
    if (!req.query.user_id) {
      return res.badRequest('Invalid Request');
    }
    try {

      const user = await User.findOne({
        id: req.query.user_id,
        deletedAt: null
      }).populate('group_id', {deletedAt: null});

      if (!user || !user.group_id) {
        return res.badRequest('Invalid Request');
      }

      const isApproved = parseInt(req.query.isApproved);

      const len = req.body.length;
      let problematicRow = 0;
      for (let i = 0; i < len; i++) {
        if (
          !(req.body[i].name !== '' && req.body[i].code !== '' && req.body[i].price !== '' && req.body[i].quantity !== '' &&
            req.body[i].category && req.body[i].category.indexOf('|') !== -1 && req.body[i].product_details !== '' && req.body[i].image !== '')
        ) {
          problematicRow = i + 1;
          break;
        } else if (user.group_id.name === 'admin' && (!req.body[i].warehouse_id && req.body[i].warehouse_id.indexOf('|') === -1)) {
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
          min_unit: 1,
          alert_quantity: 1,
          weight: item.weight ? parseFloat(item.weight) : null,
          image: item.image ? item.image : null,
        };
        newItem.additional_images = [];
        if (item.image1) {
          newItem.additional_images.push(item.image1);
        }
        if (item.image2) {
          newItem.additional_images.push(item.image2);
        }
        if (item.image3) {
          newItem.additional_images.push(item.image3);
        }
        if (item.image4) {
          newItem.additional_images.push(item.image4);
        }
        if (item.image5) {
          newItem.additional_images.push(item.image5);
        }

        let parts = item.category.split('|');
        const allCategoryIds = parts[1].trim();
        let categoryIdParts = allCategoryIds.split(',');

        const categoryColumns = ['type_id', 'category_id', 'subcategory_id'];
        for (let j = 0; j < categoryIdParts.length; j++) {
          newItem[categoryColumns[j]] = parseInt(categoryIdParts[j], 10);
        }

        if (item.product_details) {
          newItem.product_details = item.product_details.replace(new RegExp('\r?\n', 'g'), '<br />');
        }
        if (item.tag) {
          const tagArr = item.tag.split(',').map((t) => {
            return t.trim();
          });
          newItem.tag = JSON.stringify(tagArr);
        }

        if (item.brand_id && item.brand_id.indexOf('|') !== -1) {
          parts = item.brand_id.split('|');
          newItem.brand_id = parseInt(parts[1].trim());
        }

        newItem.price = parseFloat(item.price);
        newItem.vendor_price = parseFloat(item.vendor_price);
        newItem.featured = 0;

        if (item.promo_price > 0) {
          newItem.promotion = 1;
          newItem.promo_price = parseFloat(item.promo_price);
        } else {
          newItem.promotion = 0;
          newItem.promo_price = 0;
        }

        if (user.group_id.name === 'admin') {
          parts = item.warehouse_id.split('|');
          if (parts[1]) {
            newItem.warehouse_id = parseInt(parts[1].trim(), 10);
          }
        }

        if (isApproved !== 0 && user.group_id.name === 'admin') {
          newItem.approval_status = 2;
          newItem.approval_status_updated_by = newItem.created_by;
        } else {
          newItem.approval_status = 1;
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
      console.log(error);
      return res.status(400).json({
        success: false,
        message: 'error in bulk product upload',
        error
      });
    }
  }
};
