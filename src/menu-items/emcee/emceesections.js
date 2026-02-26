import { IconCategory } from '@tabler/icons-react';

const icons = { IconCategory };

const emceesections = {
    id: 'emcee-sections-group',
    title: 'Emcee Sections',
    type: 'group',
    children: [
        {
            id: 'emcee-category',
            title: 'Category',
            type: 'item',
            url: '/emcee/category',
            icon: icons.IconCategory,
            breadcrumbs: false
        }
    ]
};

export default emceesections;
