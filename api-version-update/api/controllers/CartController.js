/**
 * CartController
 *
 * @description :: Server-side logic for managing carts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const {asyncForEach} = require('../../libs/helper');
const {isResourceOwner} = require('../../libs/check-permissions');

module.exports = {
  create: (req, res) => {
    try {
      return res.json({message: 'Not Authorized'});
    } catch (error) {
      return res.json({error: error});
    }
  },
  update: (req, res) => {
    try {
      return res.json({message: 'Not Authorized'});
    } catch (error) {
      return res.json({error: error});
    }
  },
  //Method called for deleting cart data
  //Model models/Cart.js
  destroy: async (req, res) => {
    try {
      const foundCart = await Cart.findOne({
        id: req.param('id')
      });

      if (!isResourceOwner(req.token.userInfo, foundCart)) {
        return res.forbidden();
      }

      const cart = await Cart.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      return res.json(cart);
    } catch (error) {
      return res.json({error: error});
    }

  },
  //Method called for getting authenticated customer cart
  //Model models/Cart.js
  authUserCart: async (req, res) => {

    if (!req.token || !req.token.userInfo) {
      return res.error('error');
    }

    try {

      let cart = await Cart.findOne({
        user_id: req.token.userInfo.id,
        deletedAt: null
      });

      if (!cart) {
        let cart = await Cart.create({
          user_id: req.param('user_id'),
          ip_address: '',
          total_quantity: 0,
          total_price: 0,
          status: 1
        }).fetch();

        let data = Object.assign({}, cart);
        data.cart_items = [];

        return res.json({
          success: true,
          message: 'new cart created',
          data
        });
      }

      let data = Object.assign({}, cart);
      data.cart_items = [];

      let cartItems = await CartItem.find({
        cart_id: cart.id,
        deletedAt: null
      });

      await asyncForEach(cartItems, async _cartItem => {
        let associatedProduct = await Product.findOne({id: _cartItem.product_id})
          .populate('product_images', {deletedAt: null})
          .populate('warehouse_id')
          .populate('type_id');

        _cartItem.product_id = associatedProduct.toJSON();

        let civ = await CartItemVariant.find({
          product_id: _cartItem.product_id.id,
          cart_item_id: _cartItem.id,
          deletedAt: null
        })
          .populate('variant_id')
          .populate('warehouse_variant_id')
          .populate('product_variant_id');

        if (civ.length > 0) {
          _cartItem.cartitemvariant = civ;
        } else {
          _cartItem.cartitemvariant = {};
        }

        data.cart_items.push(_cartItem);
      });

      return res.json({
        success: true,
        message: 'cart found',
        data
      });
    } catch (err) {
      console.log('err', err);
      return res.status(400).json({
        success: false,
        message: 'no cart found',
        error
      });
    }
  },
  //Method called for getting cart items data by cart id
  //Model models/Cart.js and models/CartItem.js
  findwithcartItems: async (req, res) => {
    try {
      if (!req.param('user_id')) {
        return res.badRequest('Invalid Request');
      }

      let cart = await Cart.findOne({
        user_id: req.param('user_id'),
        deletedAt: null
      });

      if (!cart) {
        let cart = await Cart.create({
          user_id: req.param('user_id'),
          ip_address: '',
          total_quantity: 0,
          total_price: 0,
          status: 1
        }).fetch();

        let data = Object.assign({}, cart);
        data.cart_items = [];

        return res.json({
          success: true,
          message: 'new cart created',
          data
        });
      }

      let data = Object.assign({}, cart);
      data.cart_items = [];

      let cartItems = await CartItem.find({
        cart_id: cart.id,
        deletedAt: null
      });

      await asyncForEach(cartItems, async _cartItem => {
        let dd = await Product.findOne({id: _cartItem.product_id})
          .populate('product_images', {deletedAt: null})
          .populate('warehouse_id')
          .populate('type_id');

        if (dd) {
          _cartItem.product_id = dd.toJSON();

          let civ = await CartItemVariant.find({
            product_id: _cartItem.product_id.id,
            cart_item_id: _cartItem.id,
            deletedAt: null
          })
            .populate('variant_id')
            .populate('warehouse_variant_id')
            .populate('product_variant_id');

          if (civ.length > 0) {
            _cartItem.cartitemvariant = civ;
          } else {
            _cartItem.cartitemvariant = {};
          }


          /** Check weather the cart item is a valid item or not */
          if (_cartItem.product_id.approval_status == 2 && !_cartItem.product_id.deletedAt &&
            !_cartItem.product_id.warehouse_id.deletedAt && _cartItem.product_id.warehouse_id.status == 2) {
            data.cart_items.push(_cartItem);
          }
          else {
            let remainingQty = cart.total_quantity - _cartItem.product_quantity;
            data.total_quantity = remainingQty;

            let remainingTotalPrice = cart.total_price - _cartItem.product_total_price;
            data.total_price = remainingTotalPrice;

            await Cart.update({
              id: _cartItem.cart_id,
              deletedAt: null
            }).set({
              total_quantity: remainingQty,
              total_price: remainingTotalPrice
            });

            await CartItem.update({
              id: _cartItem.id,
              deletedAt: null
            }).set({
              deletedAt: new Date()
            }).fetch();

            await CartItemVariant.update({
              cart_item_id: _cartItem.id,
              deletedAt: null
            }).set({
              deletedAt: new Date()
            });
          }
          /** END */
        }
      });

      console.log('Final data: ', data);

      return res.json({
        success: true,
        message: 'cart found',
        data
      });

    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'no cart found',
        error
      });
    }
  },

  index: (req, res) => {
    try {
      return res.json({message: 'Not Authorized'});
    } catch (error) {
      return res.json({error: error});
    }
  },
};
