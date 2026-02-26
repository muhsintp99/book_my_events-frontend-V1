import {
    IconTicket
} from '@tabler/icons-react';

const icons = {
    IconTicket
};

const invitationmanagement = {
    id: 'invitation-management-group',
    title: 'Invitation Management',
    type: 'group',
    children: [
      
        {
            id: 'InvitationCoupons',
            title: 'Coupons',
            type: 'item',
            url: '/invitation/coupons',
            icon: icons.IconTicket,
            breadcrumbs: false
        }
    ]
};

export default invitationmanagement;