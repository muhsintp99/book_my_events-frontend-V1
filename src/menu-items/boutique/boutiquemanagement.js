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

const boutiquemanagement = {
    id: 'boutique-management-group',
    title: 'boutiqueManagement',
    type: 'group',
    children: [
        {
            id: 'Coupons',
            title: 'Coupons',
            type: 'item',
            url: '/boutique/coupons',
            icon: icons.IconTicket,
            breadcrumbs: false
        },
    ]
};

export default boutiquemanagement;
