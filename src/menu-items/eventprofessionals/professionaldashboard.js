import { IconDashboard } from '@tabler/icons-react';

const icons = { IconDashboard };

const professionaldashboard = {
    id: 'professional-dashboard-group',
    title: 'Dashboard',
    type: 'group',
    children: [
        {
            id: 'professional-dashboard',
            title: 'Dashboard',
            type: 'item',
            url: '/eventprofessionals/dashboard',
            icon: icons.IconDashboard,
            breadcrumbs: false
        }
    ]
};

export default professionaldashboard;
