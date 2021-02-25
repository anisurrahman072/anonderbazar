exports.calcCartTotal = function (cart, cartItems) {
  let grandOrderTotal = 0;
  let totalQty = 0;
  cartItems.forEach((cartItem) => {
    if (cartItem.product_id && cartItem.product_id.id && cartItem.product_quantity > 0) {
      grandOrderTotal += cartItem.product_total_price;
      totalQty += cartItem.product_quantity;
    }
  });
  return {
    grandOrderTotal,
    totalQty
  };
};
