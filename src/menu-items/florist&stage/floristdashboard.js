import { IconDashboard } from '@tabler/icons-react';

const icons = { IconDashboard };

const floristdashboard = {
    id: 'florist-dashboard-group',
    title: 'Dashboard',
    type: 'group',
    children: [
        {
            id: 'florist-dashboard',
            title: 'Dashboard',
            type: 'item',
            url: '/florist/dashboard',
            icon: icons.IconDashboard,
            breadcrumbs: false
        }
    ]
};

export default floristdashboard;
