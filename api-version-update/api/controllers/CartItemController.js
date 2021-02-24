/**
 * CartItemController
 *
 * @description :: Server-side logic for managing cart_items
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  //Method called for deleting cart item data
  //Model models/CartItem.js
  destroy: async function (req, res) {
    try {
      let cartItem = await CartItem.update({id: req.param('id')}, {deletedAt: new Date()});
      let cart = await Cart.find(cartItem[0].cart_id);

      if (!cart || cart.length === 0) {
        return res.badRequest('Cart Not Found!');
      }

      let requestPayload = {
        'total_price': cart[0].total_price - cartItem[0].product_total_price,
        'total_quantity': cart[0].total_quantity - cartItem[0].product_quantity,
      };

      await Cart.update({id: cartItem[0].cart_id}, requestPayload);

      let cartItemVariants = await CartItemVariant.find({cart_item_id: cartItem[0].id});

      for (let i = 0; i < cartItemVariants.length; i++) {
        await CartItemVariant.update({id: cartItemVariants[i].id}, {deletedAt: new Date()});
      }

      return res.json(cartItem);

    } catch (err) {
      console.log(err);
      return res.error(err);
    }
  },
  //Method called for deleting cart item data
  //Model models/CartItem.js
  destroyFromController: async function (req) {

    try {
      let cartItem = await CartItem.update({id: req}, {deletedAt: new Date()});

      Cart.find(cartItem[0].cart_Id).exec((err, cart) => {
        if (err) {return err;}
        var requestPayload = [];
        requestPayload.push({
          'total_price': cart[0].total_price - cartItem[0].product_total_price,
          'total_quantity': cart[0].total_quantity - cartItem[0].product_quantity,
        });

        Cart.update({id: cartItem[0].cart_id}, requestPayload[0]).exec((err, cart) => {
          if (err) {return err;}
        });
      });
      let cartItemVariants = await CartItemVariant.find({cart_item_id: cartItem[0].id});

      for (let i = 0; i < cartItemVariants.length; i++) {
        await CartItemVariant.update({id: cartItemVariants[i].id}, {deletedAt: new Date()});
      }
      return cartItem;
    } catch (err) {
      return err;
    }

  },
  //Method called for getting cart items data by cart id
  //Model models/CartItem.js
  bycartid: function (req, res) {
    CartItem.findOne({id: req.param('id')})
      .populate('product_id')
      .populate('cart_id')
      .populate('cart_item_variants')
      .then((cartItem) => {
        var cartItemVariantData = CartItemVariant.find({cart_item_id: cartItem.id})
          .populate('warehouse_variant_id')
          .populate('product_variant_id')
          .populate('variant_id')
          .then((cartItemVariant) => {
            return cartItemVariant;
          });
        return [cartItem, cartItemVariantData];
      })
      .spread((cartItem, cartItemVariants) => {
        var newJson = {};
        newJson.cartItem = cartItem;
        newJson.cartItem.cart_item_variants = cartItemVariants;
        return res.json(newJson);
      });
  },
  //Method called for creating cart item data
  //Model models/CartItem.js
  create: async function (req, res) {
    if (!req.body.cart_id || !req.body.product_id) {
      return res.badRequest('Invalid data Provided');
    }

    let cartItems = await CartItem.find({cart_id: req.body.cart_id, product_id: req.body.product_id, deletedAt: null});
    let cartItem = null;

    if (cartItems && cartItems.length > 0) {
      let selectedCartItem = null;
      let cartItemVariantsLength = 0;

      if (req.body.cartItemVariants && req.body.cartItemVariants !== '[]') {
        const cartItemLen = cartItems.length;
        for (let h = 0; h < cartItemLen; h++) {
          let cartItemVariants = req.body.cartItemVariants;
          cartItemVariantsLength = cartItemVariants.length;
          for (let i = 0; i < cartItemVariants.length; i++) {
            if (!(selectedCartItem !== null && cartItemVariants.length === (i + 1) && cartItemVariantsLength < 1)) {
              let cartItemVar = cartItemVariants[i];
              cartItemVar.cart_item_id = cartItems[h].id;
              cartItemVar.product_id = cartItems[h].product_id;
              let cartvariant = await CartItemVariant.find(cartItemVar);

              if (cartvariant && cartvariant.length > 0 && cartvariant[0]) {
                selectedCartItem = cartItems[h];
                cartItemVariantsLength -= 1;
              }
            }
          }
        }
      } else {
        selectedCartItem = cartItems[0];
      }

      if (selectedCartItem !== null && cartItemVariantsLength === 0) {

        let cart = await Cart.findOne({
          id: req.body.cart_id
        });

        let requestPayload = {
          'total_price': cart.total_price + req.body.product_total_price,
          'total_quantity': cart.total_quantity + req.body.product_quantity,
        };

        await Cart.update({id: req.body.cart_id}, requestPayload);

        let cartItemBody = {};
        cartItemBody.product_quantity = selectedCartItem.product_quantity + req.body.product_quantity;
        cartItemBody.product_total_price = selectedCartItem.product_total_price + req.body.product_total_price;

        cartItem = await CartItem.update({id: selectedCartItem.id}, cartItemBody);

      } else {

        cartItem = await CartItem.create(req.body);

        if (req.body.cartItemVariants && req.body.cartItemVariants !== '[]') {
          let cartItemVariants = req.body.cartItemVariants;
          for (let i = 0; i < cartItemVariants.length; i++) {
            let cartItemVar = cartItemVariants[i];
            cartItemVar.cart_item_id = cartItem.id;
            cartItemVar.product_id = cartItem.product_id;
            await CartItemVariant.create(cartItemVar);
          }
        }
      }

    } else {

      cartItem = await CartItem.create(req.body);
      if (req.body.cartItemVariants && req.body.cartItemVariants !== '[]') {
        let cartItemVariants = req.body.cartItemVariants;
        for (let i = 0; i < cartItemVariants.length; i++) {
          let cartItemVar = cartItemVariants[i];
          cartItemVar.cart_item_id = cartItem.id;
          cartItemVar.product_id = cartItem.product_id;
          await CartItemVariant.create(cartItemVar);
        }
      }

    }
    return res.json(cartItem);
  },
  //Method called for updating cart item data
  //Model models/CartItem.js
  update: async function (req, res) {
    try {
      let cartItem = await CartItem.findOne({id: req.param('id')});
      if (!cartItem) {
        return res.badRequest('No Cart Item found');
      }

      let product_quantity = cartItem.product_quantity - req.body.product_quantity;
      let product_total_price = cartItem.product_total_price - req.body.product_total_price;

      const cart = await Cart.findOne({
        id: cartItem.cart_id
      });

      if (!cart) {
        return res.badRequest('No Cart found');
      }

      let requestPayload = {
        'total_price': cart.total_price - product_total_price,
        'total_quantity': cart.total_quantity - product_quantity,
      };

      await Cart.update({id: cartItem.cart_id}, requestPayload);

      cartItem = await CartItem.update({id: req.param('id')}, req.body);

      return res.json(cartItem);

    } catch (err) {
      return res.error(err);

    }
  }
};

