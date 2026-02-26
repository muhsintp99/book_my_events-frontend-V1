import { IconDashboard } from '@tabler/icons-react';

const icons = { IconDashboard };

const emceedashboard = {
    id: 'emcee-dashboard-group',
    title: 'Dashboard',
    type: 'group',
    children: [
        {
            id: 'emcee-dashboard',
            title: 'Dashboard',
            type: 'item',
            url: '/emcee/dashboard',
            icon: icons.IconDashboard,
            breadcrumbs: false
        }
    ]
};

export default emceedashboard;
