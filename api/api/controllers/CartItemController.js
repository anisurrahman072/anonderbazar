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
            Cart.find(cartItem[0].cart_id).exec(function (err, cart) {
                if (err) return res.json(err, 400);
                var requestPayload = [];
                requestPayload.push({
                    "total_price": cart[0].total_price - cartItem[0].product_total_price,
                    "total_quantity": cart[0].total_quantity - cartItem[0].product_quantity,
                });

                Cart.update({id: cartItem[0].cart_id}, requestPayload[0]).exec(function (err, cart) {
                    if (err) return res.json(err, 400);
                });
            });
            let cartItemVariants = await CartItemVariant.find({cart_item_id: cartItem[0].id});


            for (let i = 0; i < cartItemVariants.length; i++) {
                await  CartItemVariant.update({id: cartItemVariants[i].id}, {deletedAt: new Date()});
            }
            return res.json(cartItem);
        } catch (err) {
            return res.error(err);

        }

    },
    //Method called for deleting cart item data
    //Model models/CartItem.js
    destroyFromController: async function (req) {

        try {
            let cartItem = await CartItem.update({id: req}, {deletedAt: new Date()});

            Cart.find(cartItem[0].cart_Id).exec(function (err, cart) {
                if (err) return err;
                var requestPayload = [];
                requestPayload.push({
                    "total_price": cart[0].total_price - cartItem[0].product_total_price,
                    "total_quantity": cart[0].total_quantity - cartItem[0].product_quantity,
                });

                Cart.update({id: cartItem[0].cart_id}, requestPayload[0]).exec(function (err, cart) {
                    if (err) return err;
                });
            });
            let cartItemVariants = await CartItemVariant.find({cart_item_id: cartItem[0].id});

            for (let i = 0; i < cartItemVariants.length; i++) {
                await  CartItemVariant.update({id: cartItemVariants[i].id}, {deletedAt: new Date()});
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
            .then(function (cartItem) {
                var cartItemVariantData = CartItemVariant.find({cart_item_id: cartItem.id})
                    .populate('warehouse_variant_id')
                    .populate('product_variant_id')
                    .populate('variant_id')
                    .then(function (cartItemVariant) {
                        return cartItemVariant;
                    });
                return [cartItem, cartItemVariantData];
            })
            .spread(function (cartItem, cartItemVariants) {
                var newJson = {};
                newJson.cartItem = cartItem;
                newJson.cartItem.cart_item_variants = cartItemVariants;
                return res.json(newJson);
            });
    },
    //Method called for creating cart item data
    //Model models/CartItem.js
    create: async function(req, res) {
            var cartItem = await CartItem.find({ cart_id: req.body.cart_id, product_id: req.body.product_id, deletedAt:null});

            if(cartItem && cartItem.length>0){
                var cartItemID=0;
                var cartItemVariantsLength=0;
                for (var h = 0; h < cartItem.length; h++) {
                    if (req.body.cartItemVariants && req.body.cartItemVariants != "[]") {
                        var cartItemVariants = req.body.cartItemVariants;
                        cartItemVariantsLength=cartItemVariants.length;
                        for (var i = 0; i < cartItemVariants.length; i++) {
                            if(cartItemID>0 && cartItemVariants.length == (i+1) && cartItemVariantsLength<1){
                                continue;
                            }else {
                                var cartItemVar = cartItemVariants[i];
                                cartItemVar.cart_item_id = cartItem[h].id;
                                cartItemVar.product_id = cartItem[h].product_id;
                                var cartvariant = await CartItemVariant.find(cartItemVar);

                                if (cartvariant && cartvariant[0]) {
                                    cartItemID = cartItem[h].id;
                                    cartItemVariantsLength -= 1;
                                }
                            }
                        }
                    }else{
                        cartItemID = cartItem[h].id;
                    }
                }
                if(cartItemID>0 && cartItemVariantsLength==0){
                    var cartItemBody={};

                    var cartItem = await CartItem.find({ id: cartItemID });
                    await Cart.find(req.body.cart_id).exec(function (err, cart) {
                        if (err) return res.json(err, 400);
                        var requestPayload = [];
                        requestPayload.push({
                            "total_price": cart[0].total_price + req.body.product_total_price,
                            "total_quantity": cart[0].total_quantity + req.body.product_quantity,
                        });
                        Cart.update({id: req.body.cart_id}, requestPayload[0]).exec(function (err, cart) {
                            if (err) return res.json(err, 400);
                        });
                    });
                    cartItemBody.product_quantity=cartItem[0].product_quantity+req.body.product_quantity;
                    cartItemBody.product_total_price=cartItem[0].product_total_price+req.body.product_total_price;
                    cartItem = await CartItem.update({ id: cartItemID}, cartItemBody);
                }else{
                    var cartItem = await CartItem.create(req.body);
                    if (req.body.cartItemVariants && req.body.cartItemVariants != "[]") {
                        var cartItemVariants = req.body.cartItemVariants;
                        for (var i = 0; i < cartItemVariants.length; i++) {
                            var cartItemVar = cartItemVariants[i];
                            cartItemVar.cart_item_id = cartItem.id;
                            cartItemVar.product_id = cartItem.product_id;
                            await CartItemVariant.create(cartItemVar);
                        }
                    }
                }

            }else {
                var cartItem = await CartItem.create(req.body);
                if (req.body.cartItemVariants && req.body.cartItemVariants != "[]") {
                    var cartItemVariants = req.body.cartItemVariants;
                    for (var i = 0; i < cartItemVariants.length; i++) {
                        var cartItemVar = cartItemVariants[i];
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
    update: async function(req, res) {
      try {
        var cartItem = await CartItem.find({ id: req.param("id") });
          var product_quantity=cartItem[0].product_quantity-req.body.product_quantity;
          var product_total_price=cartItem[0].product_total_price-req.body.product_total_price;
        Cart.find(cartItem[0].cart_id).exec(function (err, cart) {
            if (err) return res.json(err, 400);
            var requestPayload = [];
            requestPayload.push({
                "total_price": cart[0].total_price - product_total_price,
                "total_quantity": cart[0].total_quantity - product_quantity,
            });

            Cart.update({id: cartItem[0].cart_id}, requestPayload[0]).exec(function (err, cart) {
                if (err) return res.json(err, 400);
            });
        });

        cartItem = await CartItem.update({ id: req.param("id") }, req.body);
        return res.json(cartItem);
    } catch (err) {
        return res.error(err);

    }
  }
};

