import { IconBuildingSkyscraper, IconSettings, IconMessageCircle } from '@tabler/icons-react';

const icons = {
    IconBuildingSkyscraper,
    IconSettings,
    IconMessageCircle
};

const ProfessionalProvidermanagement = {
    id: 'professional-provider-management',
    title: 'Provider Management',
    type: 'group',
    children: [
        {
            id: 'professional-providers-list',
            title: 'Providers List',
            type: 'item',
            url: '/eventprofessionals/professionalprovider',
            icon: icons.IconBuildingSkyscraper,
            breadcrumbs: false
        },
        {
            id: 'professionaladd',
            title: 'Add Providers',
            type: 'item',
            url: '/eventprofessionals/AddProvider',
            icon: icons.IconSettings,
            breadcrumbs: false
        },
        {
            id: 'professional-enquiries',
            title: 'Enquiries',
            type: 'item',
            url: '/eventprofessionals/enquiries',
            icon: icons.IconMessageCircle,
            breadcrumbs: false
        },
    ]
};

export default ProfessionalProvidermanagement;
