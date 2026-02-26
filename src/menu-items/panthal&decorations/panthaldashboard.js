import { IconDashboard } from '@tabler/icons-react';

const icons = { IconDashboard };

const panthaldashboard = {
    id: 'panthal-dashboard-group',
    title: 'Dashboard',
    type: 'group',
    children: [
        {
            id: 'panthal-dashboard',
            title: 'Dashboard',
            type: 'item',
            url: '/panthal/dashboard',
            icon: icons.IconDashboard,
            breadcrumbs: false
        }
    ]
};

export default panthaldashboard;
