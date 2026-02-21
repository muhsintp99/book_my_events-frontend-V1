import {
    IconPhoto,
    IconTicket,
    IconBell
} from '@tabler/icons-react';

const icons = {
    IconPhoto,
    IconTicket,
    IconBell
};

const mehandimanagement = {
    id: 'mehandi-management-group',
    title: 'Mehandi Management',
    type: 'group',
    children: [
        {
            id: 'MehandiCoupons',
            title: 'Coupons',
            type: 'item',
            url: '/mehandi/coupons',
            icon: icons.IconTicket,
            breadcrumbs: false
        },
    ]
};

export default mehandimanagement;
