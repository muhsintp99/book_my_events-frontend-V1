import { IconBuildingSkyscraper, IconSettings, IconTools } from '@tabler/icons-react';

const icons = {
    IconBuildingSkyscraper,
    IconSettings,
    IconTools
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
            id: 'professional-list',
            title: 'Professional List',
            type: 'item',
            url: '/eventprofessionals/professionalList',
            icon: icons.IconTools,
            breadcrumbs: false
        },
    ]
};

export default ProfessionalProvidermanagement;
