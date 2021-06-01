export class GLOBAL_CONFIGS {
    public static cashPaymentOffFor = 428;
    public static productImageExtension = '.webp';
    public static bannerImageExtension = '.webp';
    public static otherImageExtension = '.webp';
    public static activePaymentMethods = {
        CashBack: true,
        Cash: true,
        SSLCommerce: true,
        bKash: true,
        Nagad: false
    };
    public static lotteryAdminId = 130;
    public static bkashTestUsers = [130, 2814];
}

export const PAYMENT_METHODS = {
    CASH_PAYMENT_TYPE: 'Cash',
    CASHBACK_PAYMENT_TYPE: 'CashBack',
    SSL_COMMERZ_PAYMENT_TYPE: 'SSLCommerce',
    BKASH_PAYMENT_TYPE: 'bKash',
    NAGAD_PAYMENT_TYPE: 'Nagad'
}
export const PAYMENT_METHODS_LABELS = {
    'Cash': 'Cash On Delivery',
    'cashBack': 'Cash Back',
    'SSLCommerce': 'SSLCOMMERZ Payment Gateway',
    'bKash': 'bKash Payment Gateway',
    'Nagad': 'Nagad Payment Gateway'
}
export const ORDER_STATUSES = {
    PENDING_ORDER: 1,
    PROCESSING_ORDER: 2,
    PREPARED_ORDER: 3,
    DEPARTURE_ORDER: 4,
    PICKUP_ORDER: 5,
    IN_THE_AIR_ORDER: 6,
    LANDED_ORDER: 7,
    ARRIVED_AT_WAREHOUSE_ORDER: 8,
    SHIPPED_ORDER: 9,
    OUT_FOR_DELIVERY_ORDER: 10,
    DELIVERED_ORDER: 11,
    CANCELED_ORDER: 12,
    CONFIRMED_ORDER: 13
}

export const PAYMENT_STATUS = {
    UNPAID: 1,
    PARTIALLY_PAID: 2,
    PAID: 3,
    NOT_APPLICABLE: 4
}

export const ORDER_TYPE = {
    REGULAR_ORDER: 1,
    PARTIAL_PAYMENT_ORDER: 2
}
