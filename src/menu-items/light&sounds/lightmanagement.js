import { IconTicket } from '@tabler/icons-react';

const icons = { IconTicket };

const lightmanagement = {
    id: 'light-management-group',
    title: 'Light & Sound Management',
    type: 'group',
    children: [
        {
            id: 'LightCoupons',
            title: 'Coupons',
            type: 'item',
            url: '/lights/coupons',
            icon: icons.IconTicket,
            breadcrumbs: false
        }
    ]
};

export default lightmanagement;
