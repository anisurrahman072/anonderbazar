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
        Nagad: true,
        OfflinePay: true
    };
    public static lotteryAdminId = 130;
    public static bkashTestUsers = [130, 2814];
    public static nagadTestUsers = [130, 2814];
    public static partialMinimumFirstPaymentAmount = 2000;
}

export const PAYMENT_METHODS = {
    CASH_PAYMENT_TYPE: 'Cash',
    CASHBACK_PAYMENT_TYPE: 'CashBack',
    SSL_COMMERZ_PAYMENT_TYPE: 'SSLCommerce',
    BKASH_PAYMENT_TYPE: 'bKash',
    NAGAD_PAYMENT_TYPE: 'Nagad',
    OFFLINE_PAYMENT_TYPE: 'OfflinePay',
    ADMIN_PAYMENT_TYPE: 'AdminPayment'
}
export const PAYMENT_METHODS_LABELS = {
    'Cash': 'Cash On Delivery',
    'cashBack': 'Cash Back',
    'SSLCommerce': 'SSLCOMMERZ Payment Gateway',
    'bKash': 'bKash Payment Gateway',
    'Nagad': 'Nagad Payment Gateway'
}
/*export const ORDER_STATUSES = {
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
}*/

export const ORDER_STATUSES = {
    PENDING_ORDER: 1,
    PROCESSING_ORDER: 2,
    RETURNED: 3,
    LOST: 4,
    REFUND_PROCESSING: 5,
    REFUNDED: 6,
    PROCESSED: 7,
    ARRIVED_AT_WAREHOUSE_ORDER: 8,
    SHIPPED_ORDER: 9,
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

export const WAREHOUSE_STATUS = {
    PENDING: 0,
    PROCESSING: 1,
    ACTIVE: 2,
    INACTIVE: 3
}

export const PAYMENT_APPROVAL_STATUS = {
    PENDING: 1,
    APPROVED: 2,
    REJECTED: 3
}

export const OFFLINE_PAYMENT_METHODS = {
    CASH_IN_ADVANCE: 'cashInAdvance',
    BANK_TRANSFER: 'bankTransfer',
    BANK_DEPOSIT: 'bankDeposit',
    MOBILE_TRANSFER: 'mobileTransfer'
}
