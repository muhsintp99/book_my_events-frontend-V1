// assets
import { IconMessageCircle } from '@tabler/icons-react';

// constant
const icons = { IconMessageCircle };

// ==============================|| ENQUIRIES MENU ITEM ||============================== //

const enquiriesmanagement = {
    id: 'enquiries-management-group',
    title: 'Enquiries',
    type: 'group',
    children: [
        {
            id: 'all-enquiries',
            title: 'All Enquiries',
            type: 'item',
            url: '/settings/enquiries',
            icon: icons.IconMessageCircle,
            breadcrumbs: false
        },
        {
            id: 'event-requests',
            title: 'Event Requests',
            type: 'item',
            url: '/settings/event-requests',
            icon: icons.IconMessageCircle,
            breadcrumbs: false
        }
    ]
};

export default enquiriesmanagement;
