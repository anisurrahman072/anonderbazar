type GlobalConfigs = {
    ORDER_STATUSES: any[];
    ORDER_STATUSES_KEY_VALUE: Object;
    SUB_ORDER_STATUSES: any[];
    SUB_ORDER_STATUSES_KEY_VALUE: Object;
}

export const GLOBAL_CONFIGS = {
    ORDER_STATUSES: [
        {value: 1, label: 'Pending', icon: 'anticon-spin anticon-loading'},
        {value: 2, label: 'Processing', icon: 'anticon-spin anticon-loading'},
        {value: 3, label: 'Prepared', icon: 'anticon-check-circle'},
        {value: 4, label: 'Departure', icon: 'anticon-check-circle'},
        {value: 5, label: 'Pickup', icon: 'anticon-check-circle'},
        {value: 6, label: 'In the Air', icon: 'anticon-check-circle'},
        {value: 7, label: 'Landed', icon: 'anticon-check-circle'},
        {value: 8, label: 'Arrived At Warehouse', icon: 'anticon-check-circle'},
        {value: 9, label: 'Shipped', icon: 'anticon-spin anticon-hourglass'},
        {value: 10, label: 'Out For Delivery', icon: 'anticon-check-circle'},
        {value: 11, label: 'Delivered', icon: 'anticon-check-circle'},
        {value: 12, label: 'Canceled', icon: 'anticon-close-circle'},
        {value: 13, label: 'Confirmed', icon: 'anticon-check-circle'},
    ],
    ORDER_STATUSES_KEY_VALUE: {
        1: 'Pending',
        2: 'Processing',
        3: 'Prepared',
        4: 'Departure',
        5: 'Pickup',
        6: 'In the Air',
        7: 'Landed',
        8: 'Arrived At Warehouse',
        9: 'Shipped',
        10: 'Out For Delivery',
        11: 'Delivered',
        12: 'Canceled',
        13: 'Confirmed'
    },
    ORDER_STATUSES_MAPPING: {
        pending: 1,
        processing: 2,
        prepared: 3,
        departure: 4,
        pickup: 5,
        in_the_air: 6,
        landed: 7,
        arrived_at_warehouse: 8,
        shipped: 9,
        out_for_delivery: 10,
        delivered: 11,
        canceled: 12,
        confirmed: 13
    },
    SUB_ORDER_STATUSES: [
        {value: 1, label: 'Pending', icon: 'anticon-spin anticon-loading'},
        {value: 2, label: 'Processing', icon: 'anticon-spin anticon-loading'},
        {value: 3, label: 'Prepared', icon: 'anticon-check-circle'},
        {value: 4, label: 'Departure', icon: 'anticon-check-circle'},
        {value: 5, label: 'Pickup', icon: 'anticon-check-circle'},
        {value: 6, label: 'In the Air', icon: 'anticon-check-circle'},
        {value: 7, label: 'Landed', icon: 'anticon-check-circle'},
        {value: 8, label: 'Arrived At Warehouse', icon: 'anticon-check-circle'},
        {value: 9, label: 'Shipped', icon: 'anticon-spin anticon-hourglass'},
        {value: 10, label: 'Out For Delivery', icon: 'anticon-check-circle'},
        {value: 11, label: 'Delivered', icon: 'anticon-check-circle'},
        {value: 12, label: 'Canceled', icon: 'anticon-close-circle'},
        {value: 13, label: 'Confirmed', icon: 'anticon-check-circle'},
    ],
    SUB_ORDER_STATUSES_KEY_VALUE: {
        1: 'Pending',
        2: 'Processing',
        3: 'Prepared',
        4: 'Departure',
        5: 'Pickup',
        6: 'In the Air',
        7: 'Landed',
        8: 'Arrived At Warehouse',
        9: 'Shipped',
        10: 'Out For Delivery',
        11: 'Delivered',
        12: 'Canceled',
        13: 'Confirmed'
    },
    SUB_ORDER_STATUSES_MAPPING: {
        pending: 1,
        processing: 2,
        prepared: 3,
        departure: 4,
        pickup: 5,
        in_the_air: 6,
        landed: 7,
        arrived_at_warehouse: 8,
        shipped: 9,
        out_for_delivery: 10,
        delivered: 11,
        canceled: 12,
        confirmed: 13
    },
    INVESTOR_STATUS: [
        {value: 1, label: 'Pending'},
        {value: 2, label: 'Processing'},
        {value: 3, label: 'Confirmed'}
    ],
    CUSTOMER_STATUS: [
        {value: 0, label: 'Banned'},
        {value: 1, label: 'Unbanned'},
    ],
    REFUND_STATUS: [
        {value: 0, label: 'Not Refunded'},
        {value: 1, label: 'Refunded'},
    ],
    PAYMENT_STATUS: [
        {value: 1, label: 'Unpaid'},
        {value: 2, label: 'Partially paid'},
        {value: 3, label: 'Paid'},
    ],
    ORDER_TYPE: [
        {value: 1, label: 'Regular order'},
        {value: 2, label: 'Partial order'},
    ],
    PAYMENT_TYPES: [
        'Cash',
        'CashBack',
        'SSLCommerce',
        'bKash',
        'OfflinePay'
    ],
    PAYMENT_APPROVAL_STATUS_TYPES: [
        {value: 1, label: 'Pending'},
        {value: 2, label: 'Approved'},
        {value: 3, label: 'Rejected'}
    ],
    PAYMENT_STATUS_CHANGE_ADMIN_USER: 9424,
    ORDER_STATUS_CHANGE_ADMIN_USER: 9425,
    PRODUCT_UPDATE_ADMIN_USER: 9426
};

export const ORDER_TYPE = {
    REGULAR_ORDER_TYPE: 1,
    PARTIAL_ORDER_TYPE: 2
}

export const PAYMENT_STATUS = {
    UNPAID_PAYMENT_STATUS: 1,
    PARTIALLY_PAID_PAYMENT_STATUS: 2,
    PAID_PAYMENT_STATUS: 3,
    NOT_APPLICABLE_PAYMENT_STATUS: 4,
}

export const PAYMENT_METHODS = {
    CASH_PAYMENT_TYPE: 'Cash',
    CASHBACK_PAYMENT_TYPE: 'CashBack',
    SSL_COMMERZ_PAYMENT_TYPE: 'SSLCommerce',
    BKASH_PAYMENT_TYPE: 'bKash',
    NAGAD_PAYMENT_TYPE: 'Nagad',
    OFFLINE_PAYMENT_TYPE: 'OfflinePay'
}

export const OFFLINE_PAYMENT_METHODS = {
    CASH_IN_ADVANCE: 'cashInAdvance',
    BANK_TRANSFER: 'bankTransfer',
    BANK_DEPOSIT: 'bankDeposit',
    MOBILE_TRANSFER: 'mobileTransfer'
}

export const PAYMENT_APPROVAL_STATUS_TYPES = {
    PENDING: 1,
    APPROVED: 2,
    REJECTED: 3
}
