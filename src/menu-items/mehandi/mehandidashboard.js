import { IconDashboard } from '@tabler/icons-react';

const icons = { IconDashboard };

const mehandidashboard = {
    id: 'mehandi-dashboard-group',
    title: 'Dashboard',
    type: 'group',
    children: [
        {
            id: 'mehandi-dashboard',
            title: 'Dashboard',
            type: 'item',
            url: '/mehandi/dashboard',
            icon: icons.IconDashboard,
            breadcrumbs: false
        }
    ]
};

export default mehandidashboard;
