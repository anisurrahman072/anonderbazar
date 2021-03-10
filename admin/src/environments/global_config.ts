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
    }
};
