import { IconDashboard } from '@tabler/icons-react';

const icons = { IconDashboard };

const rentaldashboard = {
    id: 'rental-dashboard-group',
    title: 'Dashboard',
    type: 'group',
    children: [
        {
            id: 'rental-dashboard',
            title: 'Dashboard',
            type: 'item',
            url: '/rental/dashboard',
            icon: icons.IconDashboard,
            breadcrumbs: false
        }
    ]
};

export default rentaldashboard;
