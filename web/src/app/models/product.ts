export interface Product {
  warehouse_id: any;
    id: number;
    name: string;
    image?: string;
    code?: string;
    status?: any;
    quantity?: any;
    price?: number;
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
    product_variants?: any
}
