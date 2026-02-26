import {
    IconTicket
} from '@tabler/icons-react';

const icons = {
    IconTicket
};

const floristmanagement = {
    id: 'florist-management-group',
    title: 'Florist Management',
    type: 'group',
    children: [
      
        {
            id: 'FloristCoupons',
            title: 'Coupons',
            type: 'item',
            url: '/florist/coupons',
            icon: icons.IconTicket,
            breadcrumbs: false
        }
    ]
};

export default floristmanagement;