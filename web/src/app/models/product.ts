export interface Product {
    warehouse_id: any;
    id: number;
    name: string;
    image?: string;
    code?: string;
    status?: any;
    quantity?: any;
    price?: number;
    is_coupon_product?: number;
    coupon_banner_images?: any;
    craftsman_price?: any;
    product_details?: any;
    rating?: any;
    featured?: boolean;
    promotion?: boolean;
    promo_price?: number;
    start_date?: any,
    produce_time?: any,
    last_order_completed_date?: any,
    end_date?: any,
    sale_unit?: number,
    product_variants?: any,
    brand_id?: any,
    type_id?: any,
    category_id?: any,
    product_images?: any,
    subcategory_id?: any
}
