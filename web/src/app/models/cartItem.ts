import {Product} from './product';
import {CartItemVariant} from './cartItemVariant';

export interface CartItem {
    id?: number;
    product_id: Product;
    product_quantity: number;
    product_total_price: number;
    cart_item_variants?: Array<CartItemVariant>;
}
