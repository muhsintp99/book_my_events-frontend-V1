import { IconDashboard } from '@tabler/icons-react';

const icons = { IconDashboard };

const bouncerdashboard = {
    id: 'bouncer-dashboard-group',
    title: 'Dashboard',
    type: 'group',
    children: [
        {
            id: 'bouncer-dashboard',
            title: 'Dashboard',
            type: 'item',
            url: '/bouncers/dashboard',
            icon: icons.IconDashboard,
            breadcrumbs: false
        }
    ]
};

export default bouncerdashboard;
