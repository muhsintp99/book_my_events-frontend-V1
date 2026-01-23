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

const ornamentsmanagement = {
    id: 'ornaments-management-group',
    title: 'ornamentsManagement',
    type: 'group',
    children: [
        {
            id: 'Coupons',
            title: 'Coupons',
            type: 'item',
            url: '/ornaments/coupons',
            icon: icons.IconTicket,
            breadcrumbs: false
        },
    ]
};

export default ornamentsmanagement;
