import { IconDashboard } from '@tabler/icons-react';

const icons = { IconDashboard };

const lightdashboard = {
    id: 'light-dashboard-group',
    title: 'Dashboard',
    type: 'group',
    children: [
        {
            id: 'light-dashboard',
            title: 'Dashboard',
            type: 'item',
            url: '/lights/dashboard',
            icon: icons.IconDashboard,
            breadcrumbs: false
        }
    ]
};

export default lightdashboard;
