import { IconTicket } from '@tabler/icons-react';

const icons = { IconTicket };

const bouncermanagement = {
    id: 'bouncer-management-group',
    title: 'Bouncer Management',
    type: 'group',
    children: [
        {
            id: 'BouncerCoupons',
            title: 'Coupons',
            type: 'item',
            url: '/bouncers/coupons',
            icon: icons.IconTicket,
            breadcrumbs: false
        }
    ]
};

export default bouncermanagement;
