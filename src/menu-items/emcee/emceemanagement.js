import { IconTicket } from '@tabler/icons-react';

const icons = { IconTicket };

const emceemanagement = {
    id: 'emcee-management-group',
    title: 'Emcee Management',
    type: 'group',
    children: [
        {
            id: 'EmceeCoupons',
            title: 'Coupons',
            type: 'item',
            url: '/emcee/coupons',
            icon: icons.IconTicket,
            breadcrumbs: false
        }
    ]
};

export default emceemanagement;
