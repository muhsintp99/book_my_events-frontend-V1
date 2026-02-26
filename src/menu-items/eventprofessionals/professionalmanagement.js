import { IconTicket } from '@tabler/icons-react';

const icons = { IconTicket };

const professionalmanagement = {
    id: 'professional-management-group',
    title: 'Professional Management',
    type: 'group',
    children: [
        {
            id: 'ProfessionalCoupons',
            title: 'Coupons',
            type: 'item',
            url: '/eventprofessionals/coupons',
            icon: icons.IconTicket,
            breadcrumbs: false
        }
    ]
};

export default professionalmanagement;
