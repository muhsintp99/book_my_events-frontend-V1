import { IconCategory } from '@tabler/icons-react';

const icons = { IconCategory };

const professionalsections = {
    id: 'professional-sections-group',
    title: 'Professional Sections',
    type: 'group',
    children: [
        {
            id: 'professional-category',
            title: 'Category',
            type: 'item',
            url: '/eventprofessionals/category',
            icon: icons.IconCategory,
            breadcrumbs: false
        }
    ]
};

export default professionalsections;
