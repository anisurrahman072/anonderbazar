import {Helper, asyncForEach, initLogPlaceholder, pagination} from '../../libs';

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

      /*sort................*/
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
  }
};
