/**
 * CartController
 *
 * @description :: Server-side logic for managing carts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const {asyncForEach} = require('../../libs');

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
  destroy: (req, res) => {
    Cart.update({id: req.param('id')}, {deletedAt: new Date()}).exec(
      (err, cart) => {
        if (err) {
          return res.json(err, 400);
        }
        return res.json(cart[0]);
      });
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
        });

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
          .populate('warehouse_id', {deletedAt: null})
          .populate('type_id', {deletedAt: null});

        _cartItem.product_id = associatedProduct.toJSON();

        let civ = await CartItemVariant.find({
          product_id: _cartItem.product_id.id,
          cart_item_id: _cartItem.id,
          deletedAt: null
        })
          .populate('variant_id', {deletedAt: null})
          .populate('warehouse_variant_id', {deletedAt: null})
          .populate('product_variant_id', {deletedAt: null});

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
        });

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

          data.cart_items.push(_cartItem);
        }

      });

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
