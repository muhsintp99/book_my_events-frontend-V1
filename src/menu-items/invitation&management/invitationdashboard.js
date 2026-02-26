import { IconDashboard } from '@tabler/icons-react';

const icons = { IconDashboard };

const invitationdashboard = {
    id: 'invitation-dashboard-group',
    title: 'Dashboard',
    type: 'group',
    children: [
        {
            id: 'invitation-dashboard',
            title: 'Dashboard',
            type: 'item',
            url: '/invitation/dashboard',
            icon: icons.IconDashboard,
            breadcrumbs: false
        }
    ]
};

export default invitationdashboard;
