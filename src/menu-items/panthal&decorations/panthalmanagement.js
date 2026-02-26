import { IconTicket } from '@tabler/icons-react';

const icons = { IconTicket };

const panthalmanagement = {
    id: 'panthal-management-group',
    title: 'Panthal Management',
    type: 'group',
    children: [
        {
            id: 'PanthalCoupons',
            title: 'Coupons',
            type: 'item',
            url: '/panthal/coupons',
            icon: icons.IconTicket,
            breadcrumbs: false
        }
    ]
};

export default panthalmanagement;
