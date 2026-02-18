import { IconDashboard } from '@tabler/icons-react';

const icons = { IconDashboard };

const dashboard = {
    id: 'boutique-dashboard',
    title: 'Dashboard',
    type: 'group',
    children: [
        {
            id: 'default',
            title: 'Dashboard',
            type: 'item',
            url: '/boutique/dashboard',
            icon: icons.IconDashboard,
            breadcrumbs: false
        }
    ]
};

export default dashboard;
