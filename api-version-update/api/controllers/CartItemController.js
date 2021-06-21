/**
 * CartItemController
 *
 * @description :: Server-side logic for managing cart_items
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const {isResourceOwner} = require('../../libs/check-permissions');
module.exports = {

  //Method called for deleting cart item data
  //Model models/CartItem.js
  destroy: async (req, res) => {
    if (!req.param('id')) {
      return res.badRequest('Invalid data Provided');
    }
    let cartItem = await CartItem.findOne({id: req.param('id')}).populate('cart_id');
    if (!cartItem || !cartItem.cart_id) {
      return res.badRequest('Item does not exist in the cart');
    }

    const cart = cartItem.cart_id;

    console.log('req.token.userInfo', req.token.userInfo);
    console.log('cartItem', cartItem);

    if (!isResourceOwner(req.token.userInfo, cart)) {
      return res.forbidden();
    }

    try {
      const cartItem =
      await sails.getDatastore()
        .transaction(async (db) => {
          let cartItem = await CartItem.updateOne({id: req.param('id')}).set({deletedAt: new Date()}).usingConnection(db);

          let cartItemVariants = await CartItemVariant.find({cart_item_id: cartItem.id}).usingConnection(db);

          for (let i = 0; i < cartItemVariants.length; i++) {
            await CartItemVariant.update({id: cartItemVariants[i].id}).set({deletedAt: new Date()}).usingConnection(db);
          }

          let allCartItems = await CartItem.find({cart_id: cart.id, deletedAt: null}).usingConnection(db);
          let totalPrice = 0;
          let totalQty = 0;

          if (allCartItems && allCartItems.length > 0) {
            const cartItemLen = allCartItems.length;

            for (let i = 0; i < cartItemLen; i++) {
              totalPrice += allCartItems[i].product_total_price;
              totalQty += allCartItems[i].product_quantity;
            }
          }

          let cartPayload = {
            'total_price': totalPrice,
            'total_quantity': totalQty,
          };

          await Cart.update({id: cart.id}).set(cartPayload)
            .usingConnection(db);

          return cartItem;
        });

      return res.json({
        success: true,
        message: 'cart item successfully removed',
        data: cartItem
      });

    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'Failed to remove item from cart',
        error
      });
    }
  },
  //Method called for deleting cart item data
  //Model models/CartItem.js
  destroyFromController: async (req) => {
    try {
      return res.json({message: 'Not Authorized'});
    } catch (error) {
      return res.json({error: error});
    }
    try {
      let cartItem = await CartItem.update({id: req}, {deletedAt: new Date()}).fetch();

      Cart.find(cartItem[0].cart_Id).exec((err, cart) => {
        if (err) {
          return err;
        }
        let requestPayload = [];
        requestPayload.push({
          'total_price': cart[0].total_price - cartItem[0].product_total_price,
          'total_quantity': cart[0].total_quantity - cartItem[0].product_quantity,
        });

        Cart.update({id: cartItem[0].cart_id}, requestPayload[0]).exec((err) => {
          if (err) {
            return err;
          }
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
  bycartid: async (req, res) => {
    try {
      const cartItem = await CartItem.findOne({id: req.param('id')})
        .populate('product_id')
        .populate('cart_id')
        .populate('cart_item_variants', {deletedAt: null});

      const cartItemVariantData = await CartItemVariant.find({cart_item_id: cartItem.id})
        .populate('warehouse_variant_id')
        .populate('product_variant_id')
        .populate('variant_id');

      let newJson = {};
      newJson.cartItem = cartItem;
      newJson.cartItem.cart_item_variants = cartItemVariantData;
      return res.json(newJson);
    } catch (error) {
      return res.json(error.status, {message: '', error, success: false});
    }
  },

  //Method called for creating cart item data
  //Model models/CartItem.js
  create: async (req, res) => {

    console.log(req.body);

    if (!req.body.cart_id || !req.body.product_id) {
      return res.badRequest('Invalid data Provided');
    }

    try {
      let cart = await Cart.findOne({
        id: req.body.cart_id
      });

      if (!cart) {
        return res.badRequest('Invalid data Provided');
      }

      let product = await Product.findOne({
        id: req.body.product_id
      });

      if (!product) {
        return res.badRequest('Invalid data Provided');
      }

      const quantityPassed = parseFloat(req.body.product_quantity);

      if (quantityPassed <= 0) {
        return res.badRequest('Invalid data Provided');
      }

      /*
      if (product.quantity < quantityPassed) {
        return res.badRequest('Product stock is not sufficient enough.');
      }
*/

      let productUnitPrice = product.price;
      if (product.promotion) {
        productUnitPrice = product.promo_price;
      }

      let cartItems = await CartItem.find({
        cart_id: req.body.cart_id,
        product_id: req.body.product_id,
        deletedAt: null
      });


      let selectedCartItem = null;
      let cartItemVariantsLength = 0;
      if (cartItems && cartItems.length > 0) {

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
      }
      let cartItem = null;
      await sails.getDatastore()
        .transaction(async (db) => {
          if (selectedCartItem !== null && cartItemVariantsLength === 0) {
            const finalQuantity = quantityPassed + selectedCartItem.product_quantity;
            let cartItemBody = {
              product_quantity: finalQuantity,
              product_total_price: productUnitPrice * finalQuantity
            };

            cartItem = await CartItem.updateOne({id: selectedCartItem.id}).set(cartItemBody)
              .usingConnection(db);

          } else {
            let cartItemBody = {
              cart_id: req.body.cart_id,
              product_id: req.body.product_id,
              product_quantity: quantityPassed,
              product_total_price: quantityPassed * productUnitPrice,
              product_unit_price: productUnitPrice
            };

            cartItem = await CartItem.create(cartItemBody).fetch().usingConnection(db);

            if (req.body.cartItemVariants && req.body.cartItemVariants !== '[]') {

              let cartItemVariants = req.body.cartItemVariants;
              for (let i = 0; i < cartItemVariants.length; i++) {
                let cartItemVar = cartItemVariants[i];
                cartItemVar.cart_item_id = cartItem.id;
                cartItemVar.product_id = cartItem.product_id;

                await CartItemVariant.create(cartItemVar).usingConnection(db);
              }
            }
          }
          let allCartItems = await CartItem.find({cart_id: cart.id, deletedAt: null}).usingConnection(db);
          let totalPrice = 0;
          let totalQty = 0;

          if (allCartItems && allCartItems.length > 0) {
            const cartItemLen = allCartItems.length;

            for (let i = 0; i < cartItemLen; i++) {
              totalPrice += allCartItems[i].product_total_price;
              totalQty += allCartItems[i].product_quantity;
            }
          }
          let cartPayload = {
            'total_price': totalPrice,
            'total_quantity': totalQty,
          };
          console.log('cartItem', cartItem);
          await Cart.update({id: cartItem.cart_id}).set(cartPayload)
            .usingConnection(db);
        });

      return res.json({
        success: true,
        message: 'cart successfully inserted',
        data: null
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'Failed to insert item into cart',
        error
      });
    }

  },
  //Method called for updating cart item data
  //Model models/CartItem.js
  update: async (req, res) => {

    if (!req.body.action_name) {
      return res.badRequest('Invalid Request!');
    }
    /*    if (!req.token || !req.token.userInfo) {
      return res.badRequest('Invalid Request!');
    }*/
    try {

      let cartItem = await CartItem.findOne({id: req.param('id')});

      if (!cartItem) {
        return res.badRequest('No Cart Item found');
      }

      const cart = await Cart.findOne({
        id: cartItem.cart_id
      });

      if (!cart) {
        return res.badRequest('No cart found');
      }

      /*      if (req.token.userInfo.id !== cart.user_id) {
        return res.status(401).json({err: 'You are not authorized to do it.'});
      }*/

      let quantityToChange = req.body.quantity ? parseFloat(req.body.quantity) : 1.0;

      if (quantityToChange <= 0) {
        return res.badRequest('Invalid quantity provided.');
      }

      const response = await sails.getDatastore()
        .transaction(async (db) => {

          let itemCurrentQuantity = cartItem.product_quantity;

          if (req.body.action_name === 'increase') {
            itemCurrentQuantity = itemCurrentQuantity + quantityToChange;
          } else if (req.body.action_name === 'decrease') {
            itemCurrentQuantity = itemCurrentQuantity - quantityToChange >= 0 ? itemCurrentQuantity - quantityToChange : 0;
          }

          let requestPayload = {
            'product_total_price': cartItem.product_unit_price * itemCurrentQuantity,
            'product_quantity': itemCurrentQuantity,
          };

          await CartItem.update({id: cartItem.id}).set(requestPayload)
            .usingConnection(db);

          let cartItems = await CartItem.find({cart_id: cartItem.cart_id, deletedAt: null}).usingConnection(db);
          let totalPrice = 0;
          let totalQty = 0;
          if (cartItems && cartItems.length > 0) {
            const cartItemLen = cartItems.length;

            for (let i = 0; i < cartItemLen; i++) {
              totalPrice += cartItems[i].product_total_price;
              totalQty += cartItems[i].product_quantity;
            }
          }
          requestPayload = {
            'total_price': totalPrice,
            'total_quantity': totalQty,
          };

          await Cart.update({id: cartItem.cart_id}).set(requestPayload)
            .usingConnection(db);

          return 'success';
        });

      return res.json({
        success: true,
        message: 'cart successfully updated',
        data: response
      });

    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'Failed to update cart',
        error
      });
    }
  }
};

