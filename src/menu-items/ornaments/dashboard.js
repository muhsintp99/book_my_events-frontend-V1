import { IconDashboard } from '@tabler/icons-react';

const icons = { IconDashboard };

const dashboard = {
    id: 'ornaments-dashboard',
    title: 'Dashboard',
    type: 'group',
    children: [
        {
            id: 'default',
            title: 'Dashboard',
            type: 'item',
            url: '/ornaments/dashboard',
            icon: icons.IconDashboard,
            breadcrumbs: false
        }
    ]
};

export default dashboard;
